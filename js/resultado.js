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

function inicializarResultado() {
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
}

/**
 * =========================================================================
 * 3. LÓGICA DE SALVAMENTO (INTEGRAÇÃO SQL V2 E SIMULAÇÃO API)
 * =========================================================================
 */
async function saveEvaluation() {
    if (!dadosTriagem) return;

    // Conversão de escala do score para bater com INT no SQL v2 (escala 0-100)
    const scoreConvertido = Math.round(dadosTriagem.scoreRaw * 100);

    // Chaves estruturadas em perfeita conformidade com as colunas do SQL v2
    const dadosRelatorioDB = {
        usuario_id_relatorio: 1, // ID do profissional logado
        paciente_id_relatorio: dadosTriagem.id_paciente,
        score_relatorio: scoreConvertido,
        resultado_relatorio: dadosTriagem.recomendado ? 'RECOMENDADO' : 'NAO_RECOMENDADO',
        observacoes_relatorio: dadosTriagem.recomendado ? "Encaminhamento para teste genético recomendado pelo sistema de triagem." : "Acompanhamento clínico padrão recomendado."
    };

    try {
        console.log("Simulando salvamento no Banco de Dados (SQL v2):", dadosRelatorioDB);
        
        // localStorage usado apenas como simulação temporária de persistência da API
        const relatoriosSalvos = JSON.parse(localStorage.getItem('relatoriosSimulados') || '[]');
        relatoriosSalvos.push({
            id_relatorio: relatoriosSalvos.length + 1,
            data_relatorio: new Date().toISOString(),
            ...dadosRelatorioDB,
            nome_paciente: dadosTriagem.nome_paciente // Apenas para exibição amigável
        });
        localStorage.setItem('relatoriosSimulados', JSON.stringify(relatoriosSalvos));

        alert('Avaliação salva com sucesso no banco de dados simulado!');
        
        // Limpar dados temporários do localStorage
        localStorage.removeItem('nome_paciente');
        localStorage.removeItem('sexo_paciente');
        localStorage.removeItem('data_nascimento_paciente');
        localStorage.removeItem('score_relatorio');
        localStorage.removeItem('id_paciente');

        window.location.href = '../Principais/pacientes.html';
    } catch (error) {
        console.error("Erro ao salvar avaliação:", error);
        alert("Erro técnico ao salvar a triagem.");
    }
}

function printResult() {
    // 1. Abre a tela de print nativa
    window.print();

    // 2. Gera download imediato do laudo clínico em PDF/TXT formatado no Chrome
    if (!dadosTriagem) return;
    
    const displayUser = localStorage.getItem('userDisplayName') || 'Profissional';
    
    const clinicalTextContent = `======================================================================
                        LAUDO CLÍNICO DE TRIAGEM
                     SISTEMA DE TRIAGEM X-FRÁGIL
======================================================================

[DADOS DO PACIENTE]
Nome Completo: ${dadosTriagem.nome_paciente}
Identificação ID: ${dadosTriagem.id_paciente}
Sexo Biológico: ${dadosTriagem.sexo_paciente === 'M' ? 'Masculino (M)' : 'Feminino (F)'}
Data de Nascimento: ${dadosTriagem.data_nascimento_paciente}
Idade Calculada: ${calcularIdade(dadosTriagem.data_nascimento_paciente)}

[ANÁLISE DE SCORE CLÍNICO]
Score de Triagem Obtido: ${dadosTriagem.scoreRaw.toFixed(2)}
Limiar de Corte para o Sexo: ${dadosTriagem.limiar.toFixed(2)}
Status de Recomendação: ${dadosTriagem.recomendado ? 'RECOMENDADO' : 'NAO_RECOMENDADO'}

[VEREDITO E RECOMENDAÇÕES]
${dadosTriagem.recomendado 
    ? 'ATENÇÃO: O score clínico do paciente atinge ou supera o limiar biológico estabelecido para a síndrome do X-Frágil.\nRecomenda-se formalmente o encaminhamento do paciente a um geneticista e a realização do teste genético molecular (PCR/Southern Blot).' 
    : 'Acompanhamento de rotina padrão. O score clínico obtido situa-se na faixa de normalidade biológica estabelecida para o sexo do paciente.'}

======================================================================
Data e Hora de Emissão: ${new Date().toLocaleString('pt-BR')}
Profissional Responsável: ${displayUser}
Assinatura Digitalizada do Sistema STC-MVP
======================================================================`;

    const blob = new Blob([clinicalTextContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laudo_triagem_${dadosTriagem.nome_paciente.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

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

// Inicializa a página ao carregar o DOM
document.addEventListener('DOMContentLoaded', inicializarResultado);
