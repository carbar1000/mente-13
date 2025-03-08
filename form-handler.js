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

// Função principal de manipulação do formulário
async function handleFormSubmit(event) {
  event.preventDefault();
  showFlashMessage('Enviando dados...', 'info');

  const form = event.target;
  const formData = new FormData(form);
  formData.append('timestamp', new Date().toISOString());

  const data = {
    A: formData.get('A'),
    B: formData.get('B'),
    C: formData.get('C'),
    nome: formData.get('Nome'),
    email: formData.get('Email')
  };

  try {
    console.log('Iniciando processo de envio...');

    // Envio para Google Sheets
    const googleSheetsResult = await sendToGoogleSheets(formData);
    console.log('Resultado Google Sheets:', googleSheetsResult);

    // Envio para Supabase usando a API route
    const supabaseResponse = await fetch('/api/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!supabaseResponse.ok) {
      throw new Error(`Erro HTTP: ${supabaseResponse.status}`);
    }

    const supabaseResult = await supabaseResponse.json();

    if (googleSheetsResult.ok || supabaseResult.ok) {
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

// Adiciona o event listener ao formulário
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('myForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
  });
