const CHAVE_TOKEN = 'token_acesso';
const CHAVE_PERFIL = 'perfil_usuario';

function salvarSessao(token, perfil) {
  sessionStorage.setItem(CHAVE_TOKEN, token);
  sessionStorage.setItem(CHAVE_PERFIL, perfil);
}

function obterToken() {
  return sessionStorage.getItem(CHAVE_TOKEN);
}

function obterPerfil() {
  return sessionStorage.getItem(CHAVE_PERFIL);
}

function limparSessao() {
  sessionStorage.removeItem(CHAVE_TOKEN);
  sessionStorage.removeItem(CHAVE_PERFIL);
}

function temSessao() {
  return Boolean(obterToken());
}

function ehAdmin() {
  return obterPerfil() === 'ADMIN';
}
