// server.js
const express = require('express');
require('dotenv').config(); // Carrega as variáveis do .env
const userRoutes = require('./userRoutes');

const { setupDatabase } = require('./db');
const { router: authRouter } = require('./auth');
const adminRouter = require('./admin');

const app = express();

// Middlewares
app.use(express.json()); // Habilita o parsing de JSON no corpo da requisição

// --- Rotas ---
app.use('/api/auth', authRouter); // Rotas de Login e Cadastro
app.use('/api/admin', adminRouter); // Rotas Protegidas do Painel ADM (Cursos, Módulos)

// Rota de Teste
app.get('/', (req, res) => {
    res.send('API da Plataforma de Cursos Online está no ar!');
});
// ----------------

// Inicialização do Servidor
async function startServer() {
    // 1. Configura e verifica o banco de dados
    await setupDatabase();

    // 2. Log de Confirmação das Variáveis de Ambiente
    console.log("====================================================");
    console.log("-> ✅ Variáveis de Ambiente Iniciadas Corretamente:");
    console.log(`- BREVO_API_KEY: ${process.env.BREVO_API_KEY ? 'OK' : 'FALHA'}`);
    console.log(`- CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? 'OK' : 'FALHA'}`);
    console.log(`- DB_HOST: ${process.env.DB_HOST ? 'OK' : 'FALHA'}`);
    console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? 'OK' : 'FALHA'}`);
    console.log(`- PORT: ${process.env.PORT}`);
    console.log("====================================================");


    // 3. Inicia o servidor Express
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`-> 🚀 Servidor rodando em http://localhost:${PORT}`);
    });
}

startServer();
