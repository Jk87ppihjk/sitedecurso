// admin.js
const express = require('express');
const { pool } = require('./db');
const { protect, isAdmin } = require('./auth');
const cloudinary = require('./cloudinary');
const multer = require('multer'); // Para processar o upload de arquivos
const router = express.Router();

// Configuração do Multer (Armazenamento em memória para enviar ao Cloudinary)
const upload = multer({ storage: multer.memoryStorage() });

// Rota ADM: Criar novo curso
// Usa 'upload.single('coverImage')' para esperar o arquivo de imagem
router.post('/courses', protect, isAdmin, upload.single('coverImage'), async (req, res) => {
    const { title, description, price, isSubscription, validUntil, isLifetime } = req.body;

    if (!title || !description || !price || isSubscription === undefined) {
        return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
    }

    try {
        let coverImageUrl = null;
        
        // 1. Upload da imagem de capa para o Cloudinary
        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: "course_covers", // Pasta no Cloudinary
                resource_type: "image"
            });
            coverImageUrl = result.secure_url;
            console.log(`-> 🖼️ Imagem de capa enviada: ${coverImageUrl}`);
        }

        // 2. Inserir o curso no MySQL
        const isSub = isSubscription === 'true'; // Conversão de string p/ booleano
        const isLife = isLifetime === 'true';

        await pool.execute(
            'INSERT INTO courses (title, description, price, cover_image_url, is_subscription, valid_until, is_lifetime) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description, price, coverImageUrl, isSub, isLife ? null : validUntil, isLife]
        );

        res.status(201).json({ message: 'Curso criado com sucesso!', coverImageUrl });
    } catch (error) {
        console.error('Erro ao criar curso:', error);
        res.status(500).json({ message: 'Erro interno ao processar a criação do curso.' });
    }
});

// * [Outras Rotas ADM Necessárias]
// * GET /admin/courses - Listar todos os cursos
// * PUT /admin/courses/:id - Editar curso
// * DELETE /admin/courses/:id - Excluir curso
// * POST /admin/modules - Criar módulo em um curso
// * POST /admin/lessons - Criar aula em um módulo

module.exports = router;
