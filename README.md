
# Webform-Mente

Formulário web para coleta de dados sobre perfil empreendedor.

## Configuração

1. Clone o repositório
```bash
git clone [seu-repositorio]
cd webform-mente
```

2. Configure as variáveis de ambiente no Vercel:
- SUPABASE_URL
- SUPABASE_ANON_KEY

3. Configure o Google Apps Script com o ID apropriado no `index.html`

## Desenvolvimento Local

Abra o `index.html` em um servidor local:
```bash
npx serve
```

## Deploy

O projeto está configurado para deploy automático no Vercel.

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy!

## Estrutura do Projeto

- `index.html` - Página principal do formulário
- `obrigado.html` - Página de agradecimento
- `webform-mente.css` - Estilos principais
- `webform-mente.js` - Lógica principal
- `form-handler.js` - Manipulação de envio do formulário
