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

    // Configurar máscara de CPF
    configurarMascaraCPF();

    // Detectar se está no modo de edição (presença do id_paciente na URL)
    const urlParams = new URLSearchParams(window.location.search);
    const idPaciente = urlParams.get('id_paciente');
    
    if (idPaciente) {
        carregarDadosPacienteEdicao(idPaciente);
    }

    // Configurar o ouvinte de envio do formulário
    const formulario = document.getElementById('patientForm');
    if (formulario) {
        formulario.addEventListener('submit', salvarPaciente);
    }
}

function configurarMascaraCPF() {
    const inputCpf = document.getElementById('cpf');
    if (inputCpf) {
        inputCpf.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove tudo o que não é número
            if (value.length > 11) value = value.slice(0, 11);

            // Máscara: 000.000.000-00
            if (value.length > 9) {
                value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
            } else if (value.length > 6) {
                value = value.replace(/^(\d{3})(\d{3})(\d{1,3})$/, "$1.$2.$3");
            } else if (value.length > 3) {
                value = value.replace(/^(\d{3})(\d{1,3})$/, "$1.$2");
            }
            e.target.value = value;
        });
    }
}

// Função para buscar dados do paciente para edição
async function carregarDadosPacienteEdicao(id) {
    try {
        const resposta = await fetch(`http://localhost:3000/api/pacientes/${id}`);
        const dados = await resposta.json();

        if (dados.sucesso) {
            const paciente = dados.paciente;

            // Preenche o formulário
            document.getElementById('nome_paciente').value = paciente.nome_paciente;
            document.getElementById('cpf').value = paciente.cpf || '';
            document.getElementById('sexo_paciente').value = paciente.sexo_paciente;

            // Formatação correta da data para o input HTML tipo 'date' (yyyy-MM-dd)
            if (paciente.data_nascimento_paciente) {
                const dataRaw = new Date(paciente.data_nascimento_paciente);
                const ano = dataRaw.getUTCFullYear();
                const mes = String(dataRaw.getUTCMonth() + 1).padStart(2, '0');
                const dia = String(dataRaw.getUTCDate()).padStart(2, '0');
                document.getElementById('data_nascimento_paciente').value = `${ano}-${mes}-${dia}`;
            }

            document.getElementById('nome_responsavel').value = paciente.nome_responsavel || '';
            document.getElementById('telefone_paciente').value = paciente.telefone_paciente || '';
            document.getElementById('observacoes_paciente').value = paciente.observacoes_paciente || '';

            // Atualiza os títulos da página de forma elegante
            const tituloForm = document.querySelector('.Mensagem_entrada h4');
            if (tituloForm) tituloForm.textContent = "Editar Paciente";

            const btnSalvar = document.querySelector('#patientForm button[type="submit"]');
            if (btnSalvar) btnSalvar.textContent = "Salvar Alterações";

        } else {
            alert("Erro ao carregar dados do paciente: " + dados.mensagem);
            window.location.href = '../Principais/pacientes.html';
        }
    } catch (error) {
        console.error("Erro ao carregar dados do paciente:", error);
        alert("Erro técnico ao carregar os dados para edição.");
    }
}

/**
 * =========================================================================
 * 3. LÓGICA DE CADASTRO OU ATUALIZAÇÃO (DINÂMICO POST/PUT)
 * =========================================================================
 */
async function salvarPaciente(event) {
    event.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const idPaciente = urlParams.get('id_paciente');

    const inputNome = document.getElementById('nome_paciente');
    const inputCpf = document.getElementById('cpf');
    const selectSexo = document.getElementById('sexo_paciente');
    const inputDataNasc = document.getElementById('data_nascimento_paciente');
    const inputResponsavel = document.getElementById('nome_responsavel');
    const inputTelefone = document.getElementById('telefone_paciente');
    const textareaObservacoes = document.getElementById('observacoes_paciente');
    
    if (!inputNome || !inputCpf || !selectSexo || !inputDataNasc || !inputResponsavel || !inputTelefone) return;

    // Montando o objeto JSON
    const dadosPaciente = {
        nome_paciente: inputNome.value.trim(),
        cpf: inputCpf.value.trim(),
        sexo_paciente: selectSexo.value, 
        data_nascimento_paciente: inputDataNasc.value, 
        nome_responsavel: inputResponsavel.value.trim(),
        telefone_paciente: inputTelefone.value.trim(),
        observacoes_paciente: textareaObservacoes ? textareaObservacoes.value.trim() : null
    };

    const url = idPaciente 
        ? `http://localhost:3000/api/pacientes/${idPaciente}`
        : 'http://localhost:3000/api/pacientes';

    const metodo = idPaciente ? 'PUT' : 'POST';

    try {
        const resposta = await fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosPaciente)
        });

        const dados = await resposta.json();

        if (dados.sucesso) {
            alert(idPaciente ? 'Dados do paciente atualizados com sucesso!' : 'Paciente cadastrado com sucesso!');
            // Redireciona de volta para a lista geral
            window.location.href = '../Principais/pacientes.html';
        } else {
            alert('Erro do servidor: ' + dados.mensagem);
        }

    } catch (error) {
        console.error("Erro na requisição de salvamento:", error);
        alert("Houve um erro técnico ao tentar salvar. Verifique se o backend está rodando.");
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