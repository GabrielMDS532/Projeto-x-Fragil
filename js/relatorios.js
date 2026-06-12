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
let relatoriosFiltradosAtuais = []; // Guarda a lista de relatórios pós-filtragem para exportação
let usuariosSistema = []; // Guarda a lista de usuários para filtro dinâmico

async function inicializarRelatorios() {
    if (!verificarAutenticacao()) return;

    // Carregar informações do cabeçalho/menu lateral
    const userEmail = localStorage.getItem('userEmail') || '';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const userDisplayName = localStorage.getItem('userDisplayName') || userEmail.split('@')[0] || 'Usuário';
    
    const userDisplayNameFormated = userDisplayName.charAt(0).toUpperCase() + userDisplayName.slice(1);

    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) userInfoElement.textContent = `👤 ${userDisplayNameFormated}`;

    // Nível de acesso
    const btnUsuarios = document.getElementById('btnUsuarios');
    if (!isAdmin && btnUsuarios) {
        btnUsuarios.style.display = 'none';
    }

    const btnExportar = document.getElementById('btnExportar');
    if (btnExportar) {
        btnExportar.addEventListener('click', exportarRelatorio);
    }

    // Configurar o clique do botão Filtrar
    const btnFiltrar = document.getElementById('btnFiltrar');
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', (e) => {
            e.preventDefault();
            carregarRelatorios();
        });
    }

    // Inicializar o filtro de usuários dinamicamente
    await carregarFiltroUsuarios();

    // Inicializar os filtros de pacientes reais e buscar relatórios
    prepararFiltrosECarregar();
}

async function carregarFiltroUsuarios() {
    try {
        const resposta = await fetch('http://localhost:3000/api/usuarios');
        const dados = await resposta.json();

        if (dados.sucesso) {
            usuariosSistema = dados.usuarios;
            const selectUser = document.getElementById('filterUser');
            if (selectUser) {
                selectUser.innerHTML = '<option value="">Todos</option>';
                usuariosSistema.forEach(usr => {
                    const option = document.createElement('option');
                    option.value = usr.id_usuario;
                    const nomeCompleto = usr.sobrenome_usuario 
                        ? `${usr.nome_usuario} ${usr.sobrenome_usuario}` 
                        : usr.nome_usuario;
                    option.textContent = nomeCompleto;
                    selectUser.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error("Erro ao carregar filtro de usuários:", error);
    }
}

async function prepararFiltrosECarregar() {
    try {
        // Preenche o select de pacientes com dados reais do banco
        const resposta = await fetch('http://localhost:3000/api/pacientes');
        const dados = await resposta.json();

        if (dados.sucesso) {
            const selectPaciente = document.getElementById('filterPatient');
            if (selectPaciente) {
                selectPaciente.innerHTML = '<option value="todos">Todos</option>';
                dados.pacientes.forEach(paciente => {
                    const option = document.createElement('option');
                    option.value = paciente.id_paciente;
                    option.textContent = paciente.nome_paciente;
                    selectPaciente.appendChild(option);
                });
            }

            // Detecta se há id_paciente vindo na URL (fluxo de Histórico)
            const urlParams = new URLSearchParams(window.location.search);
            const idPacienteURL = urlParams.get('id_paciente');

            if (idPacienteURL && selectPaciente) {
                selectPaciente.value = idPacienteURL;
            }
        }

        // Carrega as avaliações reais
        carregarRelatorios();

    } catch (error) {
        console.error("Erro ao preparar filtros de pacientes:", error);
        carregarRelatorios(); // tenta carregar relatórios mesmo com falha no select
    }
}

async function carregarRelatorios() {
    const selectPaciente = document.getElementById('filterPatient');
    const selectResultado = document.getElementById('filterResult');
    const inputDataInicio = document.getElementById('dataInicial');
    const inputDataFim = document.getElementById('dataFinal');

    // Se houver id_paciente na URL, e for o primeiro carregamento, prioriza ele
    const urlParams = new URLSearchParams(window.location.search);
    const idPacienteURL = urlParams.get('id_paciente');

    let idPaciente = selectPaciente ? selectPaciente.value : 'todos';
    
    // Se o select ainda não carregou ou está em todos, mas temos id_paciente na URL, filtra por ele
    if (idPaciente === 'todos' && idPacienteURL) {
        idPaciente = idPacienteURL;
    }

    let url = 'http://localhost:3000/api/relatorios';
    const params = new URLSearchParams();

    if (idPaciente && idPaciente !== 'todos') {
        params.append('id_paciente', idPaciente);
    }

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();

        if (dados.sucesso) {
            renderizarTabelaRelatorios(dados.relatorios, selectResultado?.value, inputDataInicio?.value, inputDataFim?.value);
        } else {
            console.error("Erro do servidor:", dados.mensagem);
            mostrarMensagemErro("Erro ao carregar relatórios do servidor.");
        }
    } catch (error) {
        console.error("Erro de conexão ao buscar relatórios:", error);
        mostrarMensagemErro("Erro de conexão com o servidor. Verifique se o Node.js está online.");
    }
}

function renderizarTabelaRelatorios(relatorios, filtroResultado = 'todos', dataInicio = '', dataFim = '') {
    const tabelaCorpo = document.getElementById('reportsTableBody');
    if (!tabelaCorpo) return;

    tabelaCorpo.innerHTML = '';

    // Filtrar em memória apenas se houver filtros adicionais de frontend não implementados em rotas ainda
    let listaFiltrada = relatorios;

    // Filtro adicional de Resultado (Normal / Encaminhamento)
    if (filtroResultado && filtroResultado !== 'todos') {
        const buscaResultado = filtroResultado === 'encaminhamento' ? 'RECOMENDADO' : 'NAO_RECOMENDADO';
        listaFiltrada = listaFiltrada.filter(r => r.resultado_relatorio === buscaResultado);
    }

    // Filtro adicional de Datas no frontend para complementar
    if (dataInicio) {
        const dataLimiteInicio = new Date(dataInicio + 'T00:00:00Z');
        listaFiltrada = listaFiltrada.filter(r => new Date(r.data_relatorio) >= dataLimiteInicio);
    }

    if (dataFim) {
        const dataLimiteFim = new Date(dataFim + 'T23:59:59Z');
        listaFiltrada = listaFiltrada.filter(r => new Date(r.data_relatorio) <= dataLimiteFim);
    }

    // Filtro adicional de Usuário no frontend
    const selectUser = document.getElementById('filterUser');
    const filtroUsuario = selectUser ? selectUser.value : '';
    if (filtroUsuario) {
        const usr = usuariosSistema.find(u => String(u.id_usuario) === String(filtroUsuario));
        if (usr) {
            listaFiltrada = listaFiltrada.filter(r => 
                r.nome_usuario === usr.nome_usuario && 
                r.sobrenome_usuario === usr.sobrenome_usuario
            );
        }
    }

    // Armazena a lista atualmente filtrada na tabela para a exportação detalhada
    relatoriosFiltradosAtuais = listaFiltrada;

    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    // Configura o cabeçalho de ações dinamicamente para o Admin
    const headerRow = document.querySelector('.tabela-relatorios table thead tr');
    if (headerRow) {
        let colAcoes = document.getElementById('colHeaderAcoes');
        if (isAdmin) {
            if (!colAcoes) {
                const th = document.createElement('th');
                th.id = 'colHeaderAcoes';
                th.textContent = 'Ações';
                headerRow.appendChild(th);
            }
        } else {
            if (colAcoes) {
                colAcoes.remove();
            }
        }
    }

    if (listaFiltrada.length === 0) {
        tabelaCorpo.innerHTML = `
            <tr>
                <td colspan="${isAdmin ? 6 : 5}" style="text-align:center; padding: 40px 20px; color: #64748b;">
                    <div style="font-size: 32px; margin-bottom: 10px;">📄</div>
                    <strong style="font-size: 16px; color: #1e293b; display: block;">Nenhum relatório encontrado</strong>
                    <div style="font-size: 13px; color: #64748b; margin-top: 5px;">
                        Nenhuma triagem foi registrada com os critérios selecionados.
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    listaFiltrada.forEach(item => {
        const tr = document.createElement('tr');

        // Formata a data e hora
        const dataOriginal = new Date(item.data_relatorio);
        const dataFormatada = dataOriginal.toLocaleDateString('pt-BR', { timeZone: 'UTC' }) + ' ' + 
                              dataOriginal.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        // Divide o score de inteiro 0-100 para o padrão decimal 0-1 (ex: 72 -> 0.72)
        const scoreFormatado = (item.score_relatorio / 100).toFixed(2);

        // Define estilo do resultado
        const badgeClass = item.resultado_relatorio === 'RECOMENDADO' ? 'badge badge-danger' : 'badge badge-success';
        const textoResultado = item.resultado_relatorio === 'RECOMENDADO' ? 'Encaminhamento' : 'Normal';

        const nomeProfissional = item.nome_usuario 
            ? `Dr(a). ${item.nome_usuario} ${item.sobrenome_usuario || ''}`
            : 'Profissional';

        let acoesTD = '';
        if (isAdmin) {
            acoesTD = `<td><button class="btn-excluir" onclick="deletarRelatorio(${item.id_relatorio})" style="padding: 6px 12px; font-size: 13px;">🗑️ Remover</button></td>`;
        }

        tr.innerHTML = `
            <td>${dataFormatada}</td>
            <td><strong>${item.nome_paciente}</strong></td>
            <td>${nomeProfissional}</td>
            <td><strong>${scoreFormatado}</strong></td>
            <td><span class="${badgeClass}">${textoResultado}</span></td>
            ${acoesTD}
        `;

        tabelaCorpo.appendChild(tr);
    });
}

function mostrarMensagemErro(msg) {
    const tabelaCorpo = document.getElementById('reportsTableBody');
    if (tabelaCorpo) {
        tabelaCorpo.innerHTML = `<tr><td colspan="5" style="text-align:center; color: red; padding: 20px;">${msg}</td></tr>`;
    }
}

/**
 * =========================================================================
 * 4. LÓGICA DE EXPORTAÇÃO E REMOÇÃO DE RELATÓRIOS
 * =========================================================================
 */
async function exportarRelatorio() {
    if (!relatoriosFiltradosAtuais || relatoriosFiltradosAtuais.length === 0) {
        alert('Nenhum relatório disponível para exportação com os filtros atuais.');
        return;
    }

    const today = new Date();
    const dataEmissao = today.toLocaleDateString('pt-BR') + ' às ' + today.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userDisplayName = localStorage.getItem('userDisplayName') || 'Profissional';
    const userDisplayNameFormated = userDisplayName.charAt(0).toUpperCase() + userDisplayName.slice(1);

    // Calcular estatísticas dinâmicas
    const totalExames = relatoriosFiltradosAtuais.length;
    const totalRecomendados = relatoriosFiltradosAtuais.filter(r => r.resultado_relatorio === 'RECOMENDADO').length;
    const totalNormais = totalExames - totalRecomendados;
    
    const pctRecomendados = ((totalRecomendados / totalExames) * 100).toFixed(1);
    const pctNormais = ((totalNormais / totalExames) * 100).toFixed(1);
    
    let somaScores = 0;
    relatoriosFiltradosAtuais.forEach(r => somaScores += (r.score_relatorio / 100));
    const mediaScore = (somaScores / totalExames).toFixed(2);

    // Preencher as informações de texto do PDF consolidado
    document.getElementById('pdfRepProfessionalName').textContent = `Dr(a). ${userDisplayNameFormated}`;
    document.getElementById('pdfRepEvaluationDate').textContent = dataEmissao;
    document.getElementById('pdfRepTotalExames').textContent = totalExames;
    document.getElementById('pdfRepMediaScore').textContent = mediaScore;
    
    document.getElementById('pdfRepTotalRecomendados').textContent = totalRecomendados;
    document.getElementById('pdfRepPctRecomendados').textContent = `${pctRecomendados}% do total`;
    document.getElementById('pdfRepTotalNormais').textContent = totalNormais;
    document.getElementById('pdfRepPctNormais').textContent = `${pctNormais}% do total`;

    // Alimentar a tabela de triagens do PDF dinamicamente
    const tableBody = document.getElementById('pdfRepTableBody');
    if (tableBody) {
        tableBody.innerHTML = '';
        relatoriosFiltradosAtuais.forEach(item => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #e2e8f0';

            const dataOriginal = new Date(item.data_relatorio);
            const dataFormatada = dataOriginal.toLocaleDateString('pt-BR', { timeZone: 'UTC' }) + ' ' + 
                                  dataOriginal.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            const scoreFormatado = (item.score_relatorio / 100).toFixed(2);
            
            const badgeStyle = item.resultado_relatorio === 'RECOMENDADO' 
                ? 'background-color: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 12px; font-weight: 600;'
                : 'background-color: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 12px; font-weight: 600;';
            const statusTexto = item.resultado_relatorio === 'RECOMENDADO' ? 'Encaminhar' : 'Normal';
            const nomeProfissional = item.nome_usuario 
                ? `Dr(a). ${item.nome_usuario} ${item.sobrenome_usuario || ''}`
                : 'Profissional';

            tr.innerHTML = `
                <td style="padding: 10px; color: #475569;">${dataFormatada}</td>
                <td style="padding: 10px; color: #1e293b; font-weight: 600;">${item.nome_paciente}</td>
                <td style="padding: 10px; color: #475569;">${nomeProfissional}</td>
                <td style="padding: 10px; color: #1e293b; font-weight: 600; text-align: center;">${scoreFormatado}</td>
                <td style="padding: 10px; text-align: center;"><span style="${badgeStyle}">${statusTexto}</span></td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Gerar o PDF consolidado usando a biblioteca html2pdf
    const element = document.getElementById('relatorioConsolidadoPDF');
    if (!element) {
        alert("Erro técnico: O contêiner de exportação PDF não foi encontrado.");
        return;
    }

    element.style.display = 'block';

    const options = {
        margin: [0.4, 0.4, 0.4, 0.4],
        filename: `relatorio-consolidado-triagens-${today.toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2.5, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).save().then(() => {
        element.style.display = 'none';
    }).catch(err => {
        console.error("Erro na geração do PDF consolidado:", err);
        alert("Ocorreu um erro técnico ao gerar o relatório em PDF.");
        element.style.display = 'none';
    });
}

// Vincula a chamada direta do HTML de onclick do relatorios.html
function exportReport() {
    exportarRelatorio();
}

function exportarCSV() {
    if (!relatoriosFiltradosAtuais || relatoriosFiltradosAtuais.length === 0) {
        alert('Nenhum relatório disponível para exportação com os filtros atuais.');
        return;
    }

    // Cabeçalho do CSV
    const cabecalho = ['Data', 'Paciente', 'Profissional', 'Score', 'Resultado', 'Observações'];
    
    // Mapear linhas
    const linhas = relatoriosFiltradosAtuais.map(item => {
        const dataOriginal = new Date(item.data_relatorio);
        const dataFormatada = dataOriginal.toLocaleDateString('pt-BR', { timeZone: 'UTC' }) + ' ' + 
                              dataOriginal.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        const scoreFormatado = (item.score_relatorio / 100).toFixed(2);
        const textoResultado = item.resultado_relatorio === 'RECOMENDADO' ? 'Encaminhamento' : 'Normal';
        const nomeProfissional = item.nome_usuario 
            ? `Dr(a). ${item.nome_usuario} ${item.sobrenome_usuario || ''}`
            : 'Profissional';
        const observacoes = item.observacoes_relatorio || '';

        // Escapar aspas duplas no CSV e juntar por ponto e vírgula
        return [
            `"${dataFormatada.replace(/"/g, '""')}"`,
            `"${item.nome_paciente.replace(/"/g, '""')}"`,
            `"${nomeProfissional.replace(/"/g, '""')}"`,
            `"${scoreFormatado.replace(/"/g, '""')}"`,
            `"${textoResultado.replace(/"/g, '""')}"`,
            `"${observacoes.replace(/"/g, '""')}"`
        ].join(';');
    });

    // Conteúdo do CSV com BOM UTF-8 (\uFEFF)
    const csvContent = '\uFEFF' + [cabecalho.join(';'), ...linhas].join('\n');

    // Criação do link e download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const today = new Date();
    const dataArquivo = today.toISOString().split('T')[0];
    
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-consolidado-triagens-${dataArquivo}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Rota de exclusão física de relatórios no MySQL (Restrita a administradores)
async function deletarRelatorio(id) {
    if (!confirm('Deseja realmente remover este relatório? Esta ação apagará permanentemente o registro de triagem do banco de dados.')) return;

    try {
        const resposta = await fetch(`http://localhost:3000/api/relatorios/${id}`, {
            method: 'DELETE'
        });
        const dados = await resposta.json();

        if (dados.sucesso) {
            alert('Relatório removido com sucesso!');
            carregarRelatorios(); // Atualiza a tabela dinamicamente do banco real
        } else {
            alert('Erro ao remover relatório: ' + dados.mensagem);
        }
    } catch (error) {
        console.error("Erro na requisição de exclusão do relatório:", error);
        alert("Erro técnico ao tentar remover o relatório do banco de dados.");
    }
}

/**
 * =========================================================================
 * 4. NAVEGAÇÃO E SESSÃO GLOBAIS
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

// Inicializa o script
document.addEventListener('DOMContentLoaded', inicializarRelatorios);