function generateCSRFToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function initializeForm() {
    const csrfToken = generateCSRFToken();
    document.getElementById('csrf_token').value = csrfToken;
}

// UI Navigation Functions
function startSurvey() {
    const intro = document.getElementById('intro');
    const form = document.getElementById('myForm');
    
    if (intro && form) {
        intro.classList.add('hidden');
        form.classList.remove('hidden');
        initializeForm(); // Initialize the form with CSRF token
    }
}

function autoNext() {
    const currentContainer = document.querySelector('.form-container.active');
    if (currentContainer) {
        const nextButton = currentContainer.querySelector('button[onclick="navigate(1)"]');
        if (nextButton) {
            setTimeout(() => {
                nextButton.click();
            }, 500);
        }
    }
}

// Função de validação do formulário
function validateForm() {
    return validateCurrentContainer();
}

// Função para exibir mensagens de feedback
function showFlashMessage(message, type) {
    const flashMessageDiv = document.getElementById('flashMessage');
    flashMessageDiv.textContent = message;
    flashMessageDiv.className = type; // 'error' ou 'success'
    flashMessageDiv.classList.remove('hidden');
    setTimeout(() => {
        flashMessageDiv.classList.add('hidden');
    }, 3000);
}

// Make functions available globally
window.startSurvey = startSurvey;
window.autoNext = autoNext;
window.validateForm = validateForm;
window.showFlashMessage = showFlashMessage;
