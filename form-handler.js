const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Função para enviar para Google Sheets
async function sendToGoogleSheets(formData) {
  const scriptURL = 'https://script.google.com/macros/s/AKfycbzdLpEgmmmlPFV_V-W0s9lF-f3QrtU4fBwmcQEAI5Et962tLFjsLms2FRSivtyYAx_3dA/exec';
  
  console.log('Enviando para Google Sheets...');
  
  try {
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
async function enviarParaSupabase(formData) {
  const dados = {
      nome: formData.get('Nome'),
      email: formData.get('Email'),
      processed: false,
      user_id: null,
      A: formData.get('A'),
      B: formData.get('B'),
      C: formData.get('C')
  };

  const response = await fetch(`${SUPABASE_URL}/rest/v1/respostas`, {
      method: 'POST',
      headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
      },
      body: JSON.stringify(dados)
  });

  return response.ok;
}

// Função principal de manipulação do formulário
async function handleFormSubmit(event) {
  event.preventDefault();
  showFlashMessage('Enviando dados...', 'info');

  const form = event.target;
  const formData = new FormData(form);
  formData.append('timestamp', new Date().toISOString());

  try {
      console.log('Iniciando processo de envio...');

      // Envio para Google Sheets
      const googleSheetsResult = await sendToGoogleSheets(formData);
      console.log('Resultado Google Sheets:', googleSheetsResult);

      // Envio para Supabase
      const supabaseResult = await enviarParaSupabase(formData);
      console.log('Resultado Supabase:', supabaseResult);

      if (googleSheetsResult.ok || supabaseResult) {
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
