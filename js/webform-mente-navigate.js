// Funções de navegação do formulário >>>> versão certa, sónão anda para tráz
let currentContainer = 0;
let containers;

function startSurvey() {
    document.getElementById('intro').style.display = 'none';
    document.getElementById('myForm').classList.remove('hidden');
    containers = document.querySelectorAll('.form-container');
    
    // Prepara o primeiro container
    const firstContainer = containers[0];
    firstContainer.style.display = 'flex';
    firstContainer.style.transform = 'translateX(100%)';
    firstContainer.style.opacity = '0';

    // Força um reflow
    void firstContainer.offsetWidth;
    // Anima o primeiro container
    setTimeout(() => {
        firstContainer.style.transform = 'translateX(0)';
        firstContainer.style.opacity = '1';
        firstContainer.classList.add('active');
        
        // Anima as opções
        const options = firstContainer.querySelectorAll('.option-container');
        options.forEach((option, i) => {
            option.style.animation = 'none';
            void option.offsetWidth;
            option.style.animation = `slideUp 0.5s ease forwards ${i * 0.1}s`;
        });
    }, 50);

    currentContainer = 0;
    updateNavigationButtons();
}

function showContainer(index) {
    if (!validateCurrentContainer()) {
        return;
    }

    const direction = index > currentContainer ? 1 : -1;
    
    // Remove classes antigas
    containers.forEach(container => {
        container.classList.remove('active', 'previous');
    });

    // Adiciona classe para animação de saída
    if (containers[currentContainer]) {
        containers[currentContainer].style.transform = `translateX(${-100 * direction}%)`;
        containers[currentContainer].style.opacity = '0';
    }

    // Prepara o novo container
    containers[index].style.display = 'flex';
    containers[index].style.transform = `translateX(${100 * direction}%)`;
    containers[index].style.opacity = '0';

    // Força um reflow
    void containers[index].offsetWidth;

    // Anima o novo container
    setTimeout(() => {
        containers[index].style.transform = 'translateX(0)';
        containers[index].style.opacity = '1';
        containers[index].classList.add('active');
    }, 50);

    currentContainer = index;
    updateNavigationButtons();

    // Anima as opções
    const options = containers[index].querySelectorAll('.option-container');
    options.forEach((option, i) => {
        option.style.animation = 'none';
        void option.offsetWidth;
        option.style.animation = `slideUp 0.5s ease forwards ${i * 0.1}s`;
    });
}

function validateCurrentSection() {
    const currentContainer = document.querySelector('.form-container.active');
    if (!currentContainer) return false;

    const inputs = currentContainer.querySelectorAll('input[required]');
    let isValid = true;
    let firstInvalid = null;

    // Limpa mensagens anteriores
    clearValidationMessages();

    inputs.forEach(input => {
        if (input.type === 'radio') {
            const radioGroup = document.getElementsByName(input.name);
            const checked = Array.from(radioGroup).some(radio => radio.checked);
            if (!checked) {
                isValid = false;
                firstInvalid = firstInvalid || input;
                showValidationMessage(currentContainer);
            }
        } else if (!input.value.trim()) {
            isValid = false;
            firstInvalid = firstInvalid || input;
            showValidationMessage(currentContainer);
        }
    });

    if (!isValid && firstInvalid) {
        firstInvalid.focus();
    }

    return isValid;
}

function showValidationMessage(container) {
    const messageDiv = container.querySelector('.validation-message');
    if (messageDiv) {
        messageDiv.textContent = "Por favor escolha uma resposta!";
        messageDiv.classList.add('show');
        
        // Remove a mensagem após seleção de uma opção
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
    messages.forEach(message => {
        message.classList.remove('show');
    });
}

function highlightError(input) {
    const container = input.closest('.option-container') || input.parentElement;
    
    // Remove qualquer highlight existente primeiro
    container.classList.remove('error-highlight');
    
    // Força um reflow antes de adicionar a classe novamente
    void container.offsetWidth;
    
    // Adiciona o highlight
    container.classList.add('error-highlight');
    
    // Remove o highlight quando uma opção for selecionada
    input.addEventListener('change', () => {
        container.classList.remove('error-highlight');
    }, { once: true });
}

function shakeContainer(container) {
    container.classList.remove('shake');
    void container.offsetWidth; // Força um reflow
    container.classList.add('shake');
    
    setTimeout(() => {
        container.classList.remove('shake');
    }, 700);
}

function clearErrors() {
    const errorHighlights = document.querySelectorAll('.error-highlight');
    errorHighlights.forEach(highlight => highlight.classList.remove('error-highlight'));
}

function updateNavigationButtons() {
    const prevButtons = document.querySelectorAll('button[onclick="navigate(-1)"]');
    const nextButtons = document.querySelectorAll('button[onclick="navigate(1)"]');
    
    prevButtons.forEach(btn => {
        btn.disabled = currentContainer === 0;
    });
    
    nextButtons.forEach(btn => {
        btn.disabled = currentContainer === containers.length - 1;
    });
}
function navigate(direction) {
    const newIndex = currentContainer + direction;
    if (newIndex >= 0 && newIndex < containers.length) {
        showContainer(newIndex);
    }
}

function autoNext() {
    if (currentContainer < containers.length - 1 && validateCurrentContainer()) {
        setTimeout(() => navigate(1), 500);
    }
}


function navigate(direction) {
    console.log("navigate called with direction: " + direction);
    clearValidationMessages();
    if (direction > 0 && !validateCurrentSection()) {
        return;
    } else if (direction < 0) {
        console.log("Going back");
    }

    clearErrors();
    const containers = document.querySelectorAll('.form-container');
    const currentContainer = document.querySelector('.form-container.active');
    const currentIndex = Array.from(containers).indexOf(currentContainer);
    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < containers.length) {
        currentContainer.classList.remove('active');
        currentContainer.style.transform = `translateX(${direction > 0 ? '-100%' : '100%'})`;
        currentContainer.style.opacity = '0';

        const nextContainer = containers[nextIndex];
        nextContainer.style.display = 'flex';
        nextContainer.style.transform = `translateX(${direction > 0 ? '100%' : '-100%'})`;
        
        // Força um reflow
        void nextContainer.offsetWidth;

        nextContainer.classList.add('active');
        nextContainer.style.transform = 'translateX(0)';
        nextContainer.style.opacity = '1';

        updateNavigationButtons();
    }
}

function autoNext() {
    if (currentContainer < containers.length - 1 && validateCurrentSection()) {
        setTimeout(() => navigate(1), 300);
    }
}

// Exporta as funções para uso global
window.startSurvey = startSurvey;
window.navigate = navigate;
window.autoNext = autoNext;

// Atualiza o CSS para incluir os novos estilos de erro
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
