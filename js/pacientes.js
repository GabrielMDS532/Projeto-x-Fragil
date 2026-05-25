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
 * 2. CONFIGURAÇÕES E DADOS TEMPORÁRIOS DE SIMULAÇÃO (PRONTO PARA API)
 * =========================================================================
 */
let pacientesAtuais = [];

// Dados temporários de amostra (apenas criados caso o banco de dados simulado esteja vazio)
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

function inicializarPacientes() {
    if (!verificarAutenticacao()) return;

    // Carregar informações do cabeçalho/menu lateral
    const userEmail = localStorage.getItem('userEmail') || '';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const userDisplayName = localStorage.getItem('userDisplayName') || userEmail.split('@')[0] || 'Usuário';
    
    const userDisplayNameFormated = userDisplayName.charAt(0).toUpperCase() + userDisplayName.slice(1);

    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) userInfoElement.textContent = `👤 ${userDisplayNameFormated}`;

    // Restrição de nível de acesso
    const btnUsuarios = document.getElementById('btnUsuarios');
    if (!isAdmin && btnUsuarios) {
        btnUsuarios.style.display = 'none';
    }

    // Configurar filtros
    configurarFiltros();

    // Carregar dados
    carregarPacientes();
}

/**
 * =========================================================================
 * 3. BUSCA E RENDERIZAÇÃO DOS DADOS (SIMULAÇÃO BANCO DE DADOS / API)
 * =========================================================================
 */
async function carregarPacientes() {
    try {
        const dadosSalvos = localStorage.getItem('pacientesSimulados');
        if (dadosSalvos) {
            pacientesAtuais = JSON.parse(dadosSalvos);
        } else {
            // Inicialização com dados temporários se a base estiver vazia
            pacientesAtuais = [...PACIENTES_TEMPORARIOS_INICIAIS];
            localStorage.setItem('pacientesSimulados', JSON.stringify(pacientesAtuais));
        }
        
        renderizarTabela(pacientesAtuais);
    } catch (error) {
        console.error("Erro ao buscar lista de pacientes:", error);
    }
}

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

function renderizarTabela(listaDePacientes) {
    const tabelaCorpo = document.getElementById('patientsTable');
    if (!tabelaCorpo) return;

    tabelaCorpo.innerHTML = '';

    if (listaDePacientes.length === 0) {
        tabelaCorpo.innerHTML = `<tr><td colspan="5" style="text-align:center; color: #64748b;">Nenhum paciente cadastrado.</td></tr>`;
        return;
    }

    listaDePacientes.forEach(paciente => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-sexo', paciente.sexo_paciente);

        const sexoExibicao = paciente.sexo_paciente === 'M' ? 'Masculino' : 'Feminino';
        const idadeCalculada = calcularIdade(paciente.data_nascimento_paciente);
        
        // Formatando data de nascimento legível
        const dataFormatada = paciente.data_nascimento_paciente 
            ? new Date(paciente.data_nascimento_paciente).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
            : '';

        tr.innerHTML = `
            <td><strong>${paciente.nome_paciente}</strong></td>
            <td>${sexoExibicao}</td>
            <td>${idadeCalculada} (${dataFormatada})</td>
            <td>${paciente.nome_responsavel || '-'}</td>
            <td>
                <div class="btn-acoes">
                    <button class="btn-avaliar" onclick="navigate('../Secundarias/nova_avaliacao.html?id_paciente=${paciente.id_paciente}')">📋 Avaliar</button>
                    <button class="btn-excluir" onclick="excluirPaciente(${paciente.id_paciente})">🗑️ Remover</button>
                </div>
            </td>
        `;

        tabelaCorpo.appendChild(tr);
    });
}

/**
 * =========================================================================
 * 4. FILTROS DINÂMICOS
 * =========================================================================
 */
function configurarFiltros() {
    const inputNome = document.getElementById('searchName');
    const selectSexo = document.getElementById('filterSex');

    if (inputNome) inputNome.addEventListener('input', filtrarPacientes);
    if (selectSexo) selectSexo.addEventListener('change', filtrarPacientes);
}

function filtrarPacientes() {
    const buscaNome = document.getElementById('searchName')?.value.toLowerCase() || '';
    const filtroSexo = document.getElementById('filterSex')?.value || 'todos';

    const pacientesFiltrados = pacientesAtuais.filter(paciente => {
        const correspondeNome = paciente.nome_paciente.toLowerCase().includes(buscaNome);
        const correspondeSexo = filtroSexo === 'todos' || paciente.sexo_paciente === filtroSexo;
        
        return correspondeNome && correspondeSexo;
    });

    renderizarTabela(pacientesFiltrados);
}

/**
 * =========================================================================
 * 5. REMOÇÃO DE PACIENTE (SIMULAÇÃO BANCO DE DADOS / API)
 * =========================================================================
 */
async function excluirPaciente(id) {
    if (!confirm('Deseja realmente remover este paciente? Esta ação excluirá seus dados do banco simulado.')) return;

    try {
        console.log(`Simulando exclusão do Paciente ID: ${id} no Banco`);

        pacientesAtuais = pacientesAtuais.filter(p => p.id_paciente !== id);
        localStorage.setItem('pacientesSimulados', JSON.stringify(pacientesAtuais));
        
        renderizarTabela(pacientesAtuais);
        alert('Paciente removido com sucesso!');
    } catch (error) {
        console.error("Erro ao remover paciente:", error);
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
document.addEventListener('DOMContentLoaded', inicializarPacientes);