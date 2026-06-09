function montarMenu(paginaAtual) {
  const container = document.getElementById('menu_lateral');
  if (!container) {
    return;
  }

  const itens = [
    { id: 'painel', rotulo: 'Painel', href: CAMINHOS.painel },
    { id: 'pacientes', rotulo: 'Pacientes', href: CAMINHOS.pacientes },
    { id: 'avaliacoes', rotulo: 'Avaliações', href: CAMINHOS.avaliacoes },
    { id: 'relatorios', rotulo: 'Relatórios', href: CAMINHOS.relatorios },
  ];

  if (ehAdmin()) {
    itens.push({ id: 'usuarios', rotulo: 'Usuários', href: CAMINHOS.hub_admin });
  }

  const links = itens
    .map((item) => {
      const ativo = item.id === paginaAtual ? ' link_menu_ativo' : '';
      return `<a class="link_menu${ativo}" href="${item.href}">${item.rotulo}</a>`;
    })
    .join('');

  container.innerHTML = `
    <nav class="menu_lateral" aria-label="Menu principal">
      <div class="menu_titulo">
        <h2>Sistema de Triagem Clínica</h2>
      </div>
      <div class="menu_links">${links}</div>
      <div class="menu_rodape">
        <span class="menu_perfil">${ehAdmin() ? 'Administrador' : 'Usuário padrão'}</span>
        <button type="button" class="botao_sair" id="botao_sair">Sair</button>
      </div>
    </nav>
  `;

  document.getElementById('botao_sair').addEventListener('click', sair);
}
