import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(express.json());
app.use(cors());
// Serve os arquivos HTML/CSS/JS do frontend via http://localhost:3000
app.use(express.static('.'));
// Serve a pasta de uploads estaticamente
app.use('/uploads', express.static('./uploads'));

// --- Configuração do Multer (Upload de Fotos) ---
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, 'paciente-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(mime)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de arquivo inválido. Apenas imagens PNG, JPG, JPEG e WEBP são permitidas.'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    }
});


// URL base do frontend usada nos links dos e-mails de recuperação.
// Ajuste para a URL correta ao hospedar em produção.
const FRONTEND_BASE_URL = 'http://localhost:3000';

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

// --- Serviço de E-mail: Nodemailer + Ethereal (ambiente de desenvolvimento) ---
// O Ethereal cria uma caixa de teste descartável na primeira chamada.
// O link para visualizar o e-mail enviado aparece no console do servidor.
let _emailTransporter = null;

async function getEmailTransporter() {
    if (_emailTransporter) return _emailTransporter;
    const testAccount = await nodemailer.createTestAccount();
    _emailTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
    });
    console.log('\n📧 Ethereal Email pronto para testes!');
    console.log('   Conta Ethereal:', testAccount.user);
    console.log('   Acesse os e-mails em: https://ethereal.email\n');
    return _emailTransporter;
}

// --- Rota de Login com Migração Suave para bcrypt ---
// Se a senha no banco for texto puro e bater, permite login e migra para hash.
// Se já for hash, usa bcrypt.compare. Se não bater, nega acesso.
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;

    // Busca pelo e-mail apenas; a verificação da senha ocorre no código, não no SQL
    const sql = "SELECT * FROM usuario WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ sucesso: false, mensagem: "Erro interno do servidor" });
        }

        if (results.length === 0) {
            return res.status(401).json({ sucesso: false, mensagem: "E-mail ou palavra-passe incorretos." });
        }

        const user = results[0];
        const senhaDB = user.senha;

        // Detecta se a senha no banco já é hash bcrypt ($2b$, $2a$, $2y$)
        const jaEhHash = senhaDB.startsWith('$2');
        let senhaValida = false;
        let precisaHashear = false;

        if (jaEhHash) {
            // Senha já hasheada: comparação segura com bcrypt
            senhaValida = await bcrypt.compare(senha, senhaDB);
        } else {
            // Senha ainda em texto puro: comparação direta
            if (senhaDB === senha) {
                senhaValida = true;
                precisaHashear = true; // Será migrada para hash após o login
            }
        }

        if (!senhaValida) {
            return res.status(401).json({ sucesso: false, mensagem: "E-mail ou palavra-passe incorretos." });
        }

        // Login válido! Se a senha ainda era texto puro, migra para hash agora
        if (precisaHashear) {
            const novoHash = await bcrypt.hash(senha, 12);
            db.query(
                "UPDATE usuario SET senha = ? WHERE id_usuario = ?",
                [novoHash, user.id_usuario],
                (errUpdate) => {
                    if (errUpdate) {
                        console.error("Aviso: falha ao migrar hash da senha do usuário", user.id_usuario, errUpdate);
                    } else {
                        console.log(`🔒 Senha de ${user.email} migrada para bcrypt hash automaticamente.`);
                    }
                }
            );
        }

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
    });
});
// Rota para cadastrar novo paciente
app.post('/api/pacientes', (req, res) => {
    upload.single('foto_paciente')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ sucesso: false, mensagem: "A imagem excedeu o limite de tamanho de 2MB." });
            }
            return res.status(400).json({ sucesso: false, mensagem: `Erro de upload: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ sucesso: false, mensagem: err.message });
        }

        const {
            nome_paciente,
            cpf,
            sexo_paciente,
            data_nascimento_paciente,
            nome_responsavel,
            parentesco_responsavel,
            telefone_paciente,
            observacoes_paciente
        } = req.body;

        // Validação de CPF obrigatório
        if (!cpf || cpf.trim() === '') {
            // Se o upload foi feito, mas a validação falhou, deleta o arquivo físico
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ sucesso: false, mensagem: "O campo CPF é obrigatório." });
        }

        // Obtém o caminho da foto, se houver upload
        const foto_paciente = req.file ? `/uploads/${req.file.filename}` : null;

        // Comando SQL para inserir na tabela (o id_paciente é automático)
        const sql = `
            INSERT INTO paciente 
            (nome_paciente, cpf, sexo_paciente, data_nascimento_paciente, nome_responsavel, parentesco_responsavel, telefone_paciente, observacoes_paciente, foto_paciente) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valores = [
            nome_paciente,
            cpf.trim(),
            sexo_paciente,
            data_nascimento_paciente,
            nome_responsavel,
            parentesco_responsavel || null,
            telefone_paciente,
            observacoes_paciente || null,
            foto_paciente
        ];

        db.query(sql, valores, (errQuery, results) => {
            if (errQuery) {
                console.error("Erro ao inserir paciente no banco:", errQuery);
                // Se o upload foi feito, mas o banco falhou, deleta o arquivo físico
                if (req.file && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                if (errQuery.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ sucesso: false, mensagem: "Já existe um paciente cadastrado com este CPF." });
                }
                return res.status(500).json({ sucesso: false, mensagem: "Erro ao cadastrar paciente." });
            }

            res.json({
                sucesso: true,
                mensagem: "Paciente cadastrado com sucesso!",
                id_inserido: results.insertId
            });
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

    upload.single('foto_paciente')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ sucesso: false, mensagem: "A imagem excedeu o limite de tamanho de 2MB." });
            }
            return res.status(400).json({ sucesso: false, mensagem: `Erro de upload: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ sucesso: false, mensagem: err.message });
        }

        const {
            nome_paciente,
            cpf,
            sexo_paciente,
            data_nascimento_paciente,
            nome_responsavel,
            parentesco_responsavel,
            telefone_paciente,
            observacoes_paciente
        } = req.body;

        // Validação de CPF obrigatório
        if (!cpf || cpf.trim() === '') {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ sucesso: false, mensagem: "O campo CPF é obrigatório." });
        }

        const fotoAlterada = req.file !== undefined || req.body.foto_paciente === 'null' || req.body.foto_paciente === '';
        let sql = '';
        let valores = [];

        if (fotoAlterada) {
            const foto_paciente = req.file ? `/uploads/${req.file.filename}` : null;
            sql = `
                UPDATE paciente 
                SET nome_paciente = ?, cpf = ?, sexo_paciente = ?, data_nascimento_paciente = ?, nome_responsavel = ?, parentesco_responsavel = ?, telefone_paciente = ?, observacoes_paciente = ?, foto_paciente = ? 
                WHERE id_paciente = ?
            `;
            valores = [
                nome_paciente,
                cpf.trim(),
                sexo_paciente,
                data_nascimento_paciente,
                nome_responsavel,
                parentesco_responsavel || null,
                telefone_paciente,
                observacoes_paciente || null,
                foto_paciente,
                id
            ];
        } else {
            sql = `
                UPDATE paciente 
                SET nome_paciente = ?, cpf = ?, sexo_paciente = ?, data_nascimento_paciente = ?, nome_responsavel = ?, parentesco_responsavel = ?, telefone_paciente = ?, observacoes_paciente = ? 
                WHERE id_paciente = ?
            `;
            valores = [
                nome_paciente,
                cpf.trim(),
                sexo_paciente,
                data_nascimento_paciente,
                nome_responsavel,
                parentesco_responsavel || null,
                telefone_paciente,
                observacoes_paciente || null,
                id
            ];
        }

        db.query(sql, valores, (errQuery, results) => {
            if (errQuery) {
                console.error("Erro ao atualizar paciente:", errQuery);
                if (req.file && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                if (errQuery.code === 'ER_DUP_ENTRY') {
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

// ============================================================
// ROTAS DE RECUPERAÇÃO E REDEFINIÇÃO DE SENHA
// ============================================================

// Solicita recuperação de senha
// Responde SEMPRE com mensagem genérica para não revelar se o e-mail existe.
app.post('/api/recuperar-senha', (req, res) => {
    const { email } = req.body;
    const MENSAGEM_GENERICA = "Se o e-mail estiver cadastrado, enviaremos as instruções.";

    // Responde imediatamente com mensagem genérica (evita enumeração de e-mails por tempo)
    res.json({ sucesso: true, mensagem: MENSAGEM_GENERICA });

    if (!email || !email.includes('@')) return;

    db.query(
        "SELECT id_usuario, nome_usuario FROM usuario WHERE email = ?",
        [email],
        async (err, results) => {
            if (err) { console.error("Erro ao buscar usuário para recuperação:", err); return; }
            if (results.length === 0) return; // E-mail não cadastrado: ação silenciosa

            const user = results[0];

            // Token criptograficamente seguro de 32 bytes (64 caracteres hex)
            const token = crypto.randomBytes(32).toString('hex');
            const expiracao = new Date(Date.now() + 60 * 60 * 1000); // Expira em 1 hora
            const expiracaoSQL = expiracao.toISOString().slice(0, 19).replace('T', ' ');

            db.query(
                "UPDATE usuario SET token_recuperacao = ?, token_expiracao = ? WHERE id_usuario = ?",
                [token, expiracaoSQL, user.id_usuario],
                async (errUpdate) => {
                    if (errUpdate) { console.error("Erro ao salvar token de recuperação:", errUpdate); return; }

                    const linkRedefinicao = `${FRONTEND_BASE_URL}/pages/cadastro/redefinir_senha.html?token=${token}`;
                    console.log(`\n🔑 Token de recuperação gerado para: ${email}`);
                    console.log(`🔗 Link de redefinição: ${linkRedefinicao}\n`);

                    const htmlEmail = `
<!DOCTYPE html>
<html lang="pt-br">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 20px; margin: 0;">
  <div style="max-width: 580px; margin: 0 auto;">
    <div style="background: #1e293b; padding: 28px 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 600;">🏥 Sistema de Triagem Clínica</h1>
    </div>
    <div style="background: white; padding: 36px 30px; border: 1px solid #e2e8f0; border-top: none;">
      <h2 style="color: #1e293b; margin-top: 0;">Redefinição de Senha</h2>
      <p style="color: #475569;">Olá, <strong>${user.nome_usuario}</strong>!</p>
      <p style="color: #475569;">Recebemos uma solicitação para redefinir a senha da sua conta no Sistema de Triagem Clínica.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${linkRedefinicao}"
           style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">
          Redefinir Minha Senha
        </a>
      </div>
      <p style="color: #64748b; font-size: 14px;">⏰ Este link expira em <strong>1 hora</strong>.</p>
      <p style="color: #64748b; font-size: 14px;">Se você não solicitou esta redefinição, pode ignorar este e-mail com segurança.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        Ou copie este link no navegador:<br>
        <span style="color: #2563eb; word-break: break-all;">${linkRedefinicao}</span>
      </p>
    </div>
    <div style="background: #f1f5f9; padding: 14px; text-align: center; border-radius: 0 0 12px 12px;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">Sistema de Triagem Clínica — X-Frágil &nbsp;|&nbsp; E-mail automático, não responda.</p>
    </div>
  </div>
</body>
</html>`;

                    try {
                        const transporter = await getEmailTransporter();
                        const info = await transporter.sendMail({
                            from: '"Sistema de Triagem Clínica" <noreply@triagem.com>',
                            to: email,
                            subject: 'Recuperação de Senha — Sistema de Triagem Clínica',
                            html: htmlEmail
                        });
                        console.log('✅ E-mail de recuperação enviado!');
                        console.log('📧 Visualize o e-mail aqui:', nodemailer.getTestMessageUrl(info));
                    } catch (errEmail) {
                        console.error("Erro ao enviar e-mail de recuperação:", errEmail);
                    }
                }
            );
        }
    );
});

// Valida se o token de redefinição ainda é válido (não expirou e existe no banco)
app.get('/api/validar-token', (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ valido: false, mensagem: "Token não informado." });
    }

    // Consulta preparada: busca o token e verifica expiração no banco
    db.query(
        "SELECT id_usuario FROM usuario WHERE token_recuperacao = ? AND token_expiracao > NOW()",
        [token],
        (err, results) => {
            if (err) {
                console.error("Erro ao validar token:", err);
                return res.status(500).json({ valido: false, mensagem: "Erro ao validar o link." });
            }
            if (results.length === 0) {
                return res.json({ valido: false, mensagem: "Link inválido ou expirado. Solicite uma nova recuperação." });
            }
            res.json({ valido: true });
        }
    );
});

// Conclui a redefinição de senha usando o token
app.post('/api/redefinir-senha', async (req, res) => {
    const { token, senha } = req.body;

    if (!token || !senha || senha.length < 6) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Token e senha (mínimo 6 caracteres) são obrigatórios."
        });
    }

    // Busca o usuário pelo token ainda válido (consulta preparada)
    db.query(
        "SELECT id_usuario FROM usuario WHERE token_recuperacao = ? AND token_expiracao > NOW()",
        [token],
        async (err, results) => {
            if (err) {
                console.error("Erro ao buscar token para redefinição:", err);
                return res.status(500).json({ sucesso: false, mensagem: "Erro interno do servidor." });
            }
            if (results.length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Link inválido ou expirado. Solicite uma nova recuperação de senha."
                });
            }

            const { id_usuario } = results[0];

            try {
                // Gera o hash da nova senha com custo 12
                const novoHash = await bcrypt.hash(senha, 12);

                // Atualiza a senha e invalida o token atomicamente em uma única query.
                // A condição 'AND token_recuperacao = ?' previne race condition:
                // se o token for consumido entre o SELECT e este UPDATE, affectedRows será 0.
                db.query(
                    "UPDATE usuario SET senha = ?, token_recuperacao = NULL, token_expiracao = NULL WHERE id_usuario = ? AND token_recuperacao = ?",
                    [novoHash, id_usuario, token],
                    (errUpdate, resultado) => {
                        if (errUpdate) {
                            console.error("Erro ao atualizar senha:", errUpdate);
                            return res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar a senha." });
                        }
                        if (resultado.affectedRows === 0) {
                            // Token foi consumido entre o SELECT e o UPDATE (race condition)
                            return res.status(400).json({
                                sucesso: false,
                                mensagem: "Link inválido ou expirado. Solicite uma nova recuperação de senha."
                            });
                        }
                        console.log(`✅ Senha do usuário ID ${id_usuario} redefinida com sucesso via token.`);
                        res.json({
                            sucesso: true,
                            mensagem: "Senha redefinida com sucesso! Você já pode fazer login com a nova senha."
                        });
                    }
                );
            } catch (errHash) {
                console.error("Erro ao gerar hash da senha:", errHash);
                return res.status(500).json({ sucesso: false, mensagem: "Erro interno ao processar a senha." });
            }
        }
    );
});

//servidor iniciado na porta 3000
app.listen(3000, () => {
    console.log('O servidor backend está na porta 3000');
});