// js/redefinirSenha.js
// Gerencia o fluxo completo de redefinição de senha:
// 1. Lê o token da URL
// 2. Valida o token com o backend
// 3. Libera o formulário se válido
// 4. Processa o submit e redireciona para login em caso de sucesso

const API_BASE = 'http://localhost:3000';

// Lê o token da URL sem exibi-lo na tela
const params = new URLSearchParams(window.location.search);
const token  = params.get('token');

// Referências aos estados visuais
const estadoCarregando = document.getElementById('estado_carregando');
const estadoErroToken  = document.getElementById('estado_erro_token');
const estadoFormulario = document.getElementById('estado_formulario');
const estadoSucesso    = document.getElementById('estado_sucesso');

// Referências aos elementos do formulário
const novaSenhaInput   = document.getElementById('nova_senha');
const confirmarInput   = document.getElementById('confirmar_senha');
const senhaError       = document.getElementById('senhaError');
const confirmarError   = document.getElementById('confirmarError');
const btnRedefinir     = document.getElementById('btn_redefinir');
const forcaFill        = document.getElementById('forca_fill');
const forcaTexto       = document.getElementById('forca_texto');

// ─── Controle de estado visual ────────────────────────────────────────────────

function ocultarTodos() {
    estadoCarregando.style.display = 'none';
    estadoErroToken.style.display  = 'none';
    estadoFormulario.style.display = 'none';
    estadoSucesso.style.display    = 'none';
}

function mostrarEstado(elemento) {
    ocultarTodos();
    elemento.style.display = 'block';
}

function mostrarErroToken(mensagem) {
    document.getElementById('msg_erro_token').textContent = mensagem;
    mostrarEstado(estadoErroToken);
}

// ─── Validação do token ao carregar a página ───────────────────────────────────

async function inicializar() {
    // Token ausente na URL
    if (!token || token.trim() === '') {
        mostrarErroToken(
            'Nenhum link de recuperação foi fornecido. ' +
            'Solicite uma nova recuperação de senha.'
        );
        return;
    }

    // Consulta o backend para validar o token
    try {
        const resposta = await fetch(
            `${API_BASE}/api/validar-token?token=${encodeURIComponent(token)}`
        );

        if (!resposta.ok) {
            throw new Error(`Resposta inesperada do servidor: ${resposta.status}`);
        }

        const dados = await resposta.json();

        if (dados.valido) {
            mostrarEstado(estadoFormulario);
        } else {
            mostrarErroToken(
                dados.mensagem ||
                'Link inválido ou expirado. Solicite uma nova recuperação.'
            );
        }

    } catch (erro) {
        console.error('Erro ao validar token:', erro);
        mostrarErroToken(
            'Não foi possível verificar o link. ' +
            'Verifique se o servidor Node.js está rodando na porta 3000.'
        );
    }
}

// ─── Indicador de força da senha ──────────────────────────────────────────────

function calcularForca(senha) {
    if (senha.length === 0) {
        return { nivel: 0, texto: '', classe: '' };
    }
    if (senha.length < 6) {
        return { nivel: 1, texto: 'Fraca', classe: 'forca_fraca' };
    }

    const temMinuscula = /[a-z]/.test(senha);
    const temMaiuscula = /[A-Z]/.test(senha);
    const temNumero    = /[0-9]/.test(senha);
    const temEspecial  = /[^a-zA-Z0-9]/.test(senha);
    const variedade    = [temMinuscula, temMaiuscula, temNumero, temEspecial]
                            .filter(Boolean).length;

    if (senha.length >= 10 && variedade >= 3) {
        return { nivel: 3, texto: 'Forte', classe: 'forca_forte' };
    }
    if (senha.length >= 8 && variedade >= 2) {
        return { nivel: 2, texto: 'Média', classe: 'forca_media' };
    }
    return { nivel: 1, texto: 'Fraca', classe: 'forca_fraca' };
}

novaSenhaInput.addEventListener('input', () => {
    const { nivel, texto, classe } = calcularForca(novaSenhaInput.value);

    // Atualiza a barra de força
    forcaFill.className  = `forca_fill ${classe}`.trim();
    forcaFill.style.width = nivel > 0 ? `${(nivel / 3) * 100}%` : '0';
    forcaTexto.textContent = texto;

    // Limpa erro de senha enquanto o usuário digita
    if (novaSenhaInput.value.length > 0) {
        senhaError.style.display = 'none';
    }
});

// Limpa o erro de confirmação enquanto o usuário reescreve
confirmarInput.addEventListener('input', () => {
    confirmarError.style.display = 'none';
});

// ─── Submit: enviar nova senha ao backend ─────────────────────────────────────

async function redefinirSenha(event) {
    event.preventDefault();

    const novaSenha      = novaSenhaInput.value;
    const confirmarSenha = confirmarInput.value;

    // Limpa mensagens de erro anteriores
    senhaError.style.display    = 'none';
    confirmarError.style.display = 'none';

    let temErro = false;

    // Validação: comprimento mínimo
    if (novaSenha.length < 6) {
        senhaError.textContent   = 'A senha deve ter pelo menos 6 caracteres.';
        senhaError.style.display = 'block';
        temErro = true;
    }

    // Validação: senhas coincidem
    if (novaSenha !== confirmarSenha) {
        confirmarError.textContent   = 'As senhas não coincidem.';
        confirmarError.style.display = 'block';
        temErro = true;
    }

    if (temErro) return;

    // Bloqueia o botão durante o envio
    btnRedefinir.disabled    = true;
    btnRedefinir.textContent = 'Redefinindo...';

    try {
        const resposta = await fetch(`${API_BASE}/api/redefinir-senha`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Envia o token (lido da URL) e a nova senha. Nunca salva no localStorage.
            body: JSON.stringify({ token, senha: novaSenha })
        });

        const dados = await resposta.json();

        if (dados.sucesso) {
            // Exibe o estado de sucesso e redireciona para o login após 4 segundos
            mostrarEstado(estadoSucesso);
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 4000);

        } else {
            // Erro retornado pelo backend (token expirou entre validação e submit, etc.)
            senhaError.textContent   = dados.mensagem || 'Erro ao redefinir a senha. Tente novamente.';
            senhaError.style.display = 'block';
            btnRedefinir.disabled    = false;
            btnRedefinir.textContent = 'Redefinir Senha';
        }

    } catch (erro) {
        console.error('Erro ao redefinir senha:', erro);
        senhaError.textContent   = 'Erro ao conectar com o servidor. Verifique se o Node.js está rodando na porta 3000.';
        senhaError.style.display = 'block';
        btnRedefinir.disabled    = false;
        btnRedefinir.textContent = 'Redefinir Senha';
    }
}

// ─── Inicialização ────────────────────────────────────────────────────────────
inicializar();
