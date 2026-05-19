const formRecuperar = document.querySelector('#form_recuperar'); /* Pega o seletor para o formulário de envio do email */
const inputEmail = document.querySelector('input[type="email"]'); /* Seleciona a caixa de input com o tipo email */
const emailError = document.querySelector('#emailError'); /* Seleciona a caixa de teste de erro */
const login_footer = document.querySelector('#link_enviado'); /* Seleciona o bloco que envia a mensagem */
formRecuperar.addEventListener('submit', recuperaLogin);

function recuperaLogin(event) {
    event.preventDefault();

    if (inputEmail.value.trim() === '' || !inputEmail.value.includes('@')) {
        emailError.style.display = 'block'; /* Exibe a mensagem de erro */
        
    } else {
        emailError.style.display ='none';

        /* Mostra a notificação de sucesso */
        login_footer.classList.add('mostrar');

        /* Limpa o campo, mostra que o dado já foi enviado  */
        inputEmail.value ='';


        /* Faz a notificação sumir após 4s */
        setTimeout(function() {
            login_footer.classList.remove('mostrar');
        } , 5000);
    
    }


}