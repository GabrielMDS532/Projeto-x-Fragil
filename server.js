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

//servidor iniciado na porta 3000
app.listen(3000, () => {
    console.log('O servidor backend está na porta 3000');
});