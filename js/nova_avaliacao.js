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
 * 2. CONFIGURAÇÕES E DADOS TEMPORÁRIOS DE SIMULAÇÃO
 * =========================================================================
 */
let listaPacientes = [];

// Dados temporários de amortecimento inicial caso o banco simulado esteja vazio
const PACIENTES_TEMPORARIOS_INICIAIS = [
    {
        id_paciente: 1,
        nome_paciente: "João Silva",
        sexo_paciente: "M",
        data_nascimento_paciente: "2018-05-10",
        nome_responsavel: "Maria Silva",
        telefone_paciente: "(11) 98888-8888",
        observacoes_paciente: "Dificuldades de aprendizado relatadas na escola."
    },
    {
        id_paciente: 2,
        nome_paciente: "Maria Santos",
        sexo_paciente: "F",
        data_nascimento_paciente: "2016-08-15",
        nome_responsavel: "José Santos",
        telefone_paciente: "(11) 97777-7777",
        observacoes_paciente: "Atraso no desenvolvimento motor e da fala."
    },
    {
        id_paciente: 3,
        nome_paciente: "Pedro Costa",
        sexo_paciente: "M",
        data_nascimento_paciente: "2020-02-20",
        nome_responsavel: "Ana Costa",
        telefone_paciente: "(11) 96666-6666",
        observacoes_paciente: "Déficit de atenção e movimentos repetitivos."
    }
];

function inicializarNovaAvaliacao() {
    if (!verificarAutenticacao()) return;

    // Configura o cabeçalho/menu lateral
    const userEmail = localStorage.getItem('userEmail') || '';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const userDisplayName = localStorage.getItem('userDisplayName') || userEmail.split('@')[0] || 'Usuário';
    
    const userDisplayNameFormated = userDisplayName.charAt(0).toUpperCase() + userDisplayName.slice(1);

    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) userInfoElement.textContent = `👤 ${userDisplayNameFormated}`;

    const btnUsuarios = document.getElementById('btnUsuarios');
    if (!isAdmin && btnUsuarios) {
        btnUsuarios.style.display = 'none';
    }

    // Configurar Ouvintes de Eventos (Listeners)
    const selectPaciente = document.getElementById('selectPatient');
    if (selectPaciente) {
        selectPaciente.addEventListener('change', carregarInformacoesPaciente);
    }

    // Carrega a lista de pacientes
    buscarPacientesParaSelect();
}

/**
 * =========================================================================
 * 3. ALIMENTAR O SELECT DINAMICAMENTE (INTEGRAÇÃO COM BANCO SIMULADO)
 * =========================================================================
 */
async function buscarPacientesParaSelect() {
    try {
        const dadosSalvos = localStorage.getItem('pacientesSimulados');
        if (dadosSalvos) {
            listaPacientes = JSON.parse(dadosSalvos);
        } else {
            listaPacientes = [...PACIENTES_TEMPORARIOS_INICIAIS];
            localStorage.setItem('pacientesSimulados', JSON.stringify(listaPacientes));
        }
        
        const selectElement = document.getElementById('selectPatient');
        if (!selectElement) return;

        selectElement.innerHTML = '<option value="">Selecione um paciente...</option>';

        listaPacientes.forEach(paciente => {
            const option = document.createElement('option');
            option.value = paciente.id_paciente;
            option.textContent = paciente.nome_paciente;
            selectElement.appendChild(option);
        });

        // Autoseleção baseada no query parameter 'id_paciente' se houver
        const urlParams = new URLSearchParams(window.location.search);
        const urlPatientId = urlParams.get('id_paciente');
        
        if (urlPatientId) {
            selectElement.value = urlPatientId;
            carregarInformacoesPaciente();
        }

    } catch (error) {
        console.error("Erro ao buscar pacientes para o select:", error);
    }
}

/**
 * =========================================================================
 * 4. EXIBIR DETALHES DO PACIENTE SELECIONADO
 * =========================================================================
 */
function calcularIdade(dataNascimento) {
    if (!dataNascimento) return "-";
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return `${idade} anos`;
}

function carregarInformacoesPaciente() {
    const select = document.getElementById('selectPatient');
    const containerInfo = document.getElementById('patientInfo');
    
    if (!select || !containerInfo) return;

    const pacienteSelecionado = listaPacientes.find(p => p.id_paciente === parseInt(select.value));

    if (pacienteSelecionado) {
        containerInfo.classList.remove('hidden');
        
        document.getElementById('patientName').textContent = pacienteSelecionado.nome_paciente;
        document.getElementById('patientSex').textContent = pacienteSelecionado.sexo_paciente === 'M' ? 'Masculino' : 'Feminino';
        document.getElementById('patientAge').textContent = calcularIdade(pacienteSelecionado.data_nascimento_paciente);
    } else {
        containerInfo.classList.add('hidden');
    }
}

/**
 * =========================================================================
 * 5. LÓGICA DE TRIAGEM
 * =========================================================================
 */
function clearChecklist() {
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
}

async function calculateScore() {
    const select = document.getElementById('selectPatient');
    if (!select || !select.value) {
        alert('Por favor, selecione um paciente primeiro!');
        return;
    }

    const pacienteAtual = listaPacientes.find(p => p.id_paciente === parseInt(select.value));
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    
    let scoreTotal = 0;
    checkboxes.forEach(cb => {
        scoreTotal += parseFloat(cb.getAttribute('data-weight') || 0);
    });

    // Mapeamento estruturado em perfeita conformidade com as colunas SQL v2
    const dadosAvaliacaoTemporarios = {
        id_paciente: pacienteAtual.id_paciente,
        nome_paciente: pacienteAtual.nome_paciente,
        sexo_paciente: pacienteAtual.sexo_paciente, // 'M' ou 'F'
        data_nascimento_paciente: pacienteAtual.data_nascimento_paciente,
        score_relatorio: scoreTotal.toFixed(2) // mantido decimal temporariamente para avaliação na tela
    };

    try {
        console.log("Mantendo dados estruturados em trânsito:", dadosAvaliacaoTemporarios);

        // Salvar com chaves idênticas ao banco de dados no localStorage temporário
        localStorage.setItem('id_paciente', dadosAvaliacaoTemporarios.id_paciente.toString());
        localStorage.setItem('nome_paciente', dadosAvaliacaoTemporarios.nome_paciente);
        localStorage.setItem('sexo_paciente', dadosAvaliacaoTemporarios.sexo_paciente);
        localStorage.setItem('data_nascimento_paciente', dadosAvaliacaoTemporarios.data_nascimento_paciente);
        localStorage.setItem('score_relatorio', dadosAvaliacaoTemporarios.score_relatorio);

        window.location.href = 'resultado.html';

    } catch (error) {
        console.error("Erro ao registrar avaliação:", error);
        alert("Erro técnico ao computar os dados da triagem.");
    }
}

/**
 * =========================================================================
 * 6. NAVEGAÇÃO E LOGOUT
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

// Dispara o gatilho inicial ao carregar o DOM
document.addEventListener('DOMContentLoaded', inicializarNovaAvaliacao);