const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors'); // Para permitir requisições de outros domínios

const app = express();
const port = "3000";

app.use(bodyParser.json());
app.use(cors()); // Permitir requisições do frontend

const conexao = mysql.createConnection({
    host: "autorack.proxy.rlwy.net",
    user: "root",
    port: "45268",
    password: "XzlrPHlhHzUToVIxdpaftvLculTfJrAi",
    database: "railway"
});

conexao.connect((error) => {
    if (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
        return;
    }
    console.log('Conexão estabelecida com sucesso!');
});

// Rota de login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const sql = `SELECT nome, email FROM Cadastros WHERE email = ? AND password = ?`;

    conexao.query(sql, [email, senha], (err, results) => {
        if (err) {
            console.error('Erro ao executar a consulta:', err);
            return res.status(500).json({ error: 'Erro no servidor' });
        }

        if (results.length > 0) {
            // Enviar os dados do usuário no response
            const usuario = results[0];
            res.json({ success: true, user: usuario });
        } else {
            res.status(401).json({ success: false, message: 'Nenhum usuário encontrado com esse email e senha.' });
        }
    });
});

// Rota de cadastro
app.post('/register', (req, res) => {
    const { nome, email, senha, telefone } = req.body;
    const sql = `INSERT INTO Cadastros (nome, email, password, telefone) VALUES (?, ?, ?, ?)`;

    conexao.query(sql, [nome, email, senha, telefone], (err, result) => {
        if (err) {
            console.error('Erro ao executar a inserção:', err);
            return res.status(500).json({ error: 'Erro ao registrar usuário.' });
        }

        res.json({ success: true, message: 'Usuário registrado com sucesso!' });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});