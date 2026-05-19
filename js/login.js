const formulario = document.getElementById('loginForm'); /* Aqui eu recebo o formulário pelo Id, que é guardado na variável formulario */
formulario.addEventListener('submit', getLogin); /* Aqui eu adiciono um ouvinte para o evento de envio do formulário */

/*
Depois eu passo o formulário para a função getLogin, 
que é onde eu vou tratar os dados do formulário e 
fazer a lógica de login.
*/
function getLogin(event) {
    event.preventDefault(); /*Isso impede de o formulário recarregar a página */
    let email = document.getElementById('Email').value; /* Aqui eu pego o valor do campo de email usando o .value */
    let senha = document.getElementById('senha').value; /* Aqui eu pego o valor do campo de senha usando o .value */
    const emailError = document.querySelector('#emailError');
    const senhaError = document.querySelector('#senhaError');
    let isAdmin = false;
    let isLoggedIn = false;
    /*const dadosUsuario = {
        nome : 'nome_do_usuario',
        email: "admin@clinica.com",
        role: "admin",
        token: "token-gerado-pela-API"
    }*/

    if (email.trim() === '' || !email.includes('@')) {
        emailError.style.display ='block'; /* Exibe a mensagem de erro */
        return;
        if(senha.trim() === '' || senha.length < 6) {
            senhaError.style.display = 'block'; /* Exibe a mensagem de erro */
            return;
        }
    } else {
        emailError.style.display ='none';
        senhaError.style.display = 'none';

        if (email === 'admin@clinica.com' && senha =='admin123') {
            isAdmin = true;
            isLoggedIn = true;
            salvarSecao(email, isAdmin);
        } else {
    
        }
    } 
}


function salvarSecao(email, isAdmin) {
    localStorage.setItem('userRole', 'admin');
    localStorage.setItem('userEmail', email);

    //localStorage.setItem('usuarioLogado', JSON.stringify(dadosUsuario));
    window.location.href='pages/Principais/dashboard.html';

}

