if (!exigirAdmin()) {
  throw new Error('Acesso restrito.');
}

montarMenu('usuarios');

const formulario = document.getElementById('formulario_usuario');
const areaErro = document.getElementById('erro_usuario');

document.getElementById('botao_voltar').addEventListener('click', () => {
  window.location.href = CAMINHOS.hub_admin;
});

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  esconderErro(areaErro);

  const senha = document.getElementById('senha').value;
  const confirmar = document.getElementById('confirmar_senha').value;
  if (senha !== confirmar) {
    mostrarErro(areaErro, 'As senhas não coincidem.');
    return;
  }

  const dados = {
    name: document.getElementById('nome').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: senha,
    role: document.getElementById('perfil').value,
  };

  try {
    await requisitar('POST', '/users', dados);
    window.location.href = CAMINHOS.gerenciar_usuarios;
  } catch (erro) {
    mostrarErro(areaErro, erro.message);
  }
});
