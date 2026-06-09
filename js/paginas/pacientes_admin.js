if (!exigirAdmin()) {
  throw new Error('Acesso restrito.');
}

montarMenu('usuarios');

const corpoTabela = document.getElementById('corpo_tabela_admin');
const formulario = document.getElementById('formulario_edicao');
const areaErro = document.getElementById('erro_admin');
let pacienteEmEdicao = null;

document.getElementById('botao_voltar').addEventListener('click', () => {
  window.location.href = CAMINHOS.hub_admin;
});

document.getElementById('botao_cancelar_edicao').addEventListener('click', () => {
  formulario.hidden = true;
  pacienteEmEdicao = null;
});

function abrirEdicao(paciente) {
  pacienteEmEdicao = paciente.id;
  document.getElementById('editar_nome').value = paciente.name;
  document.getElementById('editar_idade').value = paciente.age;
  document.getElementById('editar_sexo').value = paciente.sex;
  document.getElementById('editar_telefone').value = paciente.phone || '';
  document.getElementById('editar_responsavel').value = paciente.guardian || '';
  document.getElementById('editar_observacoes').value = paciente.notes || '';
  formulario.hidden = false;
}

async function carregarPacientes() {
  try {
    const pacientes = await requisitar('GET', '/patients');
    corpoTabela.innerHTML = '';

    pacientes.forEach((paciente) => {
      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td>${paciente.name}</td>
        <td>${paciente.age}</td>
        <td>${textoSexo(paciente.sex)}</td>
        <td>${paciente.phone || '-'}</td>
        <td><button type="button" class="botao_secundario">Editar</button></td>
      `;
      linha.querySelector('button').addEventListener('click', () => abrirEdicao(paciente));
      corpoTabela.appendChild(linha);
    });
    esconderErro(areaErro);
  } catch (erro) {
    mostrarErro(areaErro, erro.message);
  }
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!pacienteEmEdicao) {
    return;
  }

  const dados = {
    name: document.getElementById('editar_nome').value.trim(),
    age: Number(document.getElementById('editar_idade').value),
    sex: document.getElementById('editar_sexo').value,
    phone: document.getElementById('editar_telefone').value.trim() || null,
    guardian: document.getElementById('editar_responsavel').value.trim() || null,
    notes: document.getElementById('editar_observacoes').value.trim() || null,
  };

  try {
    await requisitar('PATCH', `/patients/${pacienteEmEdicao}`, dados);
    formulario.hidden = true;
    pacienteEmEdicao = null;
    await carregarPacientes();
  } catch (erro) {
    mostrarErro(areaErro, erro.message);
  }
});

carregarPacientes();
