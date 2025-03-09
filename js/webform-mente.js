// Função para exibir mensagens de feedback
export function showFlashMessage(message, type) {
    const flashMessageDiv = document.getElementById('flashMessage');
    flashMessageDiv.textContent = message;
    flashMessageDiv.className = type; // 'error' ou 'success'
    flashMessageDiv.classList.remove('hidden');
    setTimeout(() => {
        flashMessageDiv.classList.add('hidden');
    }, 3000);
}

// Função para enviar dados para o Google Sheets
export async function sendToGoogleSheets(data) {
    const url = 'https://script.google.com/macros/s/AKfycbzdLpEgmmmlPFV_V-W0s9lF-f3QrtU4fBwmcQEAI5Et962tLFjsLms2FRSivtyYAx_3dA/exec';
    try {
        await fetch(url, {  // Removido 'const response ='
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        return { ok: true };

    } catch (error) {
        console.error('Erro ao enviar para o Google Sheets:', error);
        return { ok: false };
    }
}


// Função para inicializar o formulário (obtendo o CSRF token)
async function initializeForm() {
    const response = await fetch('/api/csrf-token');
    const data = await response.json();
    document.getElementById('csrf_token').value = data.csrfToken;
}

// Também precisamos exportar outras funções que são usadas globalmente
export function startSurvey() {
    const intro = document.getElementById('intro');
    const form = document.getElementById('myForm');

    if (intro && form) {
        intro.classList.add('hidden');
        form.classList.remove('hidden');
        initializeForm(); // Initialize the form with CSRF token
    }
}

export function autoNext() {
    const currentContainer = document.querySelector('.form-container.active');
    if (currentContainer) {
        // Removido código que chamava navigate() diretamente. A navegação é controlada por webform-mente-navigate.js
    }
}

// Make functions available globally
export function initializeGlobalFunctions() {
    window.startSurvey = startSurvey;
    window.autoNext = autoNext;
    window.showFlashMessage = showFlashMessage;
}
