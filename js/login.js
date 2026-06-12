const formulario = document.getElementById('loginForm');
if (formulario) {
    formulario.addEventListener('submit', getLogin);
}

async function getLogin(event) {
    event.preventDefault();
    
    let email = document.getElementById('Email').value.trim();
    let senha = document.getElementById('senha').value.trim();
    const emailError = document.querySelector('#emailError');
    const senhaError = document.querySelector('#senhaError');

//serve para limpar os erros anteriores
    emailError.style.display = 'none';
    senhaError.style.display = 'none';

    let hasError = false;

    // ver se os campos não estão vazios
    if (email === '' || !email.includes('@')) {
        emailError.style.display = 'block';
        hasError = true;
    }
    //ver se a senha não está vazia e tem mais de 6 caracteres
    if (senha === '' || senha.length < 6) {
        senhaError.style.display = 'block';
        hasError = true;
    }

    if (hasError) return;

    // Tenta fazer o login no backend real
    try {
        const resposta = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, senha: senha })
        });

        const dados = await resposta.json();

        // Se o servidor respondeu "sucesso: true"
        if (dados.sucesso) {
            const user = dados.usuario;
            const display = `${user.nome_usuario} ${user.sobrenome_usuario}`;
            const isAdmin = user.tipo_usuario === 'ADMIN';
            
            salvarSecao(user.id_usuario, user.email, isAdmin, display, user.tipo_usuario);
        } else {
            // Se o servidor disse que a senha tá errada
            senhaError.style.display = 'block';
            senhaError.textContent = dados.mensagem;
        }

    } catch (erro) {
        console.error("Erro na comunicação com o servidor:", erro);
        senhaError.style.display = 'block';
        senhaError.textContent = "Erro ao conectar com o servidor. Verifique se o Node.js está rodando!";
    }
}

function salvarSecao(userId, email, isAdmin, userDisplayName, tipoUsuario) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userId', userId.toString()); // Salva o ID real do profissional logado
    localStorage.setItem('isAdmin', isAdmin.toString());
    localStorage.setItem('userRole', isAdmin ? 'admin' : 'user');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userDisplayName', userDisplayName);
    localStorage.setItem('tipo_usuario', tipoUsuario || (isAdmin ? 'ADMIN' : 'USER'));

    // Redireciona para o Dashboard
    window.location.href = '../Principais/dashboard.html';
}