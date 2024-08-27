const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const NodeCache = require('node-cache');
const Joi = require('joi');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Configurações de middlewares
app.use(bodyParser.json());
app.use(cors());

// Configuração do cache
const cache = new NodeCache({ stdTTL: 600 });

// Configuração do Sequelize para MySQL
const sequelize = new Sequelize('railway', 'root', 'XzlrPHlhHzUToVIxdpaftvLculTfJrAi', {
    host: 'autorack.proxy.rlwy.net',
    port: 45268,
    dialect: 'mysql',
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Modelo de Usuário
const User = sequelize.define('User', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefone: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'Cadastros',
    timestamps: false
});

// Teste de conexão com o banco de dados
sequelize.authenticate()
    .then(() => console.log('Conexão com o banco de dados estabelecida com sucesso!'))
    .catch(err => console.error('Erro ao conectar ao banco de dados:', err));

// Sincronização do modelo (somente para desenvolvimento, evite usar 'force: true' em produção)
sequelize.sync({ force: false });

// Validação de entrada com Joi
const userSchema = Joi.object({
    nome: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    senha: Joi.string().min(6).required(),
    telefone: Joi.string().pattern(/^\d+$/).required()
});

// Função para gerar tokens JWT
const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, 'segredo_super_secreto', { expiresIn: '1h' });
};

// Rota de cadastro
app.post('/api/register', async (req, res) => {
    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { nome, email, senha, telefone } = req.body;

    try {
        // Criptografando a senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Criando o usuário
        const newUser = await User.create({
            nome,
            email,
            password: hashedPassword,
            telefone
        });

        res.json({ success: true, message: 'Usuário registrado com sucesso!' });
    } catch (err) {
        console.error('Erro ao registrar usuário:', err);
        res.status(500).json({ error: 'Erro ao registrar usuário.' });
    }
});

// Rota de login
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;

    const cachedUser = cache.get(email);
    if (cachedUser) {
        return res.json({ success: true, token: generateToken(cachedUser), user: cachedUser });
    }

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Usuário não encontrado.' });
        }

        const match = await bcrypt.compare(senha, user.password);

        if (!match) {
            return res.status(401).json({ success: false, message: 'Senha incorreta.' });
        }

        cache.set(email, user);

        const token = generateToken(user);
        res.json({ success: true, token, user });
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Middleware de verificação de token JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ success: false, message: 'Nenhum token fornecido.' });
    }

    jwt.verify(token, 'segredo_super_secreto', (err, decoded) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Falha ao autenticar token.' });
        }

        req.userId = decoded.id;
        next();
    });
};

// Rota de perfil (protegida)
app.get('/api/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, { attributes: ['nome', 'email', 'telefone'] });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }

        res.json({ success: true, user });
    } catch (err) {
        console.error('Erro ao buscar perfil do usuário:', err);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Exporta o aplicativo Express para o Vercel
module.exports = app;
