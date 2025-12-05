// db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Funcao para criar as tabelas necessarias no banco de dados (se nao existirem)
async function setupDatabase() {
    console.log("-> 🔄 Tentando configurar o banco de dados...");
    const connection = await pool.getConnection();
    try {
        // Tabela de Usuarios (Alunos e ADM)
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                is_admin BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        // Tabela de Cursos
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS courses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                cover_image_url VARCHAR(255),
                price DECIMAL(10, 2) NOT NULL,
                is_subscription BOOLEAN NOT NULL,
                valid_until DATE,
                is_lifetime BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        // Tabela de Modulos
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS modules (
                id INT AUTO_INCREMENT PRIMARY KEY,
                course_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            );
        `);
        // Tabela de Aulas
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS lessons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                module_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                video_link VARCHAR(255), -- Link do video hospedado (ex: Cloudinary, YouTube)
                FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
            );
        `);
        // Tabela de Compras/Inscrições
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS enrollments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                course_id INT NOT NULL,
                purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expiry_date DATE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                UNIQUE KEY (user_id, course_id)
            );
        `);

        // Cria o usuário ADM inicial se não existir
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE email = ? AND is_admin = 1', ['admin@sitedocurso.com']);
        if (rows[0].count === 0) {
            const adminPassword = 'adminpassword'; // MUDAR EM PRODUÇÃO!
            const bcrypt = require('bcryptjs');
            const password_hash = await bcrypt.hash(adminPassword, 10);
            
            await connection.execute(
                'INSERT INTO users (email, password_hash, name, is_admin) VALUES (?, ?, ?, ?)',
                ['admin@sitedocurso.com', password_hash, 'Administrador', true]
            );
            console.log("-> ✅ Usuário ADM inicial criado: email: admin@sitedocurso.com, senha: adminpassword");
        }

        console.log("-> ✅ Configuração do banco de dados concluída com sucesso.");
    } catch (error) {
        console.error("-> ❌ Erro ao configurar o banco de dados:", error.message);
    } finally {
        connection.release();
    }
}

module.exports = { pool, setupDatabase };
