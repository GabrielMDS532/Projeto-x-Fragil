if (!exigirSessao()) {
  throw new Error('Sessão necessária.');
}

montarMenu('relatorios');

const corpoTabela = document.getElementById('corpo_tabela_relatorios');
const areaErro = document.getElementById('erro_relatorios');
const selectPaciente = document.getElementById('filtro_paciente');
const selectUsuario = document.getElementById('filtro_usuario');

async function carregarFiltros() {
  try {
    const pacientes = await requisitar('GET', '/patients');
    pacientes.forEach((paciente) => {
      const opcao = document.createElement('option');
      opcao.value = paciente.id;
      opcao.textContent = paciente.name;
      selectPaciente.appendChild(opcao);
    });

    if (ehAdmin()) {
      const usuarios = await requisitar('GET', '/users');
      usuarios.forEach((usuario) => {
        const opcao = document.createElement('option');
        opcao.value = usuario.id;
        opcao.textContent = usuario.name;
        selectUsuario.appendChild(opcao);
      });
    } else {
      document.getElementById('grupo_filtro_usuario').hidden = true;
    }
  } catch (erro) {
    mostrarErro(areaErro, erro.message);
  }
}

function montarConsulta() {
  const parametros = new URLSearchParams();
  const dataInicio = document.getElementById('data_inicio').value;
  const dataFim = document.getElementById('data_fim').value;
  const idPaciente = selectPaciente.value;
  const idUsuario = selectUsuario.value;
  const resultado = document.getElementById('filtro_resultado').value;

  if (dataInicio) {
    parametros.set('date_from', `${dataInicio}T00:00:00`);
  }
  if (dataFim) {
    parametros.set('date_to', `${dataFim}T23:59:59`);
  }
  if (idPaciente) {
    parametros.set('patient_id', idPaciente);
  }
  if (idUsuario && ehAdmin()) {
    parametros.set('user_id', idUsuario);
  }
  if (resultado) {
    parametros.set('result', resultado);
  }

  const sufixo = parametros.toString();
  return sufixo ? `/reports/evaluations?${sufixo}` : '/reports/evaluations';
}

async function buscarRelatorios() {
  try {
    const itens = await requisitar('GET', montarConsulta());
    corpoTabela.innerHTML = '';

    if (!itens.length) {
      corpoTabela.innerHTML = '<tr><td colspan="6">Nenhum registro encontrado.</td></tr>';
      return;
    }

    itens.forEach((item) => {
      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td>${formatarData(item.created_at)}</td>
        <td>${item.patient_name}</td>
        <td>${item.evaluator_name}</td>
        <td>${item.score}</td>
        <td>${item.threshold_used}</td>
        <td>${textoResultado(item.result)}</td>
      `;
      corpoTabela.appendChild(linha);
    });
    esconderErro(areaErro);
  } catch (erro) {
    mostrarErro(areaErro, erro.message);
  }
}

document.getElementById('botao_buscar').addEventListener('click', buscarRelatorios);
document.getElementById('botao_exportar').addEventListener('click', () => {
  alert('Exportação em CSV/PDF ainda não está disponível.');
});

carregarFiltros().then(buscarRelatorios);
