if (!exigirSessao()) {
  throw new Error('Sessão necessária.');
}

montarMenu('pacientes');

const formulario = document.getElementById('formulario_paciente');
const areaErro = document.getElementById('erro_formulario');

document.getElementById('botao_cancelar').addEventListener('click', () => {
  window.location.href = CAMINHOS.pacientes;
});

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  esconderErro(areaErro);

  const dados = {
    name: document.getElementById('nome').value.trim(),
    age: Number(document.getElementById('idade').value),
    sex: document.getElementById('sexo').value,
    phone: document.getElementById('telefone').value.trim() || null,
    guardian: document.getElementById('responsavel').value.trim() || null,
    notes: document.getElementById('observacoes').value.trim() || null,
  };

  try {
    await requisitar('POST', '/patients', dados);
    window.location.href = CAMINHOS.pacientes;
  } catch (erro) {
    mostrarErro(areaErro, erro.message);
  }
});
