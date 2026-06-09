if (!exigirAdmin()) {
  throw new Error('Acesso restrito.');
}

montarMenu('usuarios');

const corpoTabela = document.getElementById('corpo_tabela_usuarios');
const areaErro = document.getElementById('erro_usuarios');

document.getElementById('botao_novo_usuario').addEventListener('click', () => {
  window.location.href = CAMINHOS.cadastro_usuario;
});

document.getElementById('botao_voltar').addEventListener('click', () => {
  window.location.href = CAMINHOS.hub_admin;
});

async function carregarUsuarios() {
  try {
    const usuarios = await requisitar('GET', '/users');
    corpoTabela.innerHTML = '';

    usuarios.forEach((usuario) => {
      const linha = document.createElement('tr');
      const perfil = usuario.role === 'ADMIN' ? 'Administrador' : 'Padrão';
      const status = usuario.is_active ? 'Ativo' : 'Inativo';
      linha.innerHTML = `
        <td>${usuario.name}</td>
        <td>${usuario.email}</td>
        <td>${perfil}</td>
        <td>${status}</td>
        <td>${formatarData(usuario.created_at)}</td>
      `;
      corpoTabela.appendChild(linha);
    });
    esconderErro(areaErro);
  } catch (erro) {
    mostrarErro(areaErro, erro.message);
  }
}

carregarUsuarios();
