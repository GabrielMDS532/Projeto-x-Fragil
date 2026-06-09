async function requisitar(metodo, caminho, corpo) {
  const cabecalhos = { 'Content-Type': 'application/json' };
  const token = obterToken();
  if (token) {
    cabecalhos.Authorization = `Bearer ${token}`;
  }

  const opcoes = { method: metodo, headers: cabecalhos };
  if (corpo !== undefined) {
    opcoes.body = JSON.stringify(corpo);
  }

  const resposta = await fetch(`${URL_API}${caminho}`, opcoes);

  if (resposta.status === 401) {
    limparSessao();
    window.location.href = CAMINHOS.login;
    return null;
  }

  if (!resposta.ok) {
    let mensagem = 'Erro na requisição.';
    try {
      const dados = await resposta.json();
      if (dados.detail) {
        mensagem = typeof dados.detail === 'string' ? dados.detail : JSON.stringify(dados.detail);
      }
    } catch (_erro) {
      mensagem = resposta.statusText || mensagem;
    }
    throw new Error(mensagem);
  }

  if (resposta.status === 204) {
    return null;
  }

  const texto = await resposta.text();
  return texto ? JSON.parse(texto) : null;
}
