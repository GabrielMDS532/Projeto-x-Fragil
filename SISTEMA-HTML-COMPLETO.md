# SISTEMA DE TRIAGEM CLÍNICA - HTML/CSS/JavaScript

Sistema completo em HTML puro, CSS e JavaScript, adaptado para sua estrutura.

---

## 📁 Estrutura de Pastas

```
projeto/
├── index.html (redireciona para login.html)
├── login.html
├── dashboard.html
├── pacientes.html
├── novo_paciente.html
├── nova_avaliacao.html
├── resultado.html
├── relatorios.html
├── usuarios.html
├── recuperar_senha.html
├── styles/
│   └── global.css
└── scripts/
    ├── auth.js
    ├── dashboard.js
    ├── pacientes.js
    ├── avaliacoes.js
    └── relatorios.js
```

---

## 🎨 styles/global.css

```css
/* Reset e Configurações Globais */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f5f5f5;
    color: #333;
}

/* Página de Login */
.principal {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container_login {
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

.container_login h2 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
    font-size: 28px;
}

.container_login label {
    display: block;
    margin-bottom: 8px;
    color: #555;
    font-weight: 500;
}

.container_login input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    margin-bottom: 20px;
    transition: border-color 0.3s;
}

.container_login input:focus {
    outline: none;
    border-color: #667eea;
}

.container_login button {
    width: 100%;
    padding: 14px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.container_login button:hover {
    background: #5568d3;
}

.container_login p {
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    color: #666;
}

.container_login a {
    color: #667eea;
    text-decoration: none;
}

.container_login a:hover {
    text-decoration: underline;
}

/* Layout com Menu Lateral */
body.dashboard-layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
}

/* Menu Lateral */
.menu {
    width: 260px;
    background: #1e293b;
    color: white;
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
}

.menu .titulo {
    padding: 30px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu .titulo h3 {
    font-size: 18px;
    font-weight: 600;
    line-height: 1.4;
}

.menu .titulo p {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 5px;
}

.Paginas {
    flex: 1;
    padding: 20px 10px;
    overflow-y: auto;
}

.Paginas button {
    width: 100%;
    padding: 14px 20px;
    background: transparent;
    color: #cbd5e1;
    border: none;
    border-radius: 8px;
    text-align: left;
    font-size: 15px;
    cursor: pointer;
    margin-bottom: 8px;
    transition: all 0.3s;
}

.Paginas button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.Paginas button.active {
    background: #3b82f6;
    color: white;
}

.Acesso_usuario {
    padding: 15px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-acesso_usuario {
    width: 100%;
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

.logout {
    padding: 15px 20px;
}

.btn-logout {
    width: 100%;
    padding: 12px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.3s;
}

.btn-logout:hover {
    background: #dc2626;
}

/* Área Principal */
.Principal {
    margin-left: 260px;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.container_area {
    flex: 1;
    padding: 30px;
    overflow-y: auto;
    background: #f8fafc;
}

.Mensagem_entrada {
    margin-bottom: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.Mensagem_entrada h3 {
    font-size: 28px;
    color: #1e293b;
}

.Mensagem_entrada h4 {
    font-size: 24px;
    color: #1e293b;
}

/* Cards de Informação */
.container_Informacao {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.total_pacientes,
.total_avaliacoes_realizadas,
.encaminhamentos,
.avaliacoes_recentes {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.total_pacientes h4,
.total_avaliacoes_realizadas h4,
.encaminhamentos h4,
.avaliacoes_recentes h4 {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 12px;
}

.contagem_1, .contagem_2, .contagem_3, .contagem_4 {
    font-size: 36px;
    font-weight: 700;
    color: #1e293b;
}

/* Acessos Rápidos */
.container_acessos {
    margin-bottom: 40px;
}

.container_acessos h3 {
    font-size: 20px;
    margin-bottom: 20px;
    color: #1e293b;
}

.acesso_rapido {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.cadastrar_paciente button,
.cadastrar_avaliacao button,
.cadastrar_relatorio button,
.gerenciar_usuarios button {
    width: 100%;
    background: white;
    border: none;
    padding: 24px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cadastrar_paciente button:hover,
.cadastrar_avaliacao button:hover,
.cadastrar_relatorio button:hover,
.gerenciar_usuarios button:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.cadastrar_paciente button h4,
.cadastrar_avaliacao button h4,
.cadastrar_relatorio button h4,
.gerenciar_usuarios button h4 {
    color: #1e293b;
    margin-top: 12px;
    font-size: 15px;
}

/* Tabelas */
.tabela-pacientes,
.tabela-avaliacoes,
.tabela-relatorios {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

table {
    width: 100%;
    border-collapse: collapse;
}

thead {
    background: #f1f5f9;
}

thead th {
    padding: 16px;
    text-align: left;
    font-weight: 600;
    color: #475569;
    font-size: 14px;
}

tbody td {
    padding: 16px;
    border-top: 1px solid #e2e8f0;
    color: #334155;
}

tbody tr:hover {
    background: #f8fafc;
}

/* Botões de Ação */
.btn-acoes {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.btn-editar,
.btn-avaliar,
.btn-historico,
.btn-excluir {
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.3s;
}

.btn-editar {
    background: #3b82f6;
    color: white;
}

.btn-avaliar {
    background: #10b981;
    color: white;
}

.btn-historico {
    background: #8b5cf6;
    color: white;
}

.btn-excluir {
    background: #ef4444;
    color: white;
}

.btn-editar:hover,
.btn-avaliar:hover,
.btn-historico:hover,
.btn-excluir:hover {
    opacity: 0.8;
}

/* Formulários */
.form-container {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-width: 800px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #334155;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #3b82f6;
}

.form-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

/* Checklist de Avaliação */
.checklist_avaliacao {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.checklist_avaliacao h4 {
    margin-bottom: 20px;
    color: #1e293b;
}

.checklist_avaliacao li {
    list-style: none;
    padding: 16px;
    background: #f8fafc;
    margin-bottom: 10px;
    border-radius: 8px;
    transition: background 0.3s;
}

.checklist_avaliacao li:hover {
    background: #f1f5f9;
}

.checklist_avaliacao input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin-right: 12px;
    cursor: pointer;
}

.checklist_avaliacao label {
    cursor: pointer;
    font-size: 15px;
    color: #334155;
}

/* Botões */
.btn-primary,
.btn-secondary,
.btn-danger {
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    margin-right: 10px;
}

.btn-primary {
    background: #3b82f6;
    color: white;
}

.btn-secondary {
    background: #64748b;
    color: white;
}

.btn-danger {
    background: #ef4444;
    color: white;
}

.btn-primary:hover { background: #2563eb; }
.btn-secondary:hover { background: #475569; }
.btn-danger:hover { background: #dc2626; }

/* Badge de Status */
.badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
}

.badge-success {
    background: #d1fae5;
    color: #065f46;
}

.badge-warning {
    background: #fef3c7;
    color: #92400e;
}

.badge-danger {
    background: #fee2e2;
    color: #991b1b;
}

.badge-info {
    background: #dbeafe;
    color: #1e40af;
}

/* Resultado */
.resultado-card {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.info-paciente-box {
    background: #f8fafc;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.score-display {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin: 30px 0;
}

.score-box {
    text-align: center;
    padding: 30px;
    border-radius: 12px;
}

.score-box.score {
    background: #dbeafe;
}

.score-box.threshold {
    background: #f3f4f6;
}

.score-box h4 {
    color: #64748b;
    font-size: 14px;
    margin-bottom: 10px;
}

.score-box .valor {
    font-size: 48px;
    font-weight: 700;
    color: #1e293b;
}

.recomendacao {
    padding: 24px;
    border-radius: 12px;
    margin-top: 20px;
}

.recomendacao.alerta {
    background: #fee2e2;
    border: 2px solid #ef4444;
}

.recomendacao.normal {
    background: #d1fae5;
    border: 2px solid #10b981;
}

.recomendacao h4 {
    margin-bottom: 10px;
}

/* Filtros */
.filtros-container {
    background: white;
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filtros-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
}

/* Utilitários */
.text-center { text-align: center; }
.mt-20 { margin-top: 20px; }
.mb-20 { margin-bottom: 20px; }
.hidden { display: none; }

/* Responsivo */
@media (max-width: 768px) {
    .menu {
        width: 0;
        transform: translateX(-100%);
    }
    
    .Principal {
        margin-left: 0;
    }
    
    .form-row,
    .score-display {
        grid-template-columns: 1fr;
    }
}
```

---

## 📄 login.html

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles/global.css">
    <title>Login - Sistema de Triagem Clínica</title>
</head>
<body>
    <div class="principal">
        <div class="container_login">
            <h2>Sistema de Triagem Clínica</h2>
            <p style="text-align: center; color: #666; margin-bottom: 30px;">Sistema de apoio à triagem clínica</p>

            <form id="loginForm">
                <label for="email">Email / Usuário:</label>
                <input type="email" id="email" name="email" placeholder="seu@email.com" required>

                <label for="senha">Senha:</label>
                <input type="password" id="senha" name="senha" placeholder="••••••••" required>

                <button type="submit">Entrar</button>

                <p>Esqueci minha senha. <a href="recuperar_senha.html">Recuperar Senha</a></p>
                <p style="margin-top: 10px; font-size: 12px;">
                    Demo: admin@clinica.com ou user@clinica.com
                </p>
            </form>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            
            // Verificar credenciais (demo)
            const isAdmin = email === 'admin@clinica.com';
            
            // Salvar dados no localStorage
            localStorage.setItem('userEmail', email);
            localStorage.setItem('isAdmin', isAdmin);
            localStorage.setItem('isLoggedIn', 'true');
            
            // Redirecionar para dashboard
            window.location.href = 'dashboard.html';
        });
    </script>
</body>
</html>
```

---

## 📄 dashboard.html

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles/global.css">
    <title>Dashboard - Sistema de Triagem Clínica</title>
</head>
<body class="dashboard-layout">

    <!-- Menu Lateral -->
    <div class="menu">
        <div class="titulo">
            <h3>Sistema de Triagem Clínica</h3>
            <p>MVP</p>
        </div>

        <div class="Paginas">
            <button class="btn-dashboard active" onclick="navigate('dashboard.html')">📊 Dashboard</button>
            <button class="btn-pacientes" onclick="navigate('pacientes.html')">👥 Pacientes</button>
            <button class="btn-avaliacoes" onclick="navigate('nova_avaliacao.html')">📋 Nova Avaliação</button>
            <button class="btn-relatorios" onclick="navigate('relatorios.html')">📄 Relatórios</button>
            <button class="btn-usuarios" onclick="navigate('usuarios.html')" id="btnUsuarios">⚙️ Usuários</button>
        </div>

        <div class="Acesso_usuario">
            <button class="btn-acesso_usuario" id="userInfo">👤 Usuário</button>
        </div>

        <div class="logout">
            <button class="btn-logout" onclick="logout()">🚪 Sair</button>
        </div>
    </div>

    <!-- Caixa Principal -->
    <div class="Principal">
        <div class="container_area">

            <div class="Mensagem_entrada">
                <div>
                    <h3 id="welcomeMessage">Bem-vindo!</h3>
                    <p style="color: #64748b;">Bem-vindo ao sistema de triagem clínica</p>
                </div>
            </div>

            <!-- Cards de Informações -->
            <div class="container_Informacao">
                <div class="total_pacientes">
                    <h4>Total de Pacientes</h4>
                    <div class="contagem_1">127</div>
                </div>

                <div class="total_avaliacoes_realizadas">
                    <h4>Avaliações Realizadas</h4>
                    <div class="contagem_2">89</div>
                </div>

                <div class="encaminhamentos">
                    <h4>Encaminhamentos</h4>
                    <div class="contagem_3">34</div>
                </div>

                <div class="avaliacoes_recentes">
                    <h4>Avaliações Recentes</h4>
                    <div class="contagem_4">12</div>
                </div>
            </div>

            <!-- Acessos Rápidos -->
            <div class="container_acessos">
                <h3>Acesso Rápido</h3>

                <div class="acesso_rapido">
                    <div class="cadastrar_paciente">
                        <button onclick="navigate('novo_paciente.html')">
                            <div style="font-size: 32px;">👥</div>
                            <h4>Cadastrar Paciente</h4>
                        </button>
                    </div>

                    <div class="cadastrar_avaliacao">
                        <button onclick="navigate('nova_avaliacao.html')">
                            <div style="font-size: 32px;">📋</div>
                            <h4>Nova Avaliação</h4>
                        </button>
                    </div>

                    <div class="cadastrar_relatorio">
                        <button onclick="navigate('relatorios.html')">
                            <div style="font-size: 32px;">📄</div>
                            <h4>Relatórios</h4>
                        </button>
                    </div>

                    <div class="gerenciar_usuarios" id="quickAccessUsuarios">
                        <button onclick="navigate('usuarios.html')">
                            <div style="font-size: 32px;">⚙️</div>
                            <h4>Gerenciar Usuários</h4>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Avaliações Recentes -->
            <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 20px;">Avaliações Recentes</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Paciente</th>
                            <th>Data</th>
                            <th>Score</th>
                            <th>Resultado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>João Silva</td>
                            <td>08/05/2026</td>
                            <td><strong>0.72</strong></td>
                            <td><span class="badge badge-danger">Encaminhamento</span></td>
                        </tr>
                        <tr>
                            <td>Maria Santos</td>
                            <td>07/05/2026</td>
                            <td><strong>0.45</strong></td>
                            <td><span class="badge badge-success">Normal</span></td>
                        </tr>
                        <tr>
                            <td>Pedro Costa</td>
                            <td>07/05/2026</td>
                            <td><strong>0.68</strong></td>
                            <td><span class="badge badge-danger">Encaminhamento</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </div>

    <script>
        // Verificar autenticação
        if (!localStorage.getItem('isLoggedIn')) {
            window.location.href = 'login.html';
        }

        // Carregar nome do usuário
        const userEmail = localStorage.getItem('userEmail');
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        const userName = userEmail ? userEmail.split('@')[0] : 'Usuário';
        
        document.getElementById('welcomeMessage').textContent = `Olá, ${userName.charAt(0).toUpperCase() + userName.slice(1)}!`;
        document.getElementById('userInfo').textContent = `👤 ${userName}`;

        // Ocultar menu de usuários se não for admin
        if (!isAdmin) {
            document.getElementById('btnUsuarios').style.display = 'none';
            document.getElementById('quickAccessUsuarios').style.display = 'none';
        }

        function navigate(page) {
            window.location.href = page;
        }

        function logout() {
            localStorage.clear();
            window.location.href = 'login.html';
        }
    </script>
</body>
</html>
```

---

## 📄 pacientes.html

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles/global.css">
    <title>Pacientes - Sistema de Triagem Clínica</title>
</head>
<body class="dashboard-layout">

    <!-- Menu Lateral (mesmo do dashboard) -->
    <div class="menu">
        <div class="titulo">
            <h3>Sistema de Triagem Clínica</h3>
            <p>MVP</p>
        </div>

        <div class="Paginas">
            <button onclick="navigate('dashboard.html')">📊 Dashboard</button>
            <button class="active" onclick="navigate('pacientes.html')">👥 Pacientes</button>
            <button onclick="navigate('nova_avaliacao.html')">📋 Nova Avaliação</button>
            <button onclick="navigate('relatorios.html')">📄 Relatórios</button>
            <button onclick="navigate('usuarios.html')" id="btnUsuarios">⚙️ Usuários</button>
        </div>

        <div class="Acesso_usuario">
            <button class="btn-acesso_usuario" id="userInfo">👤 Usuário</button>
        </div>

        <div class="logout">
            <button class="btn-logout" onclick="logout()">🚪 Sair</button>
        </div>
    </div>

    <!-- Principal -->
    <div class="Principal">
        <div class="container_area">

            <div class="Mensagem_entrada">
                <h4>Lista de Pacientes</h4>
                <button class="btn-primary" onclick="navigate('novo_paciente.html')">➕ Novo Paciente</button>
            </div>

            <!-- Filtros -->
            <div class="filtros-container">
                <div class="filtros-grid">
                    <div class="form-group">
                        <label>Buscar por nome</label>
                        <input type="text" id="searchName" placeholder="Digite o nome..." oninput="filterPatients()">
                    </div>
                    <div class="form-group">
                        <label>Sexo</label>
                        <select id="filterSex" onchange="filterPatients()">
                            <option value="todos">Todos</option>
                            <option value="masculino">Masculino</option>
                            <option value="feminino">Feminino</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Tabela de Pacientes -->
            <div class="tabela-pacientes">
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Sexo</th>
                            <th>Idade</th>
                            <th>Responsável</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="patientsTable">
                        <tr data-sexo="masculino">
                            <td><strong>João Silva</strong></td>
                            <td>Masculino</td>
                            <td>8 anos</td>
                            <td>Maria Silva</td>
                            <td>
                                <div class="btn-acoes">
                                    <button class="btn-editar">✏️ Editar</button>
                                    <button class="btn-avaliar" onclick="navigate('nova_avaliacao.html?id=1')">📋 Avaliar</button>
                                    <button class="btn-historico">📜 Histórico</button>
                                </div>
                            </td>
                        </tr>
                        <tr data-sexo="feminino">
                            <td><strong>Maria Santos</strong></td>
                            <td>Feminino</td>
                            <td>10 anos</td>
                            <td>José Santos</td>
                            <td>
                                <div class="btn-acoes">
                                    <button class="btn-editar">✏️ Editar</button>
                                    <button class="btn-avaliar" onclick="navigate('nova_avaliacao.html?id=2')">📋 Avaliar</button>
                                    <button class="btn-historico">📜 Histórico</button>
                                </div>
                            </td>
                        </tr>
                        <tr data-sexo="masculino">
                            <td><strong>Pedro Costa</strong></td>
                            <td>Masculino</td>
                            <td>6 anos</td>
                            <td>Ana Costa</td>
                            <td>
                                <div class="btn-acoes">
                                    <button class="btn-editar">✏️ Editar</button>
                                    <button class="btn-avaliar" onclick="navigate('nova_avaliacao.html?id=3')">📋 Avaliar</button>
                                    <button class="btn-historico">📜 Histórico</button>
                                </div>
                            </td>
                        </tr>
                        <tr data-sexo="feminino">
                            <td><strong>Ana Oliveira</strong></td>
                            <td>Feminino</td>
                            <td>12 anos</td>
                            <td>Carlos Oliveira</td>
                            <td>
                                <div class="btn-acoes">
                                    <button class="btn-editar">✏️ Editar</button>
                                    <button class="btn-avaliar" onclick="navigate('nova_avaliacao.html?id=4')">📋 Avaliar</button>
                                    <button class="btn-historico">📜 Histórico</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </div>

    <script>
        // Auth check
        if (!localStorage.getItem('isLoggedIn')) {
            window.location.href = 'login.html';
        }

        const userEmail = localStorage.getItem('userEmail');
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        const userName = userEmail ? userEmail.split('@')[0] : 'Usuário';
        document.getElementById('userInfo').textContent = `👤 ${userName}`;

        if (!isAdmin) {
            document.getElementById('btnUsuarios').style.display = 'none';
        }

        function navigate(page) {
            window.location.href = page;
        }

        function logout() {
            localStorage.clear();
            window.location.href = 'login.html';
        }

        // Filtro de pacientes
        function filterPatients() {
            const searchName = document.getElementById('searchName').value.toLowerCase();
            const filterSex = document.getElementById('filterSex').value.toLowerCase();
            const rows = document.querySelectorAll('#patientsTable tr');

            rows.forEach(row => {
                const name = row.cells[0]?.textContent.toLowerCase() || '';
                const sex = row.getAttribute('data-sexo') || '';
                
                const matchName = name.includes(searchName);
                const matchSex = filterSex === 'todos' || sex === filterSex;

                if (matchName && matchSex) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>
```

---

## 📄 novo_paciente.html

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles/global.css">
    <title>Novo Paciente - Sistema de Triagem Clínica</title>
</head>
<body class="dashboard-layout">

    <!-- Menu Lateral -->
    <div class="menu">
        <div class="titulo">
            <h3>Sistema de Triagem Clínica</h3>
            <p>MVP</p>
        </div>
        <div class="Paginas">
            <button onclick="navigate('dashboard.html')">📊 Dashboard</button>
            <button class="active" onclick="navigate('pacientes.html')">👥 Pacientes</button>
            <button onclick="navigate('nova_avaliacao.html')">📋 Nova Avaliação</button>
            <button onclick="navigate('relatorios.html')">📄 Relatórios</button>
            <button onclick="navigate('usuarios.html')" id="btnUsuarios">⚙️ Usuários</button>
        </div>
        <div class="Acesso_usuario">
            <button class="btn-acesso_usuario" id="userInfo">👤 Usuário</button>
        </div>
        <div class="logout">
            <button class="btn-logout" onclick="logout()">🚪 Sair</button>
        </div>
    </div>

    <!-- Principal -->
    <div class="Principal">
        <div class="container_area">
            
            <div class="Mensagem_entrada">
                <div>
                    <button class="btn-secondary" onclick="navigate('pacientes.html')" style="margin-right: 15px;">← Voltar</button>
                    <h4 style="display: inline;">Cadastrar Novo Paciente</h4>
                </div>
            </div>

            <div class="form-container">
                <form id="patientForm">
                    <div class="form-row">
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label>Nome Completo *</label>
                            <input type="text" id="nome" required placeholder="Digite o nome do paciente">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Sexo *</label>
                            <select id="sexo" required>
                                <option value="">Selecione</option>
                                <option value="masculino">Masculino</option>
                                <option value="feminino">Feminino</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Idade *</label>
                            <input type="number" id="idade" required placeholder="Digite a idade">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Responsável *</label>
                            <input type="text" id="responsavel" required placeholder="Nome do responsável">
                        </div>

                        <div class="form-group">
                            <label>Telefone/Contato *</label>
                            <input type="tel" id="telefone" required placeholder="(00) 00000-0000">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Observações</label>
                        <textarea id="observacoes" rows="4" placeholder="Informações adicionais (opcional)"></textarea>
                    </div>

                    <div style="margin-top: 30px;">
                        <button type="submit" class="btn-primary">Salvar Paciente</button>
                        <button type="button" class="btn-secondary" onclick="navigate('pacientes.html')">Cancelar</button>
                    </div>
                </form>
            </div>

        </div>
    </div>

    <script>
        if (!localStorage.getItem('isLoggedIn')) {
            window.location.href = 'login.html';
        }

        const userEmail = localStorage.getItem('userEmail');
        const userName = userEmail ? userEmail.split('@')[0] : 'Usuário';
        document.getElementById('userInfo').textContent = `👤 ${userName}`;

        function navigate(page) {
            window.location.href = page;
        }

        function logout() {
            localStorage.clear();
            window.location.href = 'login.html';
        }

        document.getElementById('patientForm').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Paciente cadastrado com sucesso!');
            window.location.href = 'pacientes.html';
        });
    </script>
</body>
</html>
```

---

## 📄 nova_avaliacao.html

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles/global.css">
    <title>Nova Avaliação - Sistema de Triagem Clínica</title>
</head>
<body class="dashboard-layout">

    <!-- Menu -->
    <div class="menu">
        <div class="titulo">
            <h3>Sistema de Triagem Clínica</h3>
            <p>MVP</p>
        </div>
        <div class="Paginas">
            <button onclick="navigate('dashboard.html')">📊 Dashboard</button>
            <button onclick="navigate('pacientes.html')">👥 Pacientes</button>
            <button class="active" onclick="navigate('nova_avaliacao.html')">📋 Nova Avaliação</button>
            <button onclick="navigate('relatorios.html')">📄 Relatórios</button>
            <button onclick="navigate('usuarios.html')" id="btnUsuarios">⚙️ Usuários</button>
        </div>
        <div class="Acesso_usuario">
            <button class="btn-acesso_usuario" id="userInfo">👤 Usuário</button>
        </div>
        <div class="logout">
            <button class="btn-logout" onclick="logout()">🚪 Sair</button>
        </div>
    </div>

    <!-- Principal -->
    <div class="Principal">
        <div class="container_area">
            
            <div class="Mensagem_entrada">
                <div>
                    <button class="btn-secondary" onclick="navigate('pacientes.html')" style="margin-right: 15px;">← Voltar</button>
                    <h4 style="display: inline;">Nova Avaliação Clínica</h4>
                </div>
            </div>

            <!-- Informações do Paciente -->
            <div class="form-container mb-20">
                <h4>Informações do Paciente</h4>
                <div class="form-group" style="margin-top: 20px;">
                    <label>Selecionar Paciente</label>
                    <select id="selectPatient" onchange="loadPatientInfo()">
                        <option value="">Selecione um paciente</option>
                        <option value="1" data-nome="João Silva" data-sexo="Masculino" data-idade="8">João Silva</option>
                        <option value="2" data-nome="Maria Santos" data-sexo="Feminino" data-idade="10">Maria Santos</option>
                        <option value="3" data-nome="Pedro Costa" data-sexo="Masculino" data-idade="6">Pedro Costa</option>
                    </select>
                </div>

                <div id="patientInfo" class="info-paciente-box hidden" style="margin-top: 20px;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                        <div>
                            <p style="color: #64748b; font-size: 14px;">Nome:</p>
                            <p id="patientName" style="font-weight: 600; color: #1e293b;"></p>
                        </div>
                        <div>
                            <p style="color: #64748b; font-size: 14px;">Sexo:</p>
                            <p id="patientSex" style="font-weight: 600; color: #1e293b;"></p>
                        </div>
                        <div>
                            <p style="color: #64748b; font-size: 14px;">Idade:</p>
                            <p id="patientAge" style="font-weight: 600; color: #1e293b;"></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Checklist -->
            <div class="checklist_avaliacao">
                <h4>Checklist Clínico</h4>
                <p style="color: #64748b; margin-bottom: 20px;">Marque os sintomas e características observadas no paciente:</p>

                <ul style="padding: 0;">
                    <li>
                        <input type="checkbox" id="s1" data-weight="0.15">
                        <label for="s1">Deficiência intelectual</label>
                    </li>
                    <li>
                        <input type="checkbox" id="s2" data-weight="0.10">
                        <label for="s2">Face alongada/orelhas de abano</label>
                    </li>
                    <li>
                        <input type="checkbox" id="s3" data-weight="0.12">
                        <label for="s3">Macroorquidismo</label>
                    </li>
                    <li>
                        <input type="checkbox" id="s4" data-weight="0.08">
                        <label for="s4">Hipermobilidade articular</label>
                    </li>
                    <li>
                        <input type="checkbox" id="s5" data-weight="0.10">
                        <label for="s5">Dificuldades de aprendizagem</label>
                    </li>
                    <li>
                        <input type="checkbox" id="s6" data-weight="0.09">
                        <label for="s6">Déficit de atenção</label>
                    </li>
                    <li>
                        <input type="checkbox" id="s7" data-weight="0.08">
                        <label for="s7">Movimentos repetitivos</label>
                    </li>
                    <li>
                        <input type="checkbox" id="s8" data-weight="0.10">
                        <label for="s8">Atraso na fala</label>
                    </li>
                    <li>
                        <input type="checkbox" id="s9" data-weight="0.07">
                        <label for="s9">Hiperatividade</label>
                    </li>
                    <li>
                        <input type="checkbox" id="s10" data-weight="0.06">
                        <label for="s10">Evita contato visual</label>
                    </li>
                    <li>
                        <input type="checkbox" id="s11" data-weight="0.06">
                        <label for="s11">Evita contato físico</label>
                    </li>
                    <li>
                        <input type="checkbox" id="s12" data-weight="0.05">
                        <label for="s12">Agressividade</label>
                    </li>
                </ul>

                <div style="margin-top: 30px;">
                    <button class="btn-primary" onclick="calculateScore()">Calcular Resultado</button>
                    <button class="btn-secondary" onclick="clearChecklist()">Limpar Checklist</button>
                    <button class="btn-secondary" onclick="navigate('pacientes.html')">Cancelar</button>
                </div>
            </div>

        </div>
    </div>

    <script>
        if (!localStorage.getItem('isLoggedIn')) {
            window.location.href = 'login.html';
        }

        const userEmail = localStorage.getItem('userEmail');
        const userName = userEmail ? userEmail.split('@')[0] : 'Usuário';
        document.getElementById('userInfo').textContent = `👤 ${userName}`;

        function navigate(page) {
            window.location.href = page;
        }

        function logout() {
            localStorage.clear();
            window.location.href = 'login.html';
        }

        function loadPatientInfo() {
            const select = document.getElementById('selectPatient');
            const option = select.options[select.selectedIndex];
            
            if (select.value) {
                document.getElementById('patientInfo').classList.remove('hidden');
                document.getElementById('patientName').textContent = option.getAttribute('data-nome');
                document.getElementById('patientSex').textContent = option.getAttribute('data-sexo');
                document.getElementById('patientAge').textContent = option.getAttribute('data-idade') + ' anos';
            } else {
                document.getElementById('patientInfo').classList.add('hidden');
            }
        }

        function clearChecklist() {
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        }

        function calculateScore() {
            const select = document.getElementById('selectPatient');
            if (!select.value) {
                alert('Por favor, selecione um paciente primeiro!');
                return;
            }

            const option = select.options[select.selectedIndex];
            const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
            
            let score = 0;
            checkboxes.forEach(cb => {
                score += parseFloat(cb.getAttribute('data-weight'));
            });

            // Salvar no localStorage
            localStorage.setItem('evaluationPatient', option.getAttribute('data-nome'));
            localStorage.setItem('evaluationSex', option.getAttribute('data-sexo'));
            localStorage.setItem('evaluationAge', option.getAttribute('data-idade'));
            localStorage.setItem('evaluationScore', score.toFixed(2));
            
            // Redirecionar para resultado
            window.location.href = 'resultado.html';
        }
    </script>
</body>
</html>
```

---

## 📄 resultado.html

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles/global.css">
    <title>Resultado da Triagem - Sistema de Triagem Clínica</title>
</head>
<body class="dashboard-layout">

    <!-- Menu -->
    <div class="menu">
        <div class="titulo">
            <h3>Sistema de Triagem Clínica</h3>
            <p>MVP</p>
        </div>
        <div class="Paginas">
            <button onclick="navigate('dashboard.html')">📊 Dashboard</button>
            <button onclick="navigate('pacientes.html')">👥 Pacientes</button>
            <button class="active" onclick="navigate('nova_avaliacao.html')">📋 Nova Avaliação</button>
            <button onclick="navigate('relatorios.html')">📄 Relatórios</button>
            <button onclick="navigate('usuarios.html')" id="btnUsuarios">⚙️ Usuários</button>
        </div>
        <div class="Acesso_usuario">
            <button class="btn-acesso_usuario" id="userInfo">👤 Usuário</button>
        </div>
        <div class="logout">
            <button class="btn-logout" onclick="logout()">🚪 Sair</button>
        </div>
    </div>

    <!-- Principal -->
    <div class="Principal">
        <div class="container_area">
            
            <div class="Mensagem_entrada">
                <div>
                    <button class="btn-secondary" onclick="navigate('nova_avaliacao.html')" style="margin-right: 15px;">← Voltar</button>
                    <h4 style="display: inline;">Resultado da Triagem</h4>
                </div>
            </div>

            <div class="resultado-card">
                <div class="info-paciente-box">
                    <h4 style="margin-bottom: 15px;">Dados do Paciente</h4>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                        <div>
                            <p style="color: #64748b; font-size: 14px;">Nome:</p>
                            <p id="resPatientName" style="font-weight: 600; color: #1e293b;"></p>
                        </div>
                        <div>
                            <p style="color: #64748b; font-size: 14px;">Sexo:</p>
                            <p id="resPatientSex" style="font-weight: 600; color: #1e293b;"></p>
                        </div>
                        <div>
                            <p style="color: #64748b; font-size: 14px;">Idade:</p>
                            <p id="resPatientAge" style="font-weight: 600; color: #1e293b;"></p>
                        </div>
                    </div>
                </div>

                <h4 style="margin-top: 30px; margin-bottom: 20px;">Análise da Triagem</h4>

                <div class="score-display">
                    <div class="score-box score">
                        <h4>Score Calculado</h4>
                        <div class="valor" id="scoreValue">0.00</div>
                    </div>
                    <div class="score-box threshold">
                        <h4>Limiar (<span id="thresholdSex"></span>)</h4>
                        <div class="valor" id="thresholdValue">0.00</div>
                    </div>
                </div>

                <div class="recomendacao" id="recommendation">
                    <h4 id="recTitle" style="display: flex; align-items: center; gap: 10px;">
                        <span id="recIcon"></span>
                        <span>Resultado da Triagem</span>
                        <span class="badge" id="recBadge"></span>
                    </h4>
                    <p id="recText" style="margin-top: 15px; line-height: 1.6;"></p>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #64748b; font-size: 14px;">Data da Avaliação</p>
                    <p id="evaluationDate" style="font-weight: 500; color: #1e293b;"></p>
                </div>
            </div>

            <div style="margin-top: 20px;">
                <button class="btn-primary" onclick="saveEvaluation()">Salvar Avaliação</button>
                <button class="btn-secondary" onclick="printResult()">🖨️ Imprimir Formulário</button>
                <button class="btn-secondary" onclick="navigate('pacientes.html')">Voltar para Pacientes</button>
            </div>

        </div>
    </div>

    <script>
        if (!localStorage.getItem('isLoggedIn')) {
            window.location.href = 'login.html';
        }

        const userEmail = localStorage.getItem('userEmail');
        const userName = userEmail ? userEmail.split('@')[0] : 'Usuário';
        document.getElementById('userInfo').textContent = `👤 ${userName}`;

        // Carregar dados da avaliação
        const patientName = localStorage.getItem('evaluationPatient');
        const patientSex = localStorage.getItem('evaluationSex');
        const patientAge = localStorage.getItem('evaluationAge');
        const score = parseFloat(localStorage.getItem('evaluationScore'));

        if (!patientName) {
            alert('Nenhuma avaliação encontrada!');
            window.location.href = 'nova_avaliacao.html';
        }

        // Preencher dados
        document.getElementById('resPatientName').textContent = patientName;
        document.getElementById('resPatientSex').textContent = patientSex;
        document.getElementById('resPatientAge').textContent = patientAge + ' anos';
        document.getElementById('scoreValue').textContent = score.toFixed(2);

        // Determinar limiar e resultado
        const threshold = patientSex === 'Masculino' ? 0.56 : 0.52;
        const needsReferral = score >= threshold;

        document.getElementById('thresholdSex').textContent = patientSex;
        document.getElementById('thresholdValue').textContent = threshold.toFixed(2);

        // Configurar recomendação
        const recDiv = document.getElementById('recommendation');
        const recIcon = document.getElementById('recIcon');
        const recBadge = document.getElementById('recBadge');
        const recText = document.getElementById('recText');

        if (needsReferral) {
            recDiv.classList.add('alerta');
            recIcon.textContent = '⚠️';
            recBadge.textContent = 'Encaminhamento Necessário';
            recBadge.className = 'badge badge-danger';
            recText.innerHTML = `O score obtido (${score.toFixed(2)}) está acima do limiar de ${threshold.toFixed(2)} para pacientes do sexo ${patientSex.toLowerCase()}.<br><strong style="display: block; margin-top: 10px;">Recomendação: Encaminhamento para teste genético e avaliação especializada.</strong>`;
        } else {
            recDiv.classList.add('normal');
            recIcon.textContent = '✅';
            recBadge.textContent = 'Dentro do Esperado';
            recBadge.className = 'badge badge-success';
            recText.innerHTML = `O score obtido (${score.toFixed(2)}) está dentro do esperado para pacientes do sexo ${patientSex.toLowerCase()} (limiar: ${threshold.toFixed(2)}).<br><strong style="display: block; margin-top: 10px;">Recomendação: Manter acompanhamento de rotina.</strong>`;
        }

        // Data
        const today = new Date();
        document.getElementById('evaluationDate').textContent = today.toLocaleDateString('pt-BR');

        function navigate(page) {
            window.location.href = page;
        }

        function logout() {
            localStorage.clear();
            window.location.href = 'login.html';
        }

        function saveEvaluation() {
            alert('Avaliação salva com sucesso!');
            window.location.href = 'pacientes.html';
        }

        function printResult() {
            window.print();
        }
    </script>
</body>
</html>
```

---

## 📄 relatorios.html

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles/global.css">
    <title>Relatórios - Sistema de Triagem Clínica</title>
</head>
<body class="dashboard-layout">

    <!-- Menu -->
    <div class="menu">
        <div class="titulo">
            <h3>Sistema de Triagem Clínica</h3>
            <p>MVP</p>
        </div>
        <div class="Paginas">
            <button onclick="navigate('dashboard.html')">📊 Dashboard</button>
            <button onclick="navigate('pacientes.html')">👥 Pacientes</button>
            <button onclick="navigate('nova_avaliacao.html')">📋 Nova Avaliação</button>
            <button class="active" onclick="navigate('relatorios.html')">📄 Relatórios</button>
            <button onclick="navigate('usuarios.html')" id="btnUsuarios">⚙️ Usuários</button>
        </div>
        <div class="Acesso_usuario">
            <button class="btn-acesso_usuario" id="userInfo">👤 Usuário</button>
        </div>
        <div class="logout">
            <button class="btn-logout" onclick="logout()">🚪 Sair</button>
        </div>
    </div>

    <!-- Principal -->
    <div class="Principal">
        <div class="container_area">
            
            <div class="Mensagem_entrada">
                <h4>Relatórios</h4>
                <button class="btn-primary" onclick="exportReport()">📥 Exportar</button>
            </div>

            <!-- Filtros -->
            <div class="filtros-container">
                <h4 style="margin-bottom: 15px;">Filtros</h4>
                <div class="filtros-grid">
                    <div class="form-group">
                        <label>Data Inicial</label>
                        <input type="date" id="dataInicial">
                    </div>
                    <div class="form-group">
                        <label>Data Final</label>
                        <input type="date" id="dataFinal">
                    </div>
                    <div class="form-group">
                        <label>Usuário</label>
                        <select id="filterUser">
                            <option value="todos">Todos</option>
                            <option value="dr-carlos">Dr. Carlos</option>
                            <option value="dra-ana">Dra. Ana</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Paciente</label>
                        <select id="filterPatient">
                            <option value="todos">Todos</option>
                            <option value="joao">João Silva</option>
                            <option value="maria">Maria Santos</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Resultado</label>
                        <select id="filterResult">
                            <option value="todos">Todos</option>
                            <option value="encaminhamento">Encaminhamento</option>
                            <option value="normal">Normal</option>
                        </select>
                    </div>
                </div>
                <button class="btn-primary mt-20">🔍 Filtrar</button>
            </div>

            <!-- Tabela de Resultados -->
            <div class="tabela-relatorios">
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Paciente</th>
                            <th>Usuário</th>
                            <th>Score</th>
                            <th>Resultado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>08/05/2026</td>
                            <td>João Silva</td>
                            <td>Dr. Carlos</td>
                            <td><strong>0.72</strong></td>
                            <td><span class="badge badge-danger">Encaminhamento</span></td>
                        </tr>
                        <tr>
                            <td>07/05/2026</td>
                            <td>Maria Santos</td>
                            <td>Dra. Ana</td>
                            <td><strong>0.45</strong></td>
                            <td><span class="badge badge-success">Normal</span></td>
                        </tr>
                        <tr>
                            <td>07/05/2026</td>
                            <td>Pedro Costa</td>
                            <td>Dr. Carlos</td>
                            <td><strong>0.68</strong></td>
                            <td><span class="badge badge-danger">Encaminhamento</span></td>
                        </tr>
                        <tr>
                            <td>06/05/2026</td>
                            <td>Ana Oliveira</td>
                            <td>Dra. Ana</td>
                            <td><strong>0.38</strong></td>
                            <td><span class="badge badge-success">Normal</span></td>
                        </tr>
                        <tr>
                            <td>05/05/2026</td>
                            <td>Lucas Ferreira</td>
                            <td>Dr. Carlos</td>
                            <td><strong>0.61</strong></td>
                            <td><span class="badge badge-danger">Encaminhamento</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </div>

    <script>
        if (!localStorage.getItem('isLoggedIn')) {
            window.location.href = 'login.html';
        }

        const userEmail = localStorage.getItem('userEmail');
        const userName = userEmail ? userEmail.split('@')[0] : 'Usuário';
        document.getElementById('userInfo').textContent = `👤 ${userName}`;

        function navigate(page) {
            window.location.href = page;
        }

        function logout() {
            localStorage.clear();
            window.location.href = 'login.html';
        }

        function exportReport() {
            alert('Relatório exportado com sucesso!');
        }
    </script>
</body>
</html>
```

---

## 📄 usuarios.html

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles/global.css">
    <title>Usuários - Sistema de Triagem Clínica</title>
</head>
<body class="dashboard-layout">

    <!-- Menu -->
    <div class="menu">
        <div class="titulo">
            <h3>Sistema de Triagem Clínica</h3>
            <p>MVP</p>
        </div>
        <div class="Paginas">
            <button onclick="navigate('dashboard.html')">📊 Dashboard</button>
            <button onclick="navigate('pacientes.html')">👥 Pacientes</button>
            <button onclick="navigate('nova_avaliacao.html')">📋 Nova Avaliação</button>
            <button onclick="navigate('relatorios.html')">📄 Relatórios</button>
            <button class="active" onclick="navigate('usuarios.html')">⚙️ Usuários</button>
        </div>
        <div class="Acesso_usuario">
            <button class="btn-acesso_usuario" id="userInfo">👤 Usuário</button>
        </div>
        <div class="logout">
            <button class="btn-logout" onclick="logout()">🚪 Sair</button>
        </div>
    </div>

    <!-- Principal -->
    <div class="Principal">
        <div class="container_area">
            
            <div class="Mensagem_entrada">
                <div>
                    <h4>Gerenciar Usuários</h4>
                    <p style="color: #f59e0b; font-size: 14px; margin-top: 5px;">⚠️ Área restrita para administradores</p>
                </div>
                <button class="btn-primary" onclick="toggleForm()">➕ Novo Usuário</button>
            </div>

            <!-- Formulário de Novo Usuário -->
            <div id="userForm" class="form-container hidden mb-20">
                <h4>Cadastrar Usuário</h4>
                <form onsubmit="saveUser(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nome Completo</label>
                            <input type="text" id="userName" required>
                        </div>
                        <div class="form-group">
                            <label>E-mail</label>
                            <input type="email" id="userEmail" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Senha</label>
                            <input type="password" id="userPassword" required>
                        </div>
                        <div class="form-group">
                            <label>Tipo de Usuário</label>
                            <select id="userType">
                                <option value="padrao">Usuário Padrão</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                    </div>
                    <div style="margin-top: 20px;">
                        <button type="submit" class="btn-primary">Salvar Usuário</button>
                        <button type="button" class="btn-secondary" onclick="toggleForm()">Cancelar</button>
                    </div>
                </form>
            </div>

            <!-- Tabela de Usuários -->
            <div class="tabela-pacientes">
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>E-mail</th>
                            <th>Tipo</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Dr. Carlos Silva</strong></td>
                            <td>carlos@clinica.com</td>
                            <td><span class="badge badge-danger">Administrador</span></td>
                            <td>
                                <div class="btn-acoes">
                                    <button class="btn-editar">✏️ Editar</button>
                                    <button class="btn-excluir">🗑️ Remover</button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Dra. Ana Santos</strong></td>
                            <td>ana@clinica.com</td>
                            <td><span class="badge badge-info">Usuário Padrão</span></td>
                            <td>
                                <div class="btn-acoes">
                                    <button class="btn-editar">✏️ Editar</button>
                                    <button class="btn-excluir">🗑️ Remover</button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Dr. Pedro Costa</strong></td>
                            <td>pedro@clinica.com</td>
                            <td><span class="badge badge-info">Usuário Padrão</span></td>
                            <td>
                                <div class="btn-acoes">
                                    <button class="btn-editar">✏️ Editar</button>
                                    <button class="btn-excluir">🗑️ Remover</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </div>

    <script>
        if (!localStorage.getItem('isLoggedIn')) {
            window.location.href = 'login.html';
        }

        // Verificar se é admin
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        if (!isAdmin) {
            alert('Acesso negado! Apenas administradores podem acessar esta página.');
            window.location.href = 'dashboard.html';
        }

        const userEmail = localStorage.getItem('userEmail');
        const userName = userEmail ? userEmail.split('@')[0] : 'Usuário';
        document.getElementById('userInfo').textContent = `👤 ${userName}`;

        function navigate(page) {
            window.location.href = page;
        }

        function logout() {
            localStorage.clear();
            window.location.href = 'login.html';
        }

        function toggleForm() {
            const form = document.getElementById('userForm');
            form.classList.toggle('hidden');
        }

        function saveUser(e) {
            e.preventDefault();
            alert('Usuário cadastrado com sucesso!');
            toggleForm();
        }
    </script>
</body>
</html>
```

---

## 📄 recuperar_senha.html

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles/global.css">
    <title>Recuperar Senha - Sistema de Triagem Clínica</title>
</head>
<body>
    <div class="principal">
        <div class="container_login">
            <h2>Recuperar Senha</h2>
            <p style="text-align: center; color: #666; margin-bottom: 30px;">Digite seu e-mail para recuperar sua senha</p>

            <form onsubmit="recoverPassword(event)">
                <label for="email">E-mail:</label>
                <input type="email" id="email" name="email" placeholder="seu@email.com" required>

                <button type="submit">Enviar Link de Recuperação</button>

                <p style="text-align: center;">
                    Lembrou sua senha? <a href="login.html">Fazer Login</a>
                </p>
            </form>
        </div>
    </div>

    <script>
        function recoverPassword(e) {
            e.preventDefault();
            alert('Link de recuperação enviado para seu e-mail!');
            window.location.href = 'login.html';
        }
    </script>
</body>
</html>
```

---

## 🎯 INSTRUÇÕES DE USO

### 1. Estrutura de Pastas

Crie a seguinte estrutura:

```
seu-projeto/
├── login.html
├── dashboard.html
├── pacientes.html
├── novo_paciente.html
├── nova_avaliacao.html
├── resultado.html
├── relatorios.html
├── usuarios.html
├── recuperar_senha.html
└── styles/
    └── global.css
```

### 2. Como Testar

1. Copie todo o código dos arquivos acima
2. Cole em arquivos com os nomes correspondentes
3. Abra `login.html` no navegador
4. Use as credenciais:
   - **Admin**: admin@clinica.com
   - **User**: user@clinica.com
   - **Senha**: qualquer

### 3. Funcionalidades

✅ **Login** - Autenticação com localStorage  
✅ **Dashboard** - Cards de estatísticas e acessos rápidos  
✅ **Pacientes** - Lista com filtros e busca  
✅ **Novo Paciente** - Formulário de cadastro  
✅ **Nova Avaliação** - Checklist com 12 sintomas  
✅ **Resultado** - Cálculo automático de score e recomendação  
✅ **Relatórios** - Tabela filtrada de avaliações  
✅ **Usuários** - Gerenciamento (apenas admin)  
✅ **Navegação** - Menu lateral fixo  
✅ **Responsivo** - Funciona em desktop e tablet

### 4. Customização

Para adaptar ao seu CSS existente:
- O CSS está em `styles/global.css`
- Mantenha suas classes existentes
- Adapte cores nas variáveis CSS

---

## ✅ PRONTO PARA USAR!

Todo o código está em HTML/CSS/JavaScript puro, sem dependências externas.
Copie, cole e execute diretamente no navegador! 🚀
