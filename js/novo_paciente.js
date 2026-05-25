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
 * 3. LÓGICA DE CADASTRO (INTEGRAÇÃO SQL V2 E SIMULAÇÃO API)
 * =========================================================================
 */
async function cadastrarPaciente(event) {
    event.preventDefault();

    // Capturando os elementos do formulário usando os IDs idênticos às colunas SQL v2
    const inputNome = document.getElementById('nome_paciente');
    const selectSexo = document.getElementById('sexo_paciente');
    const inputDataNasc = document.getElementById('data_nascimento_paciente');
    const inputResponsavel = document.getElementById('nome_responsavel');
    const inputTelefone = document.getElementById('telefone_paciente');
    const textareaObservacoes = document.getElementById('observacoes_paciente');
    
    if (!inputNome || !selectSexo || !inputDataNasc || !inputResponsavel || !inputTelefone) return;

    // Montando o objeto JSON com nomes de chaves idênticos às colunas existentes no SQL v2
    const novoPacienteDB = {
        id_paciente: 0, // Será auto-incrementado pela simulação do banco
        nome_paciente: inputNome.value.trim(),
        sexo_paciente: selectSexo.value, // 'M' ou 'F'
        data_nascimento_paciente: inputDataNasc.value, // YYYY-MM-DD
        nome_responsavel: inputResponsavel.value.trim(),
        telefone_paciente: inputTelefone.value.trim(),
        observacoes_paciente: textareaObservacoes ? textareaObservacoes.value.trim() : null
    };

    try {
        console.log("Simulando envio de Paciente para o Banco (SQL v2):", novoPacienteDB);

        // localStorage usado apenas como simulação temporária de persistência da API
        const pacientesSalvos = JSON.parse(localStorage.getItem('pacientesSimulados') || '[]');
        
        // Auto-incremento do ID
        novoPacienteDB.id_paciente = pacientesSalvos.length > 0 ? Math.max(...pacientesSalvos.map(p => p.id_paciente)) + 1 : 1;
        
        pacientesSalvos.push(novoPacienteDB);
        localStorage.setItem('pacientesSimulados', JSON.stringify(pacientesSalvos));

        alert('Paciente cadastrado com sucesso!');
        
        // Redireciona de volta para a lista geral de pacientes
        window.location.href = '../Principais/pacientes.html';

    } catch (error) {
        console.error("Erro na requisição de cadastro:", error);
        alert("Houve um erro técnico ao tentar cadastrar o paciente.");
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
    // Remoção estrita das chaves de sessão sem apagar os bancos de dados simulados!
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userDisplayName');

    window.location.href = '../cadastro/login.html';
}

// Dispara o gatilho inicial ao carregar a página
document.addEventListener('DOMContentLoaded', inicializarCadastroPaciente);