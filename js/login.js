const formulario = document.getElementById('loginForm');
if (formulario) {
    formulario.addEventListener('submit', getLogin);
}

function getLogin(event) {
    event.preventDefault();
    
    let email = document.getElementById('Email').value.trim();
    let senha = document.getElementById('senha').value.trim();
    const emailError = document.querySelector('#emailError');
    const senhaError = document.querySelector('#senhaError');

    emailError.style.display = 'none';
    senhaError.style.display = 'none';

    let hasError = false;

    if (email === '' || !email.includes('@')) {
        emailError.style.display = 'block';
        hasError = true;
    }
    
    if (senha === '' || senha.length < 6) {
        senhaError.style.display = 'block';
        hasError = true;
    }

    if (hasError) return;

    // Autenticação contra dados do banco simulado e credencial padrão
    const usuariosSalvos = JSON.parse(localStorage.getItem('usuariosSimulados') || '[]');
    const usuarioEncontrado = usuariosSalvos.find(u => u.email === email && u.senha === senha);

    if (email === 'admin@clinica.com' && senha === 'admin123') {
        salvarSecao(email, true, "Administrador");
    } else if (usuarioEncontrado) {
        const display = `${usuarioEncontrado.nome_usuario} ${usuarioEncontrado.sobrenome_usuario}`;
        salvarSecao(usuarioEncontrado.email, usuarioEncontrado.tipo_usuario === 'ADMIN', display);
    } else {
        senhaError.style.display = 'block';
        senhaError.textContent = "E-mail ou senha incorretos.";
    }
}

function salvarSecao(email, isAdmin, userDisplayName) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('isAdmin', isAdmin.toString());
    localStorage.setItem('userRole', isAdmin ? 'admin' : 'user');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userDisplayName', userDisplayName);

    window.location.href = '../Principais/dashboard.html';
}
