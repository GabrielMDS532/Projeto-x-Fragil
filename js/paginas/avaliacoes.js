if (!exigirSessao()) {
  throw new Error('Sessão necessária.');
}

montarMenu('avaliacoes');

const selectPaciente = document.getElementById('select_paciente');
const painelPaciente = document.getElementById('painel_paciente');
const listaSintomas = document.getElementById('lista_sintomas');
const areaErro = document.getElementById('erro_avaliacoes');
let pacientes = [];

document.getElementById('botao_voltar').addEventListener('click', () => {
  window.location.href = CAMINHOS.painel;
});

const formulario = document.getElementById('formulario_avaliacao');

document.getElementById('botao_limpar').addEventListener('click', () => {
  formulario.reset();
  selectPaciente.value = '';
  painelPaciente.hidden = true;
});

function montarChecklist() {
  listaSintomas.innerHTML = '';
  LISTA_SINTOMAS.forEach((sintoma) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <label>
        <input type="checkbox" name="sintoma" value="${sintoma.chave}">
        ${sintoma.rotulo}
      </label>
    `;
    listaSintomas.appendChild(item);
  });
}

function mostrarPaciente(idPaciente) {
  const paciente = pacientes.find((item) => item.id === Number(idPaciente));
  if (!paciente) {
    painelPaciente.hidden = true;
    return;
  }
  document.getElementById('paciente_nome').textContent = paciente.name;
  document.getElementById('paciente_idade').textContent = paciente.age;
  document.getElementById('paciente_sexo').textContent = textoSexo(paciente.sex);
  document.getElementById('paciente_observacoes').textContent = paciente.notes || '-';
  painelPaciente.hidden = false;
}

async function carregarPacientes() {
  try {
    pacientes = await requisitar('GET', '/patients');
    selectPaciente.innerHTML = '<option value="">Selecione um paciente</option>';
    pacientes.forEach((paciente) => {
      const opcao = document.createElement('option');
      opcao.value = paciente.id;
      opcao.textContent = paciente.name;
      selectPaciente.appendChild(opcao);
    });
    esconderErro(areaErro);
  } catch (erro) {
    mostrarErro(areaErro, erro.message);
  }
}

selectPaciente.addEventListener('change', () => {
  mostrarPaciente(selectPaciente.value);
});

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  esconderErro(areaErro);

  const idPaciente = Number(selectPaciente.value);
  if (!idPaciente) {
    mostrarErro(areaErro, 'Selecione um paciente.');
    return;
  }

  const marcados = formulario.querySelectorAll('input[name="sintoma"]:checked');
  const sintomas = LISTA_SINTOMAS.map((sintoma) => ({
    key: sintoma.chave,
    present: Array.from(marcados).some((input) => input.value === sintoma.chave),
  }));

  try {
    const avaliacao = await requisitar('POST', '/evaluations', {
      patient_id: idPaciente,
      symptoms: sintomas,
    });
    window.location.href = `${CAMINHOS.resultado_triagem}?id=${avaliacao.id}`;
  } catch (erro) {
    mostrarErro(areaErro, erro.message);
  }
});

montarChecklist();
carregarPacientes();
