# 🦋 Sistema de Triagem Clínica - Síndrome do X Frágil

> Plataforma digital de alto desempenho para gestão de prontuários e triagem clínica automatizada focada na identificação precoce da Síndrome do X Frágil.

## 📋 Sobre o Projeto

O Sistema de Triagem Clínica é uma aplicação web construída sob uma arquitetura Cliente-Servidor (API RESTful) que auxilia equipes multidisciplinares na coleta de indicadores fenotípicos e comportamentais. O sistema processa os dados por meio de algoritmos ponderados de pontuação (escore) para emitir recomendações clínicas claras sobre a necessidade de encaminhamento para exames genéticos moleculares.

## 🚀 Funcionalidades Principais

* **Gestão de Pacientes (CRUD):** Cadastro completo com prevenção de duplicidade de CPF e controle de uploads de fotos físicas com limpeza automática de arquivos órfãos.
* **Motor de Triagem Genética:** Avaliação clínica com cálculo de escore em tempo real e desfecho automatizado (`RECOMENDADO` / `NÃO RECOMENDADO`).
* **Segurança e Autenticação Dupla:** Proteção de rotas da API, senhas com hash forte e recuperação criptográfica segura via link de uso único enviado por e-mail (SMTP corporativo).
* **Interface Fluida e Segura:** Layout Mobile-First utilizando CSS Grid e funções fluidas (`clamp`), com defesas ativas contra ataques de *Clickjacking* e *XSS*.

## 🛠️ Tecnologias Utilizadas

### Frontend (Interface e Interação)
* **HTML5 & CSS3 Moderno:** Responsividade fluida, variáveis CSS e *Media Queries*.
* **JavaScript (Vanilla JS):** Interceptação assíncrona (Fetch API), manipulação de DOM e envio de binários via `FormData`.

### Backend (Regras de Negócio e API)
* **Node.js com Express:** Roteamento RESTful e controle de middlewares.
* **Multer & FS:** Gerenciamento de buffers multipart e operações I/O para uploads seguros de imagens.
* **Nodemailer:** Configuração de transporte SMTP para disparo de e-mails reais.
* **Bcryptjs & Crypto:** Hashes de via única e geração de tokens de alta entropia.

### Banco de Dados
* **MySQL (mysql2):** Persistência relacional, integridade referencial com chaves estrangeiras e proteção nativa contra *SQL Injection* via Prepared Statements.

## ⚙️ Pré-requisitos e Instalação

Antes de começar, você precisará ter o [Node.js](https://nodejs.org/) e o [MySQL](https://www.mysql.com/) instalados em sua máquina.

### 1. Clonando o Repositório
```bash
git clone [https://github.com/SEU-USUARIO/sistema-de-triagem.git](https://github.com/SEU-USUARIO/sistema-de-triagem.git)
cd sistema-de-triagem
```
### 2. Instalando as Dependências
```bash
npm install
```
### 3. Configuração do Banco de Dados
Execute os scripts contidos na pasta migrations/ em seu servidor MySQL para estruturar as tabelas usuario, paciente e relatorio.

### 4. Variáveis de Ambiente (.env)
Crie um arquivo .env na raiz do projeto e preencha com as suas credenciais (não versione este arquivo):

# Configurações do Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASS=sua_senha_do_mysql
DB_NAME=triagem_clinica

# Configurações do Servidor de E-mail (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=seu-email-carteiro@gmail.com
SMTP_PASS=sua_senha_de_aplicativo_de_16_digitos

# Segurança e Sessão
JWT_SECRET=sua_chave_secreta_super_forte
ALLOWED_ORIGIN=http://localhost:3000
NODE_ENV=development

### 5. Executando a Aplicação
npm start

## 📦 Requisitos de Implantação (Doc. Técnico)
* **Sistemas Operacionais Homologados:** Windows 10/11, Ubuntu 22.04 LTS.
* *Para a documentação técnica completa de arquitetura e implantação, consulte o arquivo [relatorio_tecnologias.md](./relatorio_tecnologias.md) na raiz do repositório.*

## 📖 Tutorial de Uso
Um guia ilustrado passo a passo para o profissional de saúde (usuário final) está disponível em um pdf disponível abaixo.
👉 **[Clique aqui para acessar o Tutorial de Uso do Sistema](./tutorial-de-uso.pdf)**

## 🎥 Vídeo de Apresentação
Demonstração completa do funcionamento do sistema, validação do escore clínico e implantação.
👉 **[Assistir ao Vídeo no YouTube](https://youtu.be/Z--evE58Lo8?is=sRIu9ynDwxLOV4VJ)**

## 📄 Licença
Este projeto é licenciado sob a Licença MIT - consulte o arquivo [LICENSE.md](LICENSE) para obter detalhes.

