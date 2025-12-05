// userRoutes.js
const express = require('express');
const { pool } = require('./db');
const { protect } = require('./auth'); // Importa o middleware de proteção JWT
const router = express.Router();

/**
 * @route GET /api/users/meus-cursos
 * @description Rota protegida para listar todos os cursos que o usuário logado comprou.
 * @access Private (Requer JWT)
 */
router.get('/meus-cursos', protect, async (req, res) => {
    // O ID do usuário logado é extraído do token JWT pelo middleware 'protect'
    const userId = req.user.id; 

    try {
        const query = `
            SELECT 
                c.id, 
                c.title, 
                c.description, 
                c.cover_image_url,
                e.purchase_date,
                e.expiry_date
            FROM 
                enrollments e
            JOIN 
                courses c ON e.course_id = c.id
            WHERE 
                e.user_id = ?;
        `;
        
        const [courses] = await pool.execute(query, [userId]);

        if (courses.length === 0) {
            return res.status(200).json({ 
                message: 'Você ainda não possui nenhum curso.', 
                courses: [] 
            });
        }

        res.json({
            message: `Cursos encontrados para o usuário ${req.user.email}`,
            courses
        });

    } catch (error) {
        console.error('Erro ao buscar cursos do usuário:', error);
        res.status(500).json({ message: 'Erro interno ao buscar seus cursos.' });
    }
});


module.exports = router;
