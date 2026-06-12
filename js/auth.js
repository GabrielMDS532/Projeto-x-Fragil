document.addEventListener('DOMContentLoaded', () => {
    const tipoUsuario = localStorage.getItem('tipo_usuario');
    if (tipoUsuario !== 'ADMIN') {
        // Oculta fisicamente links, botões e cartões de acesso rápido relativos à gestão de usuários
        const elementsToHide = document.querySelectorAll('a[href*="usuarios.html"], button[onclick*="usuarios.html"], #btnUsuarios, #quickAccessUsuarios');
        elementsToHide.forEach(el => {
            el.style.display = 'none';
        });
    }

    // Intercepta o clique no botão de logout para também limpar a chave tipo_usuario
    const btnLogout = document.querySelector('.btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('tipo_usuario');
        });
    }
});
