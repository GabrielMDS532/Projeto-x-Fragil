const formulario = document.getElementById('formulario_login');
const areaErro = document.getElementById('erro_login');

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  esconderErro(areaErro);

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  try {
    await fazerLogin(email, senha);
    window.location.href = CAMINHOS.painel;
  } catch (erro) {
    mostrarErro(areaErro, erro.message || 'Email ou senha inválidos.');
  }
});
