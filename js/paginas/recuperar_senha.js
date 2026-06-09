const formulario = document.getElementById('formulario_recuperar');
const areaAviso = document.getElementById('aviso_recuperar');

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();
  areaAviso.textContent = 'Recuperação de senha ainda não está disponível. Fale com o administrador.';
  areaAviso.hidden = false;
});
