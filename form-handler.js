import { showFlashMessage } from './js/webform-mente.js';

document.addEventListener('DOMContentLoaded', () => {
    const myForm = document.getElementById('myForm');

    if (myForm) {
        myForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Obter dados do formulário
            const formData = new FormData(myForm);
            const data = Object.fromEntries(formData.entries());

            // Adicionar timestamp
            data.timestamp = new Date().toISOString();

            // Enviar dados para a API
            try {
                const response = await fetch('/api/submit-form', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': data.csrf_token,
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Redirecionar para a página de agradecimento
                    window.location.href = '/obrigado.html';
                } else {
                    // Exibir mensagem de erro
                    showFlashMessage(result.message || 'Erro ao enviar o formulário.', 'error');
                }
            } catch (error) {
                console.error('Erro ao enviar o formulário:', error);
                showFlashMessage('Erro ao enviar o formulário.', 'error');
            }
        });
    }
});