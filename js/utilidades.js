function formatarData(valor) {
  if (!valor) {
    return '-';
  }
  const data = new Date(valor);
  return data.toLocaleString('pt-BR');
}

function textoResultado(resultado) {
  if (resultado === 'ENCAMINHAR_TESTE_GENETICO') {
    return 'Encaminhar para teste genético';
  }
  if (resultado === 'SEM_ENCAMINHAMENTO_IMEDIATO') {
    return 'Sem encaminhamento imediato';
  }
  return resultado;
}

function textoSexo(sexo) {
  if (sexo === 'M') {
    return 'Masculino';
  }
  if (sexo === 'F') {
    return 'Feminino';
  }
  return sexo;
}

function obterParametroUrl(nome) {
  return new URLSearchParams(window.location.search).get(nome);
}

function mostrarErro(elemento, mensagem) {
  if (!elemento) {
    return;
  }
  elemento.textContent = mensagem;
  elemento.hidden = false;
}

function esconderErro(elemento) {
  if (!elemento) {
    return;
  }
  elemento.hidden = true;
  elemento.textContent = '';
}
