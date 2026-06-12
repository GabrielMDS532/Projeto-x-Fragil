/**
 * =========================================================================
 * 1. CONTROLE DE ACESSO E SEGURANÇA
 * =========================================================================
 */
function verificarAutenticacao() {
    return true;
}

/**
 * =========================================================================
 * 2. CONFIGURAÇÕES E INICIALIZAÇÃO
 * =========================================================================
 */
let pacientesAtuais = []; // Agora vai guardar os dados reais do banco

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

    // Configurar filtros dinâmicos
    configurarFiltros();

    // Carregar dados reais do Banco de Dados
    carregarPacientes();
}

/**
 * =========================================================================
 * 3. BUSCA E RENDERIZAÇÃO DOS DADOS (CONECTADO AO MYSQL COM FILTROS)
 * =========================================================================
 */
async function carregarPacientes() {
    const inputCpf = document.getElementById('searchCpf');
    const selectSexo = document.getElementById('filterSex');

    const cpf = inputCpf ? inputCpf.value.trim() : '';
    const sexo = selectSexo ? selectSexo.value : 'todos';

    // Construção segura dos parâmetros de busca
    let url = 'http://localhost:3000/api/pacientes';
    const params = new URLSearchParams();
    if (cpf) params.append('cpf', cpf);
    if (sexo && sexo !== 'todos') params.append('sexo', sexo);

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    try {
        const resposta = await fetch(url, { credentials: 'include' });
        const dados = await resposta.json();

        if (dados.sucesso) {
            pacientesAtuais = dados.pacientes;
            renderizarTabela(pacientesAtuais);
        } else {
            console.error("Erro do servidor:", dados.mensagem);
            document.getElementById('patientsTable').innerHTML = `<tr><td colspan="5" style="text-align:center; color: red;">Erro ao carregar pacientes do banco de dados.</td></tr>`;
        }
    } catch (error) {
        console.error("Erro ao buscar lista de pacientes:", error);
        document.getElementById('patientsTable').innerHTML = `<tr><td colspan="5" style="text-align:center; color: red;">Servidor offline. Verifique se o Node.js está rodando.</td></tr>`;
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
        tabelaCorpo.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding: 40px 20px; color: #64748b;">
                    <div style="font-size: 32px; margin-bottom: 10px;">🔍</div>
                    <strong style="font-size: 16px; color: #1e293b; display: block;">Paciente não encontrado</strong>
                    <div style="font-size: 13px; color: #64748b; margin-top: 5px;">
                        Nenhum registro corresponde ao CPF ou filtro de sexo pesquisado. Verifique os dados e tente novamente.
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    const isAdmin = localStorage.getItem('isAdmin') === 'true'; // Verifica perfil de acesso

    listaDePacientes.forEach(paciente => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-sexo', paciente.sexo_paciente);

        const sexoExibicao = paciente.sexo_paciente === 'M' ? 'Masculino' : 'Feminino';
        const idadeCalculada = calcularIdade(paciente.data_nascimento_paciente);
        
        // Formatando data de nascimento (Lidando com o formato ISO que vem do MySQL)
        const dataFormatada = paciente.data_nascimento_paciente 
            ? new Date(paciente.data_nascimento_paciente).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
            : '';

        // Formatação segura com máscara de CPF
        let cpfHTML = '';
        if (paciente.cpf) {
            if (isAdmin) {
                cpfHTML = `
                    <div style="font-size: 12px; color: #64748b; margin-top: 3px; display: flex; align-items: center; gap: 6px;">
                        <span>CPF: <span id="cpf-text-${paciente.id_paciente}">${mascararCPF(paciente.cpf)}</span></span>
                        <button onclick="alternarVisibilidadeCPF(this, ${paciente.id_paciente}, '${paciente.cpf}')" style="background: none; border: none; cursor: pointer; font-size: 12px; padding: 0; display: inline-flex; align-items: center; line-height: 1;" title="Revelar CPF">👁️</button>
                    </div>
                `;
            } else {
                cpfHTML = `<div style="font-size: 12px; color: #64748b; margin-top: 3px;">CPF: ${mascararCPF(paciente.cpf)}</div>`;
            }
        } else {
            cpfHTML = `<div style="font-size: 12px; color: #64748b; margin-top: 3px;">CPF: -</div>`;
        }

        tr.innerHTML = `
            <td>
                <strong>${paciente.nome_paciente}</strong>
                ${cpfHTML}
            </td>
            <td>${sexoExibicao}</td>
            <td>${idadeCalculada} (${dataFormatada})</td>
            <td>${paciente.nome_responsavel || '-'}</td>
            <td>
                <div class="btn-acoes">
                    <button class="btn-avaliar" onclick="navigate('../Secundarias/nova_avaliacao.html?id_paciente=${paciente.id_paciente}')">📋 Avaliar</button>
                    <button class="btn-editar" onclick="navigate('../Secundarias/novo_paciente.html?id_paciente=${paciente.id_paciente}')">✏️ Editar</button>
                    <button class="btn-historico" onclick="navigate('../Principais/relatorios.html?id_paciente=${paciente.id_paciente}')">📜 Histórico</button>
                    <button class="btn-excluir" onclick="excluirPaciente(${paciente.id_paciente})">🗑️ Remover</button>
                </div>
            </td>
        `;

        tabelaCorpo.appendChild(tr);
    });
}

/**
 * =========================================================================
 * 4. FILTROS E BUSCAS DINÂMICAS VIA API
 * =========================================================================
 */
function configurarFiltros() {
    const inputCpf = document.getElementById('searchCpf');
    const selectSexo = document.getElementById('filterSex');

    if (inputCpf) {
        inputCpf.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
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

            // Busca dinamicamente no backend na digitação
            carregarPacientes();
        });
    }

    if (selectSexo) {
        selectSexo.addEventListener('change', carregarPacientes);
    }
}

/**
 * =========================================================================
 * 5. REMOÇÃO DE PACIENTE (CONECTADO AO BACKEND)
 * =========================================================================
 */
async function excluirPaciente(id) {
    if (!confirm('Deseja realmente remover este paciente? Esta ação é irreversível.')) return;

    try {
        const resposta = await fetch(`http://localhost:3000/api/pacientes/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        const dados = await resposta.json();

        if (dados.sucesso) {
            alert('Paciente removido com sucesso!');
            // Recarrega a lista direto do banco de dados
            carregarPacientes();
        } else {
            alert('Erro ao remover paciente: ' + dados.mensagem);
        }
    } catch (error) {
        console.error("Erro na requisição de exclusão:", error);
        alert("Houve um erro técnico ao tentar remover o paciente.");
    }
}

function exibirAvisoHistorico() {
    alert("O histórico clínico do paciente estará disponível em breve, após a integração com o módulo de Relatórios.");
}

// Mascara o CPF deixando apenas as 6 "letras"/números do meio visíveis (ex: ***.456.789-**)
function mascararCPF(cpf) {
    if (!cpf || cpf.length < 14) return cpf || '-';
    return `***.${cpf.substring(4, 11)}-**`;
}

// Alterna a visibilidade do CPF para o Admin de forma persistente (manual toggle)
function alternarVisibilidadeCPF(btn, id, cpfReal) {
    const element = document.getElementById(`cpf-text-${id}`);
    if (!element) return;

    const cpfMascarado = mascararCPF(cpfReal);
    const estaMascarado = element.textContent === cpfMascarado;

    if (estaMascarado) {
        element.textContent = cpfReal;
        btn.textContent = '👁️';
        btn.title = 'Ocultar CPF';
    } else {
        element.textContent = cpfMascarado;
        btn.textContent = '👁️';
        btn.title = 'Revelar CPF';
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
    encerrarSessao('../cadastro/login.html');
}

// Dispara o gatilho inicial ao carregar o DOM
document.addEventListener('DOMContentLoaded', inicializarPacientes);