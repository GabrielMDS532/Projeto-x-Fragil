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
 * 2. INICIALIZAÇÃO DA PÁGINA E CARREGAMENTO DE DADOS (SQL V2 CHAVES)
 * =========================================================================
 */
let dadosTriagem = null;

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

async function inicializarResultado() {
    if (!verificarAutenticacao()) return;

    // Configurar cabeçalho/menu lateral
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

    // Carregar dados temporários em perfeita consonância com as chaves SQL v2
    const patientName = localStorage.getItem('nome_paciente');
    const patientSex = localStorage.getItem('sexo_paciente') || '';
    const patientBirth = localStorage.getItem('data_nascimento_paciente');
    const scoreStr = localStorage.getItem('score_relatorio');
    const patientId = localStorage.getItem('id_paciente');

    if (!patientName || !scoreStr) {
        alert('Nenhuma avaliação encontrada!');
        window.location.href = 'nova_avaliacao.html';
        return;
    }

    const score = parseFloat(scoreStr);
    
    // Determinar limiar baseado no sexo (M = Masculino, F = Feminino)
    const isMale = patientSex === 'M';
    const threshold = isMale ? 0.56 : 0.52;
    const needsReferral = score >= threshold;

    dadosTriagem = {
        id_paciente: patientId ? parseInt(patientId) : 1,
        nome_paciente: patientName,
        sexo_paciente: patientSex, // 'M' ou 'F'
        data_nascimento_paciente: patientBirth,
        scoreRaw: score,
        limiar: threshold,
        recomendado: needsReferral
    };

    // Preencher elementos visuais
    document.getElementById('resPatientName').textContent = dadosTriagem.nome_paciente;
    document.getElementById('resPatientSex').textContent = dadosTriagem.sexo_paciente === 'M' ? 'Masculino' : 'Feminino';
    document.getElementById('resPatientAge').textContent = calcularIdade(dadosTriagem.data_nascimento_paciente);
    document.getElementById('scoreValue').textContent = dadosTriagem.scoreRaw.toFixed(2);
    
    document.getElementById('thresholdSex').textContent = dadosTriagem.sexo_paciente === 'M' ? 'Masculino' : 'Feminino';
    document.getElementById('thresholdValue').textContent = dadosTriagem.limiar.toFixed(2);

    const recDiv = document.getElementById('recommendation');
    const recIcon = document.getElementById('recIcon');
    const recBadge = document.getElementById('recBadge');
    const recText = document.getElementById('recText');

    if (dadosTriagem.recomendado) {
        recDiv.className = 'recomendacao alerta';
        recIcon.textContent = '⚠️';
        recBadge.textContent = 'Encaminhamento Recomendado';
        recBadge.className = 'badge badge-danger';
        recText.innerHTML = `O score obtido (${dadosTriagem.scoreRaw.toFixed(2)}) está acima ou igual ao limiar de ${dadosTriagem.limiar.toFixed(2)} para pacientes do sexo ${dadosTriagem.sexo_paciente === 'M' ? 'masculino' : 'feminino'}.<br><strong style="display: block; margin-top: 10px;">Recomendação: Encaminhamento para teste genético e avaliação clínica detalhada de X-Frágil.</strong>`;
    } else {
        recDiv.className = 'recomendacao normal';
        recIcon.textContent = '✅';
        recBadge.textContent = 'Acompanhamento de Rotina';
        recBadge.className = 'badge badge-success';
        recText.innerHTML = `O score obtido (${dadosTriagem.scoreRaw.toFixed(2)}) está abaixo do limiar de ${dadosTriagem.limiar.toFixed(2)} para pacientes do sexo ${dadosTriagem.sexo_paciente === 'M' ? 'masculino' : 'feminino'}.<br><strong style="display: block; margin-top: 10px;">Recomendação: Manter acompanhamento de desenvolvimento padrão sem necessidade de encaminhamento imediato.</strong>`;
    }

    const today = new Date();
    document.getElementById('evaluationDate').textContent = today.toLocaleDateString('pt-BR') + ' ' + today.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Preenche o template invisível do PDF com fallback de localStorage inicial
    preencherLaudoPDF();

    // Faz busca real no banco de dados do MySQL para obter CPF e Responsável para o laudo
    try {
        const resposta = await fetch(`http://localhost:3000/api/pacientes/${dadosTriagem.id_paciente}`, { credentials: 'include' });
        const dados = await resposta.json();
        if (dados.sucesso && dados.paciente) {
            preencherLaudoPDF(dados.paciente);
        }
    } catch (err) {
        console.warn("Não foi possível carregar dados completos do paciente do MySQL para o PDF:", err);
    }
}

/**
 * =========================================================================
 * 3. LÓGICA DE SALVAMENTO (INTEGRAÇÃO SQL V2 E SIMULAÇÃO API)
 * =========================================================================
 */
async function saveEvaluation() {
    if (!dadosTriagem) return;

    // Recupera o ID do profissional logado
    let userId = localStorage.getItem('userId');
    if (!userId) {
        console.warn("userId não encontrado no localStorage. Usando id_usuario = 1 como fallback temporário.");
        userId = "1";
    }

    // Conversão de escala do score para bater com INT no SQL v2 (escala 0-100)
    const scoreConvertido = Math.round(dadosTriagem.scoreRaw * 100);

    // Chaves estruturadas em perfeita conformidade com as colunas do SQL v2
    const dadosRelatorioDB = {
        usuario_id_relatorio: parseInt(userId),
        paciente_id_relatorio: dadosTriagem.id_paciente,
        score_relatorio: scoreConvertido,
        resultado_relatorio: dadosTriagem.recomendado ? 'RECOMENDADO' : 'NAO_RECOMENDADO',
        observacoes_relatorio: dadosTriagem.recomendado 
            ? "Encaminhamento para teste genético recomendado pelo sistema de triagem." 
            : "Acompanhamento clínico padrão recomendado."
    };

    try {
        // Envia requisição real ao servidor backend
        const resposta = await fetch('http://localhost:3000/api/relatorios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(dadosRelatorioDB)
        });

        const dados = await resposta.json();

        if (dados.sucesso) {
            alert('Avaliação salva com sucesso no banco de dados real!');
            
            // Limpar somente dados temporários de trânsito da triagem do localStorage
            localStorage.removeItem('nome_paciente');
            localStorage.removeItem('sexo_paciente');
            localStorage.removeItem('data_nascimento_paciente');
            localStorage.removeItem('score_relatorio');
            localStorage.removeItem('id_paciente');

            // Redireciona de volta para a lista de pacientes
            window.location.href = '../Principais/pacientes.html';
        } else {
            alert('Erro do servidor ao salvar avaliação: ' + dados.mensagem);
        }
    } catch (error) {
        console.error("Erro ao salvar avaliação via API:", error);
        alert("Erro técnico ao salvar a triagem no MySQL. Certifique-se de que o backend está online.");
    }
}

function printResult() {
    if (!dadosTriagem) return;

    // 1. Torna o bloco do laudo temporariamente visível para o html2pdf capturar
    const element = document.getElementById('laudoClinicoPDF');
    if (!element) {
        alert("Erro técnico: O contêiner do laudo PDF não foi encontrado.");
        return;
    }

    element.style.display = 'block';

    // 2. Configurações premium do arquivo PDF gerado
    const options = {
        margin: [0.4, 0.4, 0.4, 0.4], // Margem de 0.4 polegadas para visual profissional
        filename: `laudo-triagem-${dadosTriagem.nome_paciente.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2.5, useCORS: true, letterRendering: true }, // Escala maior para nitidez excelente
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // 3. Executa a conversão e o download do PDF
    html2pdf().set(options).from(element).save().then(() => {
        // Oculta novamente o elemento após o processo de download
        element.style.display = 'none';
    }).catch(err => {
        console.error("Erro na geração do PDF via html2pdf:", err);
        alert("Ocorreu um erro técnico ao gerar o laudo em PDF.");
        element.style.display = 'none';
    });
}

// Preenche dinamicamente o template do laudo de impressão com dados consolidados
function preencherLaudoPDF(paciente = {}) {
    if (!dadosTriagem) return;

    const today = new Date();
    const dataFormatada = today.toLocaleDateString('pt-BR') + ' às ' + today.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userDisplayName = localStorage.getItem('userDisplayName') || 'Profissional';
    const userDisplayNameFormated = userDisplayName.charAt(0).toUpperCase() + userDisplayName.slice(1);

    document.getElementById('pdfPatientName').textContent = dadosTriagem.nome_paciente || 'Não informado';
    document.getElementById('pdfPatientCPF').textContent = paciente.cpf || 'Não informado';
    document.getElementById('pdfPatientSex').textContent = dadosTriagem.sexo_paciente === 'M' ? 'Masculino' : 'Feminino';
    
    const dataNascStr = dadosTriagem.data_nascimento_paciente;
    const dataNascFormated = dataNascStr 
        ? new Date(dataNascStr).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
        : '';
    const idadeStr = calcularIdade(dadosTriagem.data_nascimento_paciente);
    document.getElementById('pdfPatientAge').textContent = dataNascFormated ? `${dataNascFormated} (${idadeStr})` : idadeStr;
    
    document.getElementById('pdfPatientGuardian').textContent = paciente.nome_responsavel || 'Não informado';

    document.getElementById('pdfScoreValue').textContent = dadosTriagem.scoreRaw.toFixed(2);
    document.getElementById('pdfThresholdValue').textContent = dadosTriagem.limiar.toFixed(2);

    const recBox = document.getElementById('pdfRecommendationBox');
    const recIcon = document.getElementById('pdfRecIcon');
    const recBadge = document.getElementById('pdfRecBadge');
    const recText = document.getElementById('pdfRecText');

    if (dadosTriagem.recomendado) {
        recBox.style.backgroundColor = '#fee2e2';
        recBox.style.borderColor = '#ef4444';
        recBox.style.color = '#991b1b';
        recIcon.textContent = '⚠️';
        recBadge.textContent = 'Encaminhamento Recomendado';
        recText.innerHTML = `O score obtido (<strong>${dadosTriagem.scoreRaw.toFixed(2)}</strong>) atingiu ou superou o limiar de corte estabelecido para o sexo biológico do paciente (<strong>${dadosTriagem.limiar.toFixed(2)}</strong>).<br><strong style="display: block; margin-top: 10px;">Recomendação Clínica:</strong> Indica-se encaminhamento formal para consulta com médico geneticista e realização de teste genético molecular (análise de expansão de trinucleotídeos CGG no gene FMR1 via PCR e/ou Southern Blot) para confirmação de diagnóstico para a Síndrome do X-Frágil.`;
    } else {
        recBox.style.backgroundColor = '#d1fae5';
        recBox.style.borderColor = '#10b981';
        recBox.style.color = '#065f46';
        recIcon.textContent = '✅';
        recBadge.textContent = 'Acompanhamento de Rotina';
        recText.innerHTML = `O score obtido (<strong>${dadosTriagem.scoreRaw.toFixed(2)}</strong>) encontra-se abaixo do limiar de corte de referência para o sexo biológico do paciente (<strong>${dadosTriagem.limiar.toFixed(2)}</strong>).<br><strong style="display: block; margin-top: 10px;">Recomendação Clínica:</strong> O paciente apresenta desenvolvimento clínico-comportamental dentro da faixa esperada em relação aos critérios triados. Recomenda-se manter o acompanhamento pediátrico e de desenvolvimento escolar de rotina habitual.`;
    }

    document.getElementById('pdfEvaluationDate').textContent = dataFormatada;
    document.getElementById('pdfProfessionalName').textContent = `Dr(a). ${userDisplayNameFormated}`;
}

function navigate(page) {
    window.location.href = page;
}

function logout() {
    encerrarSessao('../cadastro/login.html');
}

// Inicializa a página ao carregar o DOM
document.addEventListener('DOMContentLoaded', inicializarResultado);
