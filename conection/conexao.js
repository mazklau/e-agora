const express = require('express');
const mysql = require('mysql2/promise'); // Utilizando a versão promise do mysql2
const bodyParser = require('body-parser');
const cors = require('cors'); // Para permitir requisições de outros domínios

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors()); // Permitir requisições do frontend

// Função para criar a conexão com o banco de dados usando async/await
async function connectDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            port: process.env.DB_PORT,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        console.log('Conexão estabelecida com sucesso!');
        return connection;
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
        throw error;
    }
}

// Rota de login
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    console.log('Dados recebidos para login:', req.body);

    try {
        const connection = await connectDatabase();
        const sql = `SELECT nome, email FROM Cadastros WHERE email = ? AND password = ?`;
        const [results] = await connection.execute(sql, [email, senha]);

        if (results.length > 0) {
            const usuario = results[0];
            res.json({ success: true, user: usuario });
        } else {
            res.status(401).json({ success: false, message: 'Nenhum usuário encontrado com esse email e senha.' });
        }

        await connection.end(); // Fechar a conexão após a consulta
    } catch (err) {
        console.error('Erro ao executar a consulta:', err);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Rota de cadastro
app.post('/register', async (req, res) => {
    const { nome, email, senha, telefone } = req.body;
    console.log('Dados recebidos para registro:', req.body);

    try {
        const connection = await connectDatabase();
        const sql = `INSERT INTO Cadastros (nome, email, password, telefone) VALUES (?, ?, ?, ?)`;
        const [result] = await connection.execute(sql, [nome, email, senha, telefone]);

        res.json({ success: true, message: 'Usuário registrado com sucesso!' });

        await connection.end(); // Fechar a conexão após a inserção
    } catch (err) {
        console.error('Erro ao executar a inserção:', err);
        res.status(500).json({ error: 'Erro ao registrar usuário.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
