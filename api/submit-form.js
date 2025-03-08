import { createClient } from '@supabase/supabase-js';
import { parse } from 'cookie';
import { body, validationResult } from 'express-validator';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Responder a requisições OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            // Get CSRF token from request body and cookie
            const csrfTokenFromBody = req.body.csrf_token;
            const cookies = parse(req.headers.cookie || '');
            const csrfTokenFromCookie = cookies.csrf_token;

            // Validate CSRF token
            if (!csrfTokenFromBody || !csrfTokenFromCookie || csrfTokenFromBody !== csrfTokenFromCookie) {
                return res.status(400).json({ message: 'CSRF token validation failed' });
            }

            // Validate request body
            await Promise.all([
                body('A').notEmpty().trim().escape().run(req),
                body('B').notEmpty().trim().escape().run(req),
                body('C').notEmpty().trim().escape().run(req),
                body('nome').notEmpty().trim().escape().run(req),
                body('email').isEmail().normalizeEmail().run(req),
            ]);

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
            }

            const { A, B, C, nome, email } = req.body;

            const { data, error } = await supabase
                .from('respostas')
                .insert([
                    { A, B, C, nome, email },
                ])
                .select();

            if (error) throw error;

            return res.status(200).json({ 
                ok: true,
                message: 'Dados enviados com sucesso',
                data 
            });

        } catch (error) {
            console.error('Erro ao enviar para o Supabase:', error);
            return res.status(500).json({ 
                ok: false,
                message: 'Erro ao enviar dados',
                error: error.message 
            });
        }
    }

    return res.status(405).json({ message: 'Método não permitido' });
}
