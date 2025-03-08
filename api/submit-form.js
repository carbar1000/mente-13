import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { A, B, C, nome, email } = req.body;

            const { data, error } = await supabase
                .from('respostas')
                .insert([
                    { A, B, C, nome, email },
                ]);

            if (error) {
                throw error;
            }

            console.log('Dados enviados com sucesso para o Supabase:', data);
            res.status(200).json({ message: 'Dados enviados com sucesso para o Supabase', data });

        } catch (error) {
            console.error('Erro ao enviar para o Supabase:', error);
            res.status(500).json({ message: 'Erro ao enviar para o Supabase', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}