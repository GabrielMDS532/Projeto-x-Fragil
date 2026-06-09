async function fazerLogin(email, senha) {
  const resposta = await fetch(`${URL_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: senha }),
  });

  if (!resposta.ok) {
    let mensagem = 'Email ou senha inválidos.';
    try {
      const erro = await resposta.json();
      if (erro.detail) {
        mensagem = typeof erro.detail === 'string' ? erro.detail : mensagem;
      }
    } catch (_ignorar) {
      /* mantém mensagem padrão */
    }
    throw new Error(mensagem);
  }

  const dados = await resposta.json();
  salvarSessao(dados.access_token, dados.role);
  return dados;
}

function sair() {
  limparSessao();
  window.location.href = CAMINHOS.login;
}

function exigirSessao() {
  if (!temSessao()) {
    window.location.href = CAMINHOS.login;
    return false;
  }
  return true;
}

function exigirAdmin() {
  if (!exigirSessao()) {
    return false;
  }
  if (!ehAdmin()) {
    window.location.href = CAMINHOS.painel;
    return false;
  }
  return true;
}
