import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// Ligação com a base dados do MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Cada um deve mudar a senha de acordo com o seu workbench
    database: 'x_fragil'
});

// Testando a ligação com o banco
db.connect((err) => {
    if (err) {
        console.error('Erro ao ligar à base de dados:', err);
        return;
    }
    console.log('Ligado à base de dados x_fragil com sucesso');
});

app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    const sql = "SELECT * FROM usuario WHERE email = ? AND senha = ?";

    db.query(sql, [email, senha], (err, results) => {
        if (err) {
            return res.status(500).json({ sucesso: false, mensagem: "Erro interno do servidor" });
        }

        if (results.length > 0) {
            const user = results[0];
            // Login válido!
            res.json({
                sucesso: true,
                usuario: {
                    id_usuario: user.id_usuario,
                    email: user.email,
                    nome_usuario: user.nome_usuario,
                    sobrenome_usuario: user.sobrenome_usuario,
                    tipo_usuario: user.tipo_usuario
                }
            });
        } else {
            res.status(401).json({ sucesso: false, mensagem: "E-mail ou palavra-passe incorretos." });
        }
    });
});
// Rota para cadastrar novo paciente
app.post('/api/pacientes', (req, res) => {
    // Recebe os dados enviados pelo frontend
    const {
        nome_paciente,
        cpf,
        sexo_paciente,
        data_nascimento_paciente,
        nome_responsavel,
        telefone_paciente,
        observacoes_paciente
    } = req.body;

    // Validação de CPF obrigatório
    if (!cpf || cpf.trim() === '') {
        return res.status(400).json({ sucesso: false, mensagem: "O campo CPF é obrigatório." });
    }

    // Comando SQL para inserir na tabela (o id_paciente é automático)
    const sql = `
        INSERT INTO paciente 
        (nome_paciente, cpf, sexo_paciente, data_nascimento_paciente, nome_responsavel, telefone_paciente, observacoes_paciente) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // Array com os valores na mesma ordem dos pontos de interrogação
    const valores = [
        nome_paciente,
        cpf.trim(),
        sexo_paciente,
        data_nascimento_paciente,
        nome_responsavel,
        telefone_paciente,
        observacoes_paciente
    ];

    db.query(sql, valores, (err, results) => {
        if (err) {
            console.error("Erro ao inserir paciente no banco:", err);
            // Se for erro de duplicidade de CPF (Unique key violation)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ sucesso: false, mensagem: "Já existe um paciente cadastrado com este CPF." });
            }
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao cadastrar paciente." });
        }

        // Se deu tudo certo, devolve uma mensagem de sucesso
        res.json({
            sucesso: true,
            mensagem: "Paciente cadastrado com sucesso!",
            id_inserido: results.insertId
        });
    });
});

// Rota para listar todos os pacientes com filtros dinâmicos
app.get('/api/pacientes', (req, res) => {
    const { cpf, sexo } = req.query;

    let sql = "SELECT * FROM paciente";
    const condicoes = [];
    const valores = [];

    // Filtro por CPF
    if (cpf && cpf.trim() !== '') {
        condicoes.push("cpf = ?");
        valores.push(cpf.trim());
    }

    // Filtro por sexo_paciente (M ou F)
    if (sexo && sexo !== 'todos' && (sexo === 'M' || sexo === 'F')) {
        condicoes.push("sexo_paciente = ?");
        valores.push(sexo);
    }

    if (condicoes.length > 0) {
        sql += " WHERE " + condicoes.join(" AND ");
    }

    sql += " ORDER BY nome_paciente ASC";

    db.query(sql, valores, (err, results) => {
        if (err) {
            console.error("Erro ao buscar pacientes no banco:", err);
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao carregar lista de pacientes." });
        }

        // Devolve o array de pacientes encontrados
        res.json({
            sucesso: true,
            pacientes: results
        });
    });
});

// Rota para buscar um paciente específico por ID
app.get('/api/pacientes/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM paciente WHERE id_paciente = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Erro ao buscar paciente por ID:", err);
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar paciente." });
        }

        if (results.length > 0) {
            res.json({
                sucesso: true,
                paciente: results[0]
            });
        } else {
            res.status(404).json({ sucesso: false, mensagem: "Paciente não encontrado." });
        }
    });
});

// Rota para atualizar os dados de um paciente existente
app.put('/api/pacientes/:id', (req, res) => {
    const { id } = req.params;
    const {
        nome_paciente,
        cpf,
        sexo_paciente,
        data_nascimento_paciente,
        nome_responsavel,
        telefone_paciente,
        observacoes_paciente
    } = req.body;

    // Validação de CPF obrigatório
    if (!cpf || cpf.trim() === '') {
        return res.status(400).json({ sucesso: false, mensagem: "O campo CPF é obrigatório." });
    }

    const sql = `
        UPDATE paciente 
        SET nome_paciente = ?, cpf = ?, sexo_paciente = ?, data_nascimento_paciente = ?, nome_responsavel = ?, telefone_paciente = ?, observacoes_paciente = ? 
        WHERE id_paciente = ?
    `;

    const valores = [
        nome_paciente,
        cpf.trim(),
        sexo_paciente,
        data_nascimento_paciente,
        nome_responsavel,
        telefone_paciente,
        observacoes_paciente,
        id
    ];

    db.query(sql, valores, (err, results) => {
        if (err) {
            console.error("Erro ao atualizar paciente:", err);
            // Se for erro de duplicidade de CPF (Unique key violation)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ sucesso: false, mensagem: "Já existe outro paciente cadastrado com este CPF." });
            }
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar paciente." });
        }

        res.json({
            sucesso: true,
            mensagem: "Paciente atualizado com sucesso!"
        });
    });
});

// Rota para remover um paciente por ID
app.delete('/api/pacientes/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM paciente WHERE id_paciente = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Erro ao remover paciente:", err);
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao remover paciente." });
        }

        res.json({
            sucesso: true,
            mensagem: "Paciente removido com sucesso!"
        });
    });
});

// Rota para salvar uma nova avaliação (relatório)
app.post('/api/relatorios', (req, res) => {
    const {
        usuario_id_relatorio,
        paciente_id_relatorio,
        score_relatorio,
        resultado_relatorio,
        observacoes_relatorio
    } = req.body;

    // Validação de campos obrigatórios
    if (!usuario_id_relatorio || !paciente_id_relatorio || score_relatorio === undefined || !resultado_relatorio) {
        return res.status(400).json({ sucesso: false, mensagem: "Todos os campos obrigatórios (profissional, paciente, score, resultado) devem ser enviados." });
    }

    // Validação estrita do ENUM resultado_relatorio
    if (resultado_relatorio !== 'RECOMENDADO' && resultado_relatorio !== 'NAO_RECOMENDADO') {
        return res.status(400).json({ sucesso: false, mensagem: "O resultado da avaliação deve ser RECOMENDADO ou NAO_RECOMENDADO." });
    }

    const sql = `
        INSERT INTO relatorio 
        (usuario_id_relatorio, paciente_id_relatorio, score_relatorio, resultado_relatorio, observacoes_relatorio) 
        VALUES (?, ?, ?, ?, ?)
    `;

    const valores = [
        usuario_id_relatorio,
        paciente_id_relatorio,
        score_relatorio,
        resultado_relatorio,
        observacoes_relatorio || null
    ];

    db.query(sql, valores, (err, results) => {
        if (err) {
            console.error("Erro ao salvar avaliação no banco:", err);
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao salvar avaliação no banco de dados." });
        }

        res.json({
            sucesso: true,
            mensagem: "Avaliação salva com sucesso!",
            id_relatorio: results.insertId
        });
    });
});

// Rota para buscar todos os relatórios ou filtrados por id_paciente
app.get('/api/relatorios', (req, res) => {
    const { id_paciente } = req.query;

    let sql = `
        SELECT 
            r.id_relatorio,
            r.score_relatorio,
            r.resultado_relatorio,
            r.data_relatorio,
            r.observacoes_relatorio,
            r.paciente_id_relatorio,
            p.nome_paciente,
            u.nome_usuario,
            u.sobrenome_usuario
        FROM relatorio r
        INNER JOIN paciente p ON r.paciente_id_relatorio = p.id_paciente
        INNER JOIN usuario u ON r.usuario_id_relatorio = u.id_usuario
    `;

    const condicoes = [];
    const valores = [];

    // Filtro opcional por paciente
    if (id_paciente && id_paciente.trim() !== '') {
        condicoes.push("r.paciente_id_relatorio = ?");
        valores.push(parseInt(id_paciente));
    }

    if (condicoes.length > 0) {
        sql += " WHERE " + condicoes.join(" AND ");
    }

    // Ordenação do mais recente para o mais antigo
    sql += " ORDER BY r.data_relatorio DESC";

    db.query(sql, valores, (err, results) => {
        if (err) {
            console.error("Erro ao buscar relatórios no banco:", err);
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar relatórios no banco de dados." });
        }

        res.json({
            sucesso: true,
            relatorios: results
        });
    });
});

// Rota de Estatísticas do Dashboard
app.get('/api/dashboard/stats', (req, res) => {
    const qPacientes = "SELECT COUNT(*) AS count FROM paciente";
    const qRelatorios = "SELECT COUNT(*) AS count FROM relatorio";
    const qEncaminhamentos = "SELECT COUNT(*) AS count FROM relatorio WHERE resultado_relatorio = 'RECOMENDADO'";
    const qRecentes = "SELECT COUNT(*) AS count FROM relatorio WHERE data_relatorio >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    const qTabela = `
        SELECT r.score_relatorio, r.resultado_relatorio, r.data_relatorio, p.nome_paciente 
        FROM relatorio r 
        INNER JOIN paciente p ON r.paciente_id_relatorio = p.id_paciente 
        ORDER BY r.data_relatorio DESC 
        LIMIT 5
    `;

    db.query(qPacientes, (err1, r1) => {
        if (err1) {
            console.error("Erro no dashboard (Pacientes):", err1);
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao carregar dados do dashboard." });
        }
        db.query(qRelatorios, (err2, r2) => {
            if (err2) {
                console.error("Erro no dashboard (Relatórios):", err2);
                return res.status(500).json({ sucesso: false, mensagem: "Erro ao carregar dados do dashboard." });
            }
            db.query(qEncaminhamentos, (err3, r3) => {
                if (err3) {
                    console.error("Erro no dashboard (Encaminhamentos):", err3);
                    return res.status(500).json({ sucesso: false, mensagem: "Erro ao carregar dados do dashboard." });
                }
                db.query(qRecentes, (err4, r4) => {
                    if (err4) {
                        console.error("Erro no dashboard (Recentes):", err4);
                        return res.status(500).json({ sucesso: false, mensagem: "Erro ao carregar dados do dashboard." });
                    }
                    db.query(qTabela, (err5, r5) => {
                        if (err5) {
                            console.error("Erro no dashboard (Tabela):", err5);
                            return res.status(500).json({ sucesso: false, mensagem: "Erro ao carregar dados do dashboard." });
                        }

                        res.json({
                            sucesso: true,
                            total_pacientes: r1[0].count,
                            total_relatorios: r2[0].count,
                            total_encaminhamentos: r3[0].count,
                            total_recentes: r4[0].count,
                            recentes: r5
                        });
                    });
                });
            });
        });
    });
});

// Rota para listar profissionais (omitindo senhas por segurança)
app.get('/api/usuarios', (req, res) => {
    const sql = "SELECT id_usuario, nome_usuario, sobrenome_usuario, email, tipo_usuario, data_criacao FROM usuario ORDER BY nome_usuario ASC";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erro ao buscar profissionais:", err);
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar profissionais no banco de dados." });
        }

        res.json({
            sucesso: true,
            usuarios: results
        });
    });
});

// Rota para cadastrar um novo profissional
app.post('/api/usuarios', (req, res) => {
    const { nome_usuario, sobrenome_usuario, email, senha, tipo_usuario } = req.body;

    if (!nome_usuario || !sobrenome_usuario || !email || !senha || !tipo_usuario) {
        return res.status(400).json({ sucesso: false, mensagem: "Todos os campos obrigatórios devem ser preenchidos." });
    }

    const sql = "INSERT INTO usuario (nome_usuario, sobrenome_usuario, email, senha, tipo_usuario) VALUES (?, ?, ?, ?, ?)";
    const valores = [nome_usuario, sobrenome_usuario, email, senha, tipo_usuario];

    db.query(sql, valores, (err, results) => {
        if (err) {
            console.error("Erro ao cadastrar profissional:", err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ sucesso: false, mensagem: "Este e-mail já está cadastrado por outro profissional." });
            }
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao cadastrar profissional no banco de dados." });
        }

        res.json({
            sucesso: true,
            mensagem: "Profissional cadastrado com sucesso!",
            id_usuario: results.insertId
        });
    });
});

// Rota para excluir profissional por ID (Protegendo administrador padrão)
app.delete('/api/usuarios/:id', (req, res) => {
    const { id } = req.params;

    if (parseInt(id) === 1) {
        return res.status(400).json({ sucesso: false, mensagem: "Não é permitido remover o administrador principal do sistema." });
    }

    const sql = "DELETE FROM usuario WHERE id_usuario = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Erro ao remover profissional:", err);
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao excluir profissional do banco de dados." });
        }

        res.json({
            sucesso: true,
            mensagem: "Profissional excluído com sucesso!"
        });
    });
});

// Rota para excluir relatório por ID (Exclusivo do Admin no controle de frontend)
app.delete('/api/relatorios/:id', (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM relatorio WHERE id_relatorio = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Erro ao remover relatório:", err);
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao excluir relatório do banco de dados." });
        }

        res.json({
            sucesso: true,
            mensagem: "Relatório excluído com sucesso!"
        });
    });
});

//servidor iniciado na porta 3000
app.listen(3000, () => {
    console.log('O servidor backend está na porta 3000');
});