# 📊 Relatório de Tecnologias — Sistema de Triagem Clínica X-Frágil

## Visão Geral da Arquitetura

O projeto segue uma arquitetura **cliente-servidor** com backend em Node.js servindo tanto a API REST quanto os arquivos estáticos do frontend.

---

## 🟩 Backend

### Runtime & Linguagem

| Tecnologia | Versão |
|---|---|
| **Node.js** | `v24.14.0` |
| **JavaScript** (ES Modules) | ECMAScript 2022+ (`"type": "module"` no package.json) |

### Framework & Bibliotecas de Produção

| Pacote | Versão Instalada | Finalidade |
|---|---|---|
| **express** | `5.2.1` | Framework HTTP — servidor de rotas REST e arquivos estáticos |
| **mysql2** | `3.22.3` | Driver de conexão com banco de dados MySQL |
| **bcryptjs** | `2.4.3` | Hash e verificação de senhas (com suporte a migração de plain text → hash) |
| **nodemailer** | `8.0.10` | Envio de e-mails transacionais via SMTP (recuperação de senha) |
| **multer** | `1.4.5-lts.2` | Upload de arquivos (fotos de pacientes, limite 2 MB) |
| **cors** | `2.8.6` | Middleware de Cross-Origin Resource Sharing |
| **dotenv** | `16.6.1` | Carregamento de variáveis de ambiente a partir do arquivo `.env` |

### Módulos Nativos do Node.js utilizados

| Módulo | Finalidade |
|---|---|
| `crypto` | Geração de tokens criptograficamente seguros (recuperação de senha) |
| `path` | Manipulação de caminhos de arquivos |
| `fs` | Leitura, escrita e exclusão de arquivos no disco |

### Dependências Transitivas Relevantes (instaladas indiretamente)

| Pacote | Versão | Dependente de |
|---|---|---|
| `body-parser` | `2.2.2` | express |
| `router` | `2.2.0` | express |
| `serve-static` | `2.2.1` | express |
| `path-to-regexp` | `8.4.2` | express |
| `aws-ssl-profiles` | `1.1.2` | mysql2 |
| `named-placeholders` | `1.1.6` | mysql2 |
| `busboy` | `1.6.0` | multer |
| `debug` | `4.4.3` | múltiplas |

---

## 🟦 Frontend

### Linguagens

| Tecnologia | Versão / Observação |
|---|---|
| **HTML5** | Semântico (`<!DOCTYPE html>`, `lang="pt-BR"`) |
| **CSS3** | Vanilla CSS — um único arquivo `global.css` (22 KB) centralizado |
| **JavaScript** | Vanilla JS (ES6+), sem framework; Fetch API para comunicação com a API REST |

### Sem dependências externas de CDN
O frontend **não utiliza nenhuma biblioteca externa via CDN** (sem jQuery, Bootstrap, React, etc.). Toda a lógica está implementada em JavaScript puro nos arquivos da pasta `js/`.

### Módulos JavaScript do Frontend

| Arquivo | Responsabilidade |
|---|---|
| `js/auth.js` | Controle de autenticação e sessão |
| `js/login.js` | Lógica de login |
| `js/dashboard.js` | Dados e cards do painel principal |
| `js/pacientes.js` | Listagem, busca e exclusão de pacientes |
| `js/novo_paciente.js` | Cadastro e edição de pacientes |
| `js/nova_avaliacao.js` | Formulário de avaliação clínica |
| `js/resultado.js` | Exibição de resultados de triagem |
| `js/relatorios.js` | Geração e visualização de relatórios |
| `js/usuarios.js` | CRUD de usuários do sistema |
| `js/recuperarSenha.js` | Fluxo de solicitação de recuperação |
| `js/redefinirSenha.js` | Redefinição via token |
| `js/storage.js` | Utilitários de armazenamento local |

---

## 🗄️ Banco de Dados

| Tecnologia | Versão | Observação |
|---|---|---|
| **MySQL** | `8.0.43` | Identificado no dump SQL (`xFragilVersao2.sql`) |
| **InnoDB** | (engine padrão MySQL 8) | Engine de todas as tabelas |
| **Charset** | `utf8mb4` / `utf8mb4_unicode_ci` | Suporte completo a Unicode e emojis |

### Tabelas do Banco

| Tabela | Descrição |
|---|---|
| `usuario` | Profissionais de saúde (ADMIN / USUARIO) |
| `paciente` | Dados dos pacientes cadastrados |
| `relatorio` | Avaliações clínicas com score e resultado (RECOMENDADO / NAO_RECOMENDADO) |
| `usuario_paciente` | Relacionamento N:N entre usuários e pacientes |
| `auditoria` | Log de operações INSERT/UPDATE/DELETE |

---

## 📁 Estrutura de Comunicação

```
Browser (HTML + CSS + JS Vanilla)
        │
        │ HTTP/REST (Fetch API)
        ▼
Node.js v24 + Express 5 (server.js)
        │
        │ mysql2 driver
        ▼
MySQL 8.0.43 (banco x_fragil)
```

---

## 📦 Arquivo de Configuração

| Arquivo | Conteúdo |
|---|---|
| `package.json` | Metadados do projeto, scripts (`start`, `dev`) e dependências |
| `package-lock.json` | Árvore de dependências fixadas para reproducibilidade |
| `.env` | Variáveis de ambiente: credenciais SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) |

---

## 🖥️ Sistemas Operacionais Homologados

* Windows 10 / 11 (Ambiente de Desenvolvimento e Homologação)
* Ubuntu 22.04 LTS (Ambiente de Produção/Servidor)

---

## 🚀 Instruções de Execução (Deploy)

### 1. Pré-requisitos e Banco de Dados
* Instale o Node.js v24.14.0 (ou superior) e o MySQL 8.0.
* Acesse o seu gerenciador MySQL e importe o arquivo de dump `xFragilVersao2.sql` para criar a estrutura do banco `x_fragil`.

### 2. Instalação de Dependências
* Abra o terminal na pasta raiz do projeto.
* Execute o comando `npm install` para baixar todos os pacotes listados.

### 3. Variáveis de Ambiente
* Crie um arquivo oculto chamado `.env` na raiz do projeto.
* Preencha o arquivo com as suas chaves locais de banco de dados e servidor SMTP (conforme chaves de exemplo documentadas no README).

### 4. Inicialização do Servidor
* No terminal, execute o comando `npm start`.
* Verifique no console a mensagem de que o servidor está rodando.
* Abra o seu navegador e acesse `http://localhost:3000`.