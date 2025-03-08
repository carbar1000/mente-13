const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' }); // Especifica o arquivo .env.local

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Middleware para injetar variáveis de ambiente no HTML
app.get('*', (req, res, next) => {
    if (req.path.endsWith('.html')) {
        res.header('Content-Type', 'text/html');
        let html = require('fs').readFileSync(path.join(__dirname, req.path), 'utf8');
        
        // Injeta as variáveis de ambiente como objeto global
        const envScript = `
            <script>
                window.ENV = {
                    SUPABASE_URL: "${process.env.SUPABASE_URL}",
                    SUPABASE_ANON_KEY: "${process.env.SUPABASE_ANON_KEY}"
                };
            </script>
        `;
        
        // Insere o script antes do fechamento do </head>
        html = html.replace('</head>', `${envScript}</head>`);
        res.send(html);
    } else {
        next();
    }
});

// Rota para verificar as configurações do Supabase
app.get('/api/config-check', (req, res) => {
    const config = {
        hasUrl: !!process.env.SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_ANON_KEY,
        url: process.env.SUPABASE_URL
    };
    res.json(config);
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log('Configurações do Supabase carregadas:', {
        hasUrl: !!process.env.SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_ANON_KEY
    });
});
