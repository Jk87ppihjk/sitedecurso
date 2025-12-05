// server.js
const express = require('express');
const cors = require('cors'); // Importa o middleware CORS
require('dotenv').config(); // Carrega as variáveis do .env

// Importa as configurações e middlewares
const { setupDatabase } = require('./db');
const { router: authRouter } = require('./auth');
const adminRouter = require('./admin');
const userRoutes = require('./userRoutes'); 

const app = express();

// Middlewares
// ----------------------------------------------------
// ⚠️ RESOLUÇÃO DO PROBLEMA DE CORS:
// Permite que QUALQUER origem (dominio) acesse a API.
app.use(cors()); 
// ----------------------------------------------------

app.use(express.json()); // Habilita o parsing de JSON no corpo da requisição

// --- Rotas ---
app.use('/api/auth', authRouter);     // Rotas de Login e Cadastro
app.use('/api/admin', adminRouter);   // Rotas Protegidas do Painel ADM
app.use('/api/users', userRoutes);    // Rotas do Aluno (ex: Meus Cursos)

// Rota de Teste para verificar se o servidor está ativo
app.get('/', (req, res) => {
    res.send('API da Plataforma de Cursos Online está no ar e funcionando!');
});
// ----------------

// Inicialização do Servidor
async function startServer() {
    // 1. Configura e verifica o banco de dados
    try {
        await setupDatabase();
    } catch (error) {
        console.error("ERRO CRÍTICO: Falha na configuração inicial do banco de dados.", error);
        return; 
    }
    
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
