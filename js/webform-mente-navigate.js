// Funções de navegação do formulário
let currentContainer = 0;
let containers;

function startSurvey() {
    document.getElementById('intro').style.display = 'none';
    document.getElementById('myForm').classList.remove('hidden');
    containers = document.querySelectorAll('.form-container');
    showContainer(0);
    updateNavigationButtons();
}

// Função auxiliar para validar o container atual - usada por navigate() e autoNext()
function validateCurrentContainer() {
    if (currentContainer < 0 || currentContainer >= containers.length) return true;

    const current = containers[currentContainer];
    const requiredInputs = current.querySelectorAll('input[required]');
    let allValid = true;

    requiredInputs.forEach(input => {
        if (input.type === 'radio') {
            const radios = Array.from(document.getElementsByName(input.name));
            const anyChecked = radios.some(radio => radio.checked);
            if (!anyChecked) {
                allValid = false;
                showValidationMessage(current);
            }
        } else if (!input.value.trim()) {
            allValid = false;
            showValidationMessage(current);
        }
    });

    return allValid;
}

function showContainer(index) {
    if (index < 0 || index >= containers.length) return;

    const direction = index > currentContainer ? 1 : -1;

    if (containers[currentContainer]) {
        containers[currentContainer].classList.remove('active');
        containers[currentContainer].style.transform = `translateX(${-100 * direction}%)`;
        containers[currentContainer].style.opacity = '0';
    }

    containers[index].style.display = 'flex';
    containers[index].style.transform = `translateX(${100 * direction}%)`;
    containers[index].style.opacity = '0';
    void containers[index].offsetWidth;

    containers[index].classList.add('active');
    containers[index].style.transform = 'translateX(0)';
    containers[index].style.opacity = '1';

    currentContainer = index;
    updateNavigationButtons();

    const options = containers[index].querySelectorAll('.option-container');
    options.forEach((option, i) => {
        option.style.animation = 'none';
        void option.offsetWidth;
        option.style.animation = `slideUp 0.5s ease forwards ${i * 0.1}s`;
    });
}

function navigate(direction) {
    clearValidationMessages();
    if (!validateCurrentContainer()) {
        return;
    }

    const nextIndex = currentContainer + direction;
    if (nextIndex >= 0 && nextIndex < containers.length) {
        showContainer(nextIndex);
    }
}

function autoNext() {
    if (currentContainer < containers.length - 1 && validateCurrentContainer()) {
        setTimeout(() => navigate(1), 500);
    }
}

function showValidationMessage(container) {
    const messageDiv = container.querySelector('.validation-message');
    if (messageDiv) {
        messageDiv.textContent = "Por favor, escolha uma resposta!";
        messageDiv.classList.add('show');

        const inputs = container.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                messageDiv.classList.remove('show');
            }, { once: true });
        });
    }
}

function clearValidationMessages() {
    const messages = document.querySelectorAll('.validation-message');
    messages.forEach(message => message.classList.remove('show'));
}

function updateNavigationButtons() {
    const prevButtons = document.querySelectorAll('button[onclick="navigate(-1)"]');
    const nextButtons = document.querySelectorAll('button[onclick="navigate(1)"]');

    prevButtons.forEach(btn => btn.disabled = currentContainer === 0);
    nextButtons.forEach(btn => btn.disabled = currentContainer === containers.length - 1);
}

// Funções que não são mais necessárias, mas que vou manter comentadas caso precisemos delas no futuro
/*
function highlightError(input) {
    const container = input.closest('.option-container') || input.parentElement;
    container.classList.remove('error-highlight');
    void container.offsetWidth;
    container.classList.add('error-highlight');
    input.addEventListener('change', () => {
        container.classList.remove('error-highlight');
    }, { once: true });
}

function shakeContainer(container) {
    container.classList.remove('shake');
    void container.offsetWidth;
    container.classList.add('shake');
    setTimeout(() => {
        container.classList.remove('shake');
    }, 700);
}

function clearErrors() {
    const errorHighlights = document.querySelectorAll('.error-highlight');
    errorHighlights.forEach(highlight => highlight.classList.remove('error-highlight'));
}
*/

// Exporta as funções para uso global
window.startSurvey = startSurvey;
window.navigate = navigate;
window.autoNext = autoNext;

// Adiciona estilos CSS (mantido do código original)
const style = document.createElement('style');
style.textContent = `
    .error-highlight {
        border-color: #ff4444 !important;
        animation: pulse 0.5s ease;
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }

    .shake {
        animation: shake 0.5s ease-in-out;
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
        20%, 40%, 60%, 80% { transform: translateX(2px); }
    }

    .option-container {
        transition: border-color 0.3s ease;
    }
`;
document.head.appendChild(style);
