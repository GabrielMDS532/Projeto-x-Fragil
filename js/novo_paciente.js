/**
 * =========================================================================
 * 1. CONTROLE DE ACESSO E SEGURANÇA
 * =========================================================================
 */
function verificarAutenticacao() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = '../cadastro/login.html';
        return false;
    }
    return true;
}

/**
 * =========================================================================
 * 2. INICIALIZAÇÃO DA PÁGINA
 * =========================================================================
 */
let removerFotoFlag = false;

function inicializarCadastroPaciente() {
    if (!verificarAutenticacao()) return;

    // Carregar informações do cabeçalho/menu lateral
    const userEmail = localStorage.getItem('userEmail') || '';
    const userDisplayName = localStorage.getItem('userDisplayName') || userEmail.split('@')[0] || 'Usuário';
    
    const userDisplayNameFormated = userDisplayName.charAt(0).toUpperCase() + userDisplayName.slice(1);

    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) userInfoElement.textContent = `👤 ${userDisplayNameFormated}`;

    // Configurar máscara de CPF
    configurarMascaraCPF();

    // Configurar máscara de Telefone
    configurarMascaraTelefone();

    // Configurar preview de foto
    configurarPreviewFoto();

    // Configurar o ouvinte de remoção de foto (lixeira)
    const btnRemover = document.getElementById('btn-remover-foto');
    if (btnRemover) {
        btnRemover.addEventListener('click', removerFotoSelecionada);
    }

    // Detectar se está no modo de edição (presença do id_paciente na URL)
    const urlParams = new URLSearchParams(window.location.search);
    const idPaciente = urlParams.get('id_paciente');
    
    if (idPaciente) {
        carregarDadosPacienteEdicao(idPaciente);
    }

    // Configurar o ouvinte de envio do formulário
    const formulario = document.getElementById('patientForm');
    if (formulario) {
        formulario.addEventListener('submit', salvarPaciente);
    }
}

function configurarMascaraCPF() {
    const inputCpf = document.getElementById('cpf');
    if (inputCpf) {
        inputCpf.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove tudo o que não é número
            if (value.length > 11) value = value.slice(0, 11);

            // Máscara: 000.000.000-00
            if (value.length > 9) {
                value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
            } else if (value.length > 6) {
                value = value.replace(/^(\d{3})(\d{3})(\d{1,3})$/, "$1.$2.$3");
            } else if (value.length > 3) {
                value = value.replace(/^(\d{3})(\d{1,3})$/, "$1.$2");
            }
            e.target.value = value;
        });
    }
}

function configurarMascaraTelefone() {
    const inputTelefone = document.getElementById('telefone_paciente');
    if (inputTelefone) {
        inputTelefone.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove tudo o que não é número
            if (value.length > 11) value = value.slice(0, 11);

            // Máscara dinâmica: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
            if (value.length > 6) {
                const parte1 = value.slice(0, 2);
                const parte2 = value.length === 11 ? value.slice(2, 7) : value.slice(2, 6);
                const parte3 = value.length === 11 ? value.slice(7) : value.slice(6);
                value = `(${parte1}) ${parte2}-${parte3}`;
            } else if (value.length > 2) {
                value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
            } else if (value.length > 0) {
                value = `(${value}`;
            }
            e.target.value = value;
        });
    }
}

function configurarPreviewFoto() {
    const inputFoto = document.getElementById('foto_paciente');
    const imgPreview = document.getElementById('foto_preview');
    const placeholder = document.getElementById('preview-placeholder');
    const btnRemover = document.getElementById('btn-remover-foto');

    if (inputFoto && imgPreview && placeholder) {
        inputFoto.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    alert('A imagem não pode exceder o tamanho máximo de 2MB.');
                    inputFoto.value = '';
                    imgPreview.style.display = 'none';
                    placeholder.style.display = 'block';
                    if (btnRemover) btnRemover.style.display = 'none';
                    return;
                }

                const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                    alert('Apenas imagens nos formatos PNG, JPG, JPEG ou WEBP são permitidas.');
                    inputFoto.value = '';
                    imgPreview.style.display = 'none';
                    placeholder.style.display = 'block';
                    if (btnRemover) btnRemover.style.display = 'none';
                    return;
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    imgPreview.src = event.target.result;
                    imgPreview.style.display = 'block';
                    placeholder.style.display = 'none';
                    if (btnRemover) btnRemover.style.display = 'flex';
                    removerFotoFlag = false;
                };
                reader.readAsDataURL(file);
            } else {
                imgPreview.src = '';
                imgPreview.style.display = 'none';
                placeholder.style.display = 'block';
                if (btnRemover) btnRemover.style.display = 'none';
            }
        });
    }
}

function removerFotoSelecionada() {
    const inputFoto = document.getElementById('foto_paciente');
    const imgPreview = document.getElementById('foto_preview');
    const placeholder = document.getElementById('preview-placeholder');
    const btnRemover = document.getElementById('btn-remover-foto');

    if (inputFoto) inputFoto.value = '';
    if (imgPreview) {
        imgPreview.src = '';
        imgPreview.style.display = 'none';
    }
    if (placeholder) placeholder.style.display = 'block';
    if (btnRemover) btnRemover.style.display = 'none';

    removerFotoFlag = true;
}

// Função para buscar dados do paciente para edição
async function carregarDadosPacienteEdicao(id) {
    try {
        const resposta = await fetch(`http://localhost:3000/api/pacientes/${id}`);
        const dados = await resposta.json();

        if (dados.sucesso) {
            const paciente = dados.paciente;

            // Preenche o formulário
            document.getElementById('nome_paciente').value = paciente.nome_paciente;
            document.getElementById('cpf').value = paciente.cpf || '';
            document.getElementById('sexo_paciente').value = paciente.sexo_paciente;

            // Formatação correta da data para o input HTML tipo 'date' (yyyy-MM-dd)
            if (paciente.data_nascimento_paciente) {
                const dataRaw = new Date(paciente.data_nascimento_paciente);
                const ano = dataRaw.getUTCFullYear();
                const mes = String(dataRaw.getUTCMonth() + 1).padStart(2, '0');
                const dia = String(dataRaw.getUTCDate()).padStart(2, '0');
                document.getElementById('data_nascimento_paciente').value = `${ano}-${mes}-${dia}`;
            }

            document.getElementById('nome_responsavel').value = paciente.nome_responsavel || '';
            if (paciente.parentesco_responsavel) {
                document.getElementById('parentesco_responsavel').value = paciente.parentesco_responsavel;
            }
            document.getElementById('telefone_paciente').value = paciente.telefone_paciente || '';
            document.getElementById('observacoes_paciente').value = paciente.observacoes_paciente || '';

            // Se o paciente tiver foto, exibe o preview
            if (paciente.foto_paciente) {
                const imgPreview = document.getElementById('foto_preview');
                const placeholder = document.getElementById('preview-placeholder');
                const btnRemover = document.getElementById('btn-remover-foto');
                if (imgPreview && placeholder) {
                    imgPreview.src = `http://localhost:3000${paciente.foto_paciente}`;
                    imgPreview.style.display = 'block';
                    placeholder.style.display = 'none';
                    if (btnRemover) btnRemover.style.display = 'flex';
                }
            }

            // Atualiza os títulos da página de forma elegante
            const tituloForm = document.querySelector('.Mensagem_entrada h4');
            if (tituloForm) tituloForm.textContent = "Editar Paciente";

            const btnSalvar = document.querySelector('#patientForm button[type="submit"]');
            if (btnSalvar) btnSalvar.textContent = "Salvar Alterações";

        } else {
            alert("Erro ao carregar dados do paciente: " + dados.mensagem);
            window.location.href = '../Principais/pacientes.html';
        }
    } catch (error) {
        console.error("Erro ao carregar dados do paciente:", error);
        alert("Erro técnico ao carregar os dados para edição.");
    }
}

/**
 * =========================================================================
 * 3. LÓGICA DE CADASTRO OU ATUALIZAÇÃO (DINÂMICO POST/PUT)
 * =========================================================================
 */
async function salvarPaciente(event) {
    event.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const idPaciente = urlParams.get('id_paciente');

    const inputNome = document.getElementById('nome_paciente');
    const inputCpf = document.getElementById('cpf');
    const selectSexo = document.getElementById('sexo_paciente');
    const inputDataNasc = document.getElementById('data_nascimento_paciente');
    const inputResponsavel = document.getElementById('nome_responsavel');
    const inputParentesco = document.getElementById('parentesco_responsavel');
    const inputTelefone = document.getElementById('telefone_paciente');
    const textareaObservacoes = document.getElementById('observacoes_paciente');
    const inputFoto = document.getElementById('foto_paciente');
    
    if (!inputNome || !inputCpf || !selectSexo || !inputDataNasc || !inputResponsavel || !inputTelefone) return;

    // Criando o objeto FormData para enviar dados textuais e arquivos binários
    const formData = new FormData();
    formData.append('nome_paciente', inputNome.value.trim());
    formData.append('cpf', inputCpf.value.trim());
    formData.append('sexo_paciente', selectSexo.value);
    formData.append('data_nascimento_paciente', inputDataNasc.value);
    formData.append('nome_responsavel', inputResponsavel.value.trim());
    if (inputParentesco) {
        formData.append('parentesco_responsavel', inputParentesco.value.trim());
    }
    formData.append('telefone_paciente', inputTelefone.value.trim());
    formData.append('observacoes_paciente', textareaObservacoes ? textareaObservacoes.value.trim() : '');

    // Se uma foto foi selecionada, adiciona ao FormData
    if (inputFoto && inputFoto.files[0]) {
        formData.append('foto_paciente', inputFoto.files[0]);
    }

    // Flag de remoção de foto
    formData.append('remover_foto', removerFotoFlag ? 'true' : 'false');

    const url = idPaciente 
        ? `http://localhost:3000/api/pacientes/${idPaciente}`
        : 'http://localhost:3000/api/pacientes';

    const metodo = idPaciente ? 'PUT' : 'POST';

    try {
        const resposta = await fetch(url, {
            method: metodo,
            body: formData
        });

        const dados = await resposta.json();

        if (dados.sucesso) {
            alert(idPaciente ? 'Dados do paciente atualizados com sucesso!' : 'Paciente cadastrado com sucesso!');
            // Redireciona de volta para a lista geral
            window.location.href = '../Principais/pacientes.html';
        } else {
            alert('Erro do servidor: ' + dados.mensagem);
        }

    } catch (error) {
        console.error("Erro na requisição de salvamento:", error);
        alert("Houve um erro técnico ao tentar salvar. Verifique se o backend está rodando.");
    }
}

/**
 * =========================================================================
 * 4. NAVEGAÇÃO E LOGOUT
 * =========================================================================
 */
function navigate(page) {
    window.location.href = page;
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userDisplayName');

    window.location.href = '../cadastro/login.html';
}

// Dispara o gatilho inicial ao carregar a página
document.addEventListener('DOMContentLoaded', inicializarCadastroPaciente);