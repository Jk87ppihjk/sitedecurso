// auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('./db');
const { sendEmail } = require('./emailService');
const router = express.Router();
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para verificar se o usuário é ADM
const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Acesso negado. Requer privilégios de Administrador.' });
    }
};

// Middleware para proteger rotas (verificar JWT)
const protect = (req, res, next) => {
    let token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Não autorizado, token não fornecido ou inválido.' });
    }

    try {
        token = token.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};

// Rota de Cadastro de Usuário (Aluno)
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Preencha todos os campos.' });
    }

    try {
        const [existingUser] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email já cadastrado.' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        await pool.execute('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, password_hash]);

        // Envia email de boas-vindas
        await sendEmail({
            toEmail: email,
            subject: 'Bem-vindo(a) à Plataforma de Cursos!',
            htmlContent: `<p>Olá ${name},</p><p>Seu cadastro foi realizado com sucesso!</p><p>Comece a explorar nossos cursos hoje mesmo.</p>`
        });

        res.status(201).json({ message: 'Usuário cadastrado com sucesso. Verifique seu email!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro interno ao cadastrar usuário.' });
    }
});

// Rota de Login de Usuário (Aluno e ADM)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await pool.execute('SELECT id, email, password_hash, name, is_admin FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, isAdmin: user.is_admin, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' } // Token válido por 7 dias
        );

        res.json({
            message: 'Login realizado com sucesso',
            token,
            user: { id: user.id, email: user.email, name: user.name, isAdmin: user.is_admin }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro interno ao tentar login.' });
    }
});


module.exports = { router, protect, isAdmin };
