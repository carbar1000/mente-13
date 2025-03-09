import { sendFormData, validateForm, sanitizeInput } from './form-handler';
import { sendToGoogleSheets } from './webform-mente';

// Mock das funções externas
jest.mock('./webform-mente', () => ({
    sendToGoogleSheets: jest.fn(),
    // showFlashMessage: jest.fn(), // Removido, pois não é usado diretamente nos testes
}));

describe('form-handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock do DOM
        document.body.innerHTML = `
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
        `;
    });

    describe('sendFormData', () => {
        it('deve enviar dados para o Google Sheets e Supabase', async () => {
            sendToGoogleSheets.mockResolvedValue({ ok: true });
            global.fetch = jest.fn().mockResolvedValue({ ok: true }); // Mock fetch para Supabase

            const data = { A: 'azul', B: 'cao', C: 'sol', Nome: 'Teste', Email: 'teste@example.com', csrf_token: 'token' };
            const result = await sendFormData(data);

            expect(sendToGoogleSheets).toHaveBeenCalledWith(data);
            expect(fetch).toHaveBeenCalledWith('/api/submit-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            expect(result).toBe(true);
        });

        it('deve lançar um erro se o envio para o Google Sheets falhar', async () => {
            sendToGoogleSheets.mockResolvedValue({ ok: false });

            const data = { A: 'azul', B: 'cao', C: 'sol', Nome: 'Teste', Email: 'teste@example.com' };
            await expect(sendFormData(data)).rejects.toThrow('Falha no envio para Google Sheets');
        });
    });

     describe('validateForm', () => {
        it('deve retornar true se o formulário for válido', () => {
            expect(validateForm()).toBe(true);
        });

        it('deve retornar false se um campo obrigatório estiver vazio', () => {
            document.querySelector('[name="Nome"]').value = '';
            expect(validateForm()).toBe(false);
        });
    });

    describe('sanitizeInput', () => {
        it('deve remover tags HTML e caracteres especiais', () => {
            expect(sanitizeInput('<script>alert("XSS")</script>&')).toBe('alert("XSS")&amp;');
        });
    });
});