const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genre.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', genreController.getAllGenres);
router.get('/:id', genreController.getGenreById);

// Admin only routes
router.post('/', authenticate, requireAdmin, genreController.createGenre);
router.put('/:id', authenticate, requireAdmin, genreController.updateGenre);
router.delete('/:id', authenticate, requireAdmin, genreController.deleteGenre);

module.exports = router;