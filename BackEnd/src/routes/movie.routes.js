const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movie.controller');
const incrementViewCount = require('../middlewares/incrementViewCount.middleware');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// Lấy danh sách và filter (phải để trước các route có params)
router.get('/', movieController.getAllMovies);
router.get('/search', movieController.searchMovies);
router.get('/top', movieController.getTopMovies);
router.get('/random', movieController.getRandomMovies);
router.get('/type/:type', movieController.getMoviesByType);
router.get('/top-view/:type', movieController.getTopViewByType);

// CRUD operations (admin only)
router.post('/', authenticate, requireAdmin, movieController.createMovie);
router.put('/:id', authenticate, requireAdmin, movieController.updateMovie);
router.delete('/:id', authenticate, requireAdmin, movieController.deleteMovie);

// Increment view count
router.put('/:movieId/increment-view', movieController.incrementViewCount);

// Get movie by ID (phải để cuối cùng vì có params)
router.get('/:id', incrementViewCount, movieController.getMovieById);

module.exports = router;