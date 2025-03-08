import { showFlashMessage } from './js/webform-mente.js';

async function sendFormData(data) {
    try {
        // 1. Primeiro envio - Google Sheets
        showFlashMessage('Enviando para Google Sheets...', 'info');
        const googleResult = await sendToGoogleSheets(data);
        if (!googleResult.ok) {
            throw new Error('Falha no envio para Google Sheets');
        }
        showFlashMessage('Dados enviados para Google Sheets com sucesso!', 'success');

        // 2. Aguarda 1 segundo antes do próximo envio
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Segundo envio - Supabase
        showFlashMessage('Enviando para banco de dados...', 'info');
        const supabaseResult = await fetch('/api/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!supabaseResult.ok) {
            throw new Error('Falha no envio para Supabase');
        }
        showFlashMessage('Dados enviados para o banco com sucesso!', 'success');

        // 4. Aguarda mais 1 segundo antes do redirecionamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return true;
    } catch (error) {
        console.error('Erro no envio sequencial:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const myForm = document.getElementById('myForm');

    if (myForm) {
        myForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Desabilita o formulário durante o envio
            const submitButton = myForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            
            try {
                // Validação client-side
                if (!validateForm()) {
                    submitButton.disabled = false;
                    return;
                }

                const formData = new FormData(event.target);
                const data = {
                    A: sanitizeInput(formData.get('A')),
                    B: sanitizeInput(formData.get('B')),
                    C: sanitizeInput(formData.get('C')),
                    Nome: sanitizeInput(formData.get('Nome')),
                    Email: sanitizeInput(formData.get('Email')),
                    timestamp: new Date().toISOString(),
                    csrf_token: document.getElementById('csrf_token').value
                };

                // Envio sequencial com feedback
                await sendFormData(data);
                
                // Sucesso - redireciona para página de agradecimento
                showFlashMessage('Todos os dados foram enviados com sucesso!', 'success');
                setTimeout(() => {
                    window.location.href = 'obrigado.html';
                }, 1000);

            } catch (error) {
                console.error('Erro no processo de envio:', error);
                showFlashMessage('Erro ao enviar dados. Por favor, tente novamente.', 'error');
                submitButton.disabled = false;
            }
        });
    }
});

function validateForm() {
    // Validar campos obrigatórios
    const requiredFields = {
        'A': 'Cor favorita',
        'B': 'Animal favorito',
        'C': 'Estação favorita',
        'Nome': 'Nome completo',
        'Email': 'Email'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
        const value = document.querySelector(`[name="${field}"]`)?.value;
        if (!value || value.trim() === '') {
            showFlashMessage(`${label} é obrigatório`, 'error');
            return false;
        }
    }

    // Validar formato do email
    const email = document.querySelector('[name="Email"]').value;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        showFlashMessage('Email inválido', 'error');
        return false;
    }

    // Validar nome (apenas letras e espaços)
    const nome = document.querySelector('[name="Nome"]').value;
    const nomeRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    if (!nomeRegex.test(nome)) {
        showFlashMessage('Nome deve conter apenas letras', 'error');
        return false;
    }

    // Validar opções de múltipla escolha (A, B, C)
    const opcoes = ['A', 'B', 'C'];
    for (const opcao of opcoes) {
        const radioSelecionado = document.querySelector(`input[name="${opcao}"]:checked`);
        if (!radioSelecionado) {
            showFlashMessage(`Selecione uma opção para a pergunta ${opcao}`, 'error');
            return false;
        }
    }

    // Validar CSRF token
    const csrfToken = document.getElementById('csrf_token').value;
    if (!csrfToken) {
        showFlashMessage('Erro de segurança: Token CSRF ausente', 'error');
        return false;
    }

    return true;
}

function sanitizeInput(input) {
    if (!input) return '';
    
    // Remove caracteres especiais e HTML tags
    const sanitized = input
        .toString()
        .trim()
        .replace(/[<>]/g, '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

    return sanitized;
}

async function getCsrfToken() {
    const response = await fetch('/api/csrf-token');
    const data = await response.json();
    return data.csrfToken;
}
