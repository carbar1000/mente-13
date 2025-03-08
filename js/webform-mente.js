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
function validateForm(currentStep) {
    const container = document.querySelector(`.form-container[data-step="${currentStep}"]`);
    const options = container.querySelectorAll('input[type="radio"]');
    const errorMessage = container.querySelector('.error-message');
    
    if (!errorMessage) {
        const msg = document.createElement('div');
        msg.className = 'error-message';
        msg.textContent = 'Por favor, escolha uma resposta!';
        container.appendChild(msg);
    }

    let isChecked = false;
    options.forEach(option => {
        if (option.checked) isChecked = true;
    });

    if (!isChecked) {
        container.querySelector('.error-message').classList.add('show');
        container.classList.add('shake');
        setTimeout(() => container.classList.remove('shake'), 500);
        return false;
    }

    container.querySelector('.error-message').classList.remove('show');
    return true;
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

// Modificar a função que controla a navegação entre as etapas
function nextStep() {
    if (!validateForm(currentStep)) return;
    
    // ... resto do código existente para navegação ...
}

// Make functions available globally
window.startSurvey = startSurvey;
window.autoNext = autoNext;
window.validateForm = validateForm;
window.showFlashMessage = showFlashMessage;
