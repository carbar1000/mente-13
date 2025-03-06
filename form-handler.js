// Função para enviar para Google Sheets
async function sendToGoogleSheets(formData) {
    try {
        const scriptURL = 'https://script.google.com/macros/s/AKfycbzdLpEgmmmlPFV_V-W0s9lF-f3QrtU4fBwmcQEAI5Et962tLFjsLms2FRSivtyYAx_3dA/exec';
        
        console.log('Enviando para Google Sheets...');
        
        const response = await fetch(scriptURL, {
            method: 'POST',
            body: formData // Enviar o FormData diretamente
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        console.log('Dados enviados com sucesso para Google Sheets');
        return { ok: true };
    } catch (error) {
        console.error('Erro ao enviar para Google Sheets:', error);
        return { ok: false, error };
    }
}

// Função para enviar para Supabase
async function submitToSupabase(formData) {
    // Estrutura exata conforme a tabela no Supabase
    const data = {
        A: formData.get('A'),
        B: formData.get('B'),
        C: formData.get('C'),
        nome: formData.get('Nome'),
        email: formData.get('Email'),
        created_at: new Date().toISOString()
    };

    try {
        const response = await fetch(`${window.ENV.SUPABASE_URL}/rest/v1/respostas`, {
            method: 'POST',
            headers: {
                'apikey': window.ENV.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${window.ENV.SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Erro ao enviar para Supabase:', error);
        return false;
    }
}

// Função principal de manipulação do formulário
async function handleFormSubmit(event) {
    event.preventDefault();
    showFlashMessage('Enviando dados...', 'info');
    
    const form = event.target;
    const formData = new FormData(form);
    formData.append('timestamp', new Date().toISOString()); // Adicionar timestamp
    
    try {
        console.log('Iniciando processo de envio...');
        
        // Envio sequencial para evitar atropelos
        const googleSheetsResult = await sendToGoogleSheets(formData);
        console.log('Resultado Google Sheets:', googleSheetsResult);
        
        const supabaseResult = await submitToSupabase(formData);
        console.log('Resultado Supabase:', supabaseResult);

        // Verifica se pelo menos uma integração funcionou
        if (googleSheetsResult.ok || supabaseResult) {
            console.log('Pelo menos uma integração teve sucesso');
            showFlashMessage('Dados enviados com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = 'obrigado.html';
            }, 1000);
        } else {
            throw new Error('Ambas as integrações falharam');
        }
    } catch (error) {
        console.error('Erro no processo de envio:', error);
        showFlashMessage('Erro ao enviar dados. Por favor, tente novamente.', 'error');
    }
}

// Função para mostrar mensagens de feedback
function showFlashMessage(message, type = 'info') {
    const flashDiv = document.getElementById('flashMessage') || document.createElement('div');
    flashDiv.className = `flash-message ${type}`;
    flashDiv.textContent = message;
    
    if (!document.getElementById('flashMessage')) {
        document.body.appendChild(flashDiv);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('myForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

// Adicionar log de sucesso
console.log('Dados enviados:', {
    timestamp: new Date().toISOString(),
    status: 'success'
});

// Monitoramento de taxa de sucesso
let submissionStats = {
    total: 0,
    successful: 0
};

function updateStats(success) {
    submissionStats.total++;
    if (success) submissionStats.successful++;
    console.log(`Taxa de sucesso: ${(submissionStats.successful/submissionStats.total*100).toFixed(2)}%`);
}
