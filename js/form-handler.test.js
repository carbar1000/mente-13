import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { sendFormData, validateForm, sanitizeInput, setupFormSubmitListener } from './form-handler.js';
import { initializeGlobalFunctions } from './webform-mente.js';

// Mock fetch
global.fetch = async (url, options) => {
  console.log(`Chamada para fetch com URL: ${url} e opções:`, options);
  if (url === '/api/submit-form') {
    return Promise.resolve({
      ok: true,
      json: async () => ({ success: true })
    });
  }
};

describe('form-handler', () => {
  beforeEach(() => {
    // Mock do DOM
    global.document = {
      body: {
        innerHTML: `
          <form id="myForm">
            <input type="text" name="Nome" value="Teste">
            <input type="email" name="Email" value="teste@example.com">
            <input type="radio" name="A" value="azul" checked>
            <input type="radio" name="B" value="cao" checked>
            <input type="radio" name="C" value="sol" checked>
            <input type="hidden" name="csrf_token" value="token">
            <button type="submit"></button>
          </form>
          <div id="flashMessage"></div>
      `},
      querySelector: (selector) => {
        if (selector === '[name="Nome"]') {
          return { value: 'Teste' };
        }
        if (selector === '[name="Email"]') {
          return { value: 'teste@example.com' };
        }
        if (selector === 'input[name="A"]:checked') {
          return { value: 'azul' };
        }
        if (selector === 'input[name="B"]:checked') {
          return { value: 'cao' };
        }
        if (selector === 'input[name="C"]:checked') {
          return { value: 'sol' };
        }

        // Para outros seletores, podemos adicionar mais lógica aqui, se necessário
        return null; // Ou um mock mais detalhado, dependendo do uso
      },
      createElement: (tag) => {
        if (tag === 'div') {
          return {
            className: '',
            textContent: '',
            classList: {
              add: () => { },
              remove: () => { }
            },
            appendChild: () => { }
          }
        }
      },
      getElementById: (id) => {
        if (id === 'csrf_token') {
          return { value: 'token' };
        }
        if (id === 'flashMessage') {
          return {
            textContent: '',
            className: '',
            classList: {
              add: () => { },
              remove: () => { }
            }
          }
        }
        if (id === 'myForm') {
          return {
            addEventListener: () => { }
          }
        }
      }
    };

    global.window = {
      location: {
        href: ''
      }
    }

    initializeGlobalFunctions(); // Inicializa as funções globais
    setupFormSubmitListener(); // Configura o listener de envio do formulário

    global.sendToGoogleSheets = () => Promise.resolve({ ok: true });

  });

  describe('sendFormData', () => {
    it('deve enviar dados para o Google Sheets e Supabase', async () => {
      const data = { A: 'azul', B: 'cao', C: 'sol', Nome: 'Teste', Email: 'teste@example.com', csrf_token: 'token', timestamp: '2024-03-09T12:00:00.000Z' };
      const result = await sendFormData(data);
      assert.strictEqual(result, true, 'O envio dos dados deve retornar true');
    });


    it('deve lançar um erro se o envio para o Google Sheets falhar', async () => {
      global.sendToGoogleSheets = () => Promise.reject(new Error('Falha no envio para Google Sheets'));
      const data = { A: 'azul', B: 'cao', C: 'sol', Nome: 'Teste', Email: 'teste@example.com', csrf_token: 'token', timestamp: '2024-03-09T12:00:00.000Z' };
      await assert.rejects(
        sendFormData(data),
        Error('Falha no envio para Google Sheets')
      );
    });
  });

  describe('validateForm', () => {
    it('deve retornar true se o formulário for válido', () => {
      assert.strictEqual(validateForm(), true);
    });

    it('deve retornar false se um campo obrigatório estiver vazio', () => {
      document.querySelector('[name="Nome"]').value = '';
      assert.strictEqual(validateForm(), false);
    });
  });

  describe('sanitizeInput', () => {
    it('deve remover tags HTML e caracteres especiais', () => {
      assert.strictEqual(sanitizeInput('<script>alert("XSS")</script>&'), 'alert("XSS")&amp;');
    });
  });
});