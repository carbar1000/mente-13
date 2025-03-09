import { parse } from 'cookie';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Obter e validar o token CSRF
      const cookies = parse(req.headers.cookie || '');
      const csrfToken = cookies.csrf_token;
      
      if (!csrfToken || csrfToken !== req.body.csrf_token) {
          return res.status(403).json({ success: false, message: 'Token CSRF inválido.' });
        }

      // Sanitizar os dados (exemplo básico)
        const sanitizedData = {
          A: req.body.A,
          B: req.body.B,
          C: req.body.C,
          Nome: req.body.Nome,
          Email: req.body.Email,
          timestamp: req.body.timestamp,
        };

      // Enviar para o Supabase
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        return res.status(500).json({ success: false, message: 'Variáveis de ambiente do Supabase não configuradas.' });
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { error: supabaseError } = await supabase
        .from('respostas')
        .insert([
          { A: sanitizedData.A, B: sanitizedData.B, C: sanitizedData.C, nome: sanitizedData.Nome, email: sanitizedData.Email },
        ]);

      if (supabaseError) {
        console.error('Erro ao inserir no Supabase:', supabaseError);
        return res.status(500).json({ success: false, message: 'Erro ao inserir no Supabase.' });
      }

      return res.status(200).json({ success: true, message: 'Dados enviados com sucesso!' });
    } catch (error) {
      console.error('Erro ao processar a requisição:', error);
      return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  } else {
    res.status(405).json({ message: 'Método não permitido' });
  }
}
