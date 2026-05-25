/**
 * =========================================================================
 * 1. CONTROLE DE ACESSO E SEGURANÇA
 * =========================================================================
 */
function verificarAutenticacao() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = '../cadastro/login.html';
        return false;
    }
    return true;
}

/**
 * =========================================================================
 * 2. INICIALIZAÇÃO DA PÁGINA
 * =========================================================================
 */
function inicializarCadastroPaciente() {
    if (!verificarAutenticacao()) return;

    // Carregar informações do cabeçalho/menu lateral
    const userEmail = localStorage.getItem('userEmail') || '';
    const userDisplayName = localStorage.getItem('userDisplayName') || userEmail.split('@')[0] || 'Usuário';
    
    const userDisplayNameFormated = userDisplayName.charAt(0).toUpperCase() + userDisplayName.slice(1);

    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) userInfoElement.textContent = `👤 ${userDisplayNameFormated}`;

    // Configurar o ouvinte de envio do formulário
    const formulario = document.getElementById('patientForm');
    if (formulario) {
        formulario.addEventListener('submit', cadastrarPaciente);
    }
}

/**
 * =========================================================================
 * 3. LÓGICA DE CADASTRO (CONECTADO AO NODE.JS E MYSQL)
 * =========================================================================
 */
async function cadastrarPaciente(event) {
    event.preventDefault();

    const inputNome = document.getElementById('nome_paciente');
    const selectSexo = document.getElementById('sexo_paciente');
    const inputDataNasc = document.getElementById('data_nascimento_paciente');
    const inputResponsavel = document.getElementById('nome_responsavel');
    const inputTelefone = document.getElementById('telefone_paciente');
    const textareaObservacoes = document.getElementById('observacoes_paciente');
    
    if (!inputNome || !selectSexo || !inputDataNasc || !inputResponsavel || !inputTelefone) return;

    // Montando o objeto JSON que será enviado ao Backend
    const novoPaciente = {
        nome_paciente: inputNome.value.trim(),
        sexo_paciente: selectSexo.value, 
        data_nascimento_paciente: inputDataNasc.value, 
        nome_responsavel: inputResponsavel.value.trim(),
        telefone_paciente: inputTelefone.value.trim(),
        observacoes_paciente: textareaObservacoes ? textareaObservacoes.value.trim() : null
    };

    try {
        // Fazendo a requisição real para o servidor
        const resposta = await fetch('http://localhost:3000/api/pacientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novoPaciente)
        });

        const dados = await resposta.json();

        if (dados.sucesso) {
            alert('Paciente cadastrado com sucesso!');
            // Redireciona de volta para a lista geral de pacientes
            window.location.href = '../Principais/pacientes.html';
        } else {
            alert('Erro do servidor: ' + dados.mensagem);
        }

    } catch (error) {
        console.error("Erro na requisição de cadastro:", error);
        alert("Houve um erro técnico ao tentar cadastrar o paciente. Verifique se o backend está rodando.");
    }
}

/**
 * =========================================================================
 * 4. NAVEGAÇÃO E LOGOUT
 * =========================================================================
 */
function navigate(page) {
    window.location.href = page;
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userDisplayName');

    window.location.href = '../cadastro/login.html';
}

// Dispara o gatilho inicial ao carregar a página
document.addEventListener('DOMContentLoaded', inicializarCadastroPaciente);