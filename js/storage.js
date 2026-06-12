const API_BASE = '';

function limparDadosLocaisUsuario() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userDisplayName');
    localStorage.removeItem('userId');
}

function encerrarSessao(destinoLogin) {
    fetch(`${API_BASE}/api/logout`, { method: 'POST', credentials: 'include' })
        .catch(() => {})
        .finally(() => {
            limparDadosLocaisUsuario();
            if (destinoLogin) {
                window.location.href = destinoLogin;
            }
        });
}
