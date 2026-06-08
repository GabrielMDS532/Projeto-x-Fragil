// Conecta o formulário de recuperação de senha à API do backend.
// A função recoverPassword é chamada pelo onsubmit do formulário em recuperar_senha.html.

async function recoverPassword(event) {
    event.preventDefault();

    const inputEmail  = document.querySelector('#email');
    const emailError  = document.querySelector('#emailError');
    const btn         = document.querySelector('.btn_Recover_password');
    const loginFooter = document.querySelector('#link_enviado');

    const email = inputEmail.value.trim();

    // Validação básica no cliente
    if (!email || !email.includes('@')) {
        emailError.style.display = 'block';
        return;
    }
    emailError.style.display = 'none';

    // Feedback de carregamento
    btn.disabled    = true;
    btn.textContent = 'Enviando...';

    try {
        const resposta = await fetch('http://localhost:3000/api/recuperar-senha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        await resposta.json();

        // Limpa o campo e exibe a confirmação genérica (nunca revela se o e-mail existe)
        inputEmail.value = '';
        loginFooter.classList.add('mostrar');

        setTimeout(() => {
            loginFooter.classList.remove('mostrar');
        }, 6000);

    } catch (erro) {
        console.error('Erro ao contactar o servidor:', erro);
        emailError.style.display = 'block';
        emailError.textContent   = 'Erro ao conectar com o servidor. Verifique se o Node.js está rodando na porta 3000.';
    } finally {
        btn.disabled    = false;
        btn.textContent = 'Enviar Link de Recuperação';
    }
}