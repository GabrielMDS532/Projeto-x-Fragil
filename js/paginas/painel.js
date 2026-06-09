if (!exigirSessao()) {
  throw new Error('Sessão necessária.');
}

montarMenu('painel');

async function carregarPainel() {
  const areaErro = document.getElementById('erro_painel');
  try {
    const estatisticas = await requisitar('GET', '/dashboard/stats');
    document.getElementById('total_pacientes').textContent = estatisticas.total_patients;
    document.getElementById('total_avaliacoes').textContent = estatisticas.total_evaluations;
    document.getElementById('total_encaminhamentos').textContent = estatisticas.total_referrals;
    esconderErro(areaErro);
  } catch (erro) {
    mostrarErro(areaErro, erro.message);
  }
}

document.getElementById('atalho_novo_paciente').addEventListener('click', () => {
  window.location.href = CAMINHOS.novo_paciente;
});

document.getElementById('atalho_avaliacao').addEventListener('click', () => {
  window.location.href = CAMINHOS.avaliacoes;
});

document.getElementById('atalho_relatorios').addEventListener('click', () => {
  window.location.href = CAMINHOS.relatorios;
});

const atalhoUsuarios = document.getElementById('atalho_usuarios');
if (atalhoUsuarios) {
  if (ehAdmin()) {
    atalhoUsuarios.addEventListener('click', () => {
      window.location.href = CAMINHOS.hub_admin;
    });
  } else {
    atalhoUsuarios.hidden = true;
  }
}

const titulo = document.getElementById('titulo_boas_vindas');
if (titulo) {
  titulo.textContent = ehAdmin() ? 'Bem-vindo ao painel administrativo' : 'Bem-vindo ao painel';
}

carregarPainel();
