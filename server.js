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
    password: 'BACK123', // Cada um deve mudar a senha de acordo com o seu workbench
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
        sexo_paciente, 
        data_nascimento_paciente, 
        nome_responsavel, 
        telefone_paciente, 
        observacoes_paciente 
    } = req.body;

    // Comando SQL para inserir na tabela (o id_paciente é automático)
    const sql = `
        INSERT INTO paciente 
        (nome_paciente, sexo_paciente, data_nascimento_paciente, nome_responsavel, telefone_paciente, observacoes_paciente) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    // Array com os valores na mesma ordem dos pontos de interrogação
    const valores = [
        nome_paciente, 
        sexo_paciente, 
        data_nascimento_paciente, 
        nome_responsavel, 
        telefone_paciente, 
        observacoes_paciente
    ];
    
    db.query(sql, valores, (err, results) => {
        if (err) {
            console.error("Erro ao inserir paciente no banco:", err);
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

// Rota para listar todos os pacientes
app.get('/api/pacientes', (req, res) => {
    // Busca todos os pacientes ordenados pelo nome
    const sql = "SELECT * FROM paciente ORDER BY nome_paciente ASC";
    
    db.query(sql, (err, results) => {
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
//servidor iniciado na porta 3000
app.listen(3000, () => {
    console.log('O servidor backend está na porta 3000');
});