if (!exigirSessao()) {
  throw new Error('Sessão necessária.');
}

montarMenu('pacientes');

const corpoTabela = document.getElementById('corpo_tabela_pacientes');
const areaErro = document.getElementById('erro_pacientes');

document.getElementById('botao_novo_paciente').addEventListener('click', () => {
  window.location.href = CAMINHOS.novo_paciente;
});

async function carregarPacientes() {
  try {
    const pacientes = await requisitar('GET', '/patients');
    corpoTabela.innerHTML = '';

    if (!pacientes.length) {
      corpoTabela.innerHTML = '<tr><td colspan="5">Nenhum paciente cadastrado.</td></tr>';
      return;
    }

    pacientes.forEach((paciente) => {
      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td>${paciente.name}</td>
        <td>${paciente.age}</td>
        <td>${textoSexo(paciente.sex)}</td>
        <td>${paciente.phone || '-'}</td>
        <td>${formatarData(paciente.created_at)}</td>
      `;
      corpoTabela.appendChild(linha);
    });
    esconderErro(areaErro);
  } catch (erro) {
    mostrarErro(areaErro, erro.message);
  }
}

carregarPacientes();
