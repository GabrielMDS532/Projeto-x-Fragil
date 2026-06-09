// js/recuperarSenha.js
// Conecta o formulário de recuperação de senha à API do backend.
// Gerencia dois estados visuais: formulário e sucesso.

const API_BASE = 'http://localhost:3000';

// Estados visuais
const estadoFormulario = document.getElementById('estado_formulario');
const estadoSucesso    = document.getElementById('estado_sucesso');

// Elementos do formulário
const emailInput   = document.getElementById('email');
const emailError   = document.getElementById('emailError');
const erroConexao  = document.getElementById('erroConexao');
const btnRecuperar = document.getElementById('btn_recuperar');

// Exibe o estado de sucesso (oculta o formulário)
function mostrarSucesso() {
    estadoFormulario.style.display = 'none';
    estadoSucesso.style.display    = 'block';
}

// Chamada pelo onsubmit do formulário em recuperar_senha.html
async function recoverPassword(event) {
    event.preventDefault();

    const email = emailInput.value.trim();

    // Limpa mensagens de erro anteriores
    emailError.style.display   = 'none';
    erroConexao.style.display  = 'none';

    // Validação de formato no cliente
    if (!email || !email.includes('@')) {
        emailError.style.display = 'block';
        return;
    }

    // Estado de carregamento
    btnRecuperar.disabled    = true;
    btnRecuperar.textContent = 'Enviando...';

    try {
        const resposta = await fetch(`${API_BASE}/api/recuperar-senha`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        await resposta.json();

        // Sempre mostra o sucesso — API retorna mensagem genérica que não revela
        // se o e-mail existe ou não (proteção contra enumeração de contas).
        mostrarSucesso();

    } catch (erro) {
        console.error('Erro ao contactar o servidor:', erro);
        erroConexao.textContent   = 'Erro ao conectar com o servidor. Verifique se o Node.js está rodando na porta 3000.';
        erroConexao.style.display = 'block';

        btnRecuperar.disabled    = false;
        btnRecuperar.textContent = 'Enviar Link de Recuperação';
    }
}