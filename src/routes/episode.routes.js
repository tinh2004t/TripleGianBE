const express = require('express');
const router = express.Router();
const episodeController = require('../controllers/episode.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// Lấy danh sách tập theo movieId (public)
router.get('/movies/:movieId/episodes', episodeController.getEpisodesByMovie);

// Lấy 1 tập cụ thể (public)
router.get('/episodes/:id', episodeController.getEpisodeById);

// Lấy tập theo movieId và episodeId (public)
router.get('/movies/:movieId/episodes/:episodeId', episodeController.getEpisodeByMovieAndEpisodeId);

// Thêm tập phim (chỉ admin)
router.post('/movies/:movieId/episodes', authenticate, requireAdmin, episodeController.createEpisode);

// Cập nhật tập phim (chỉ admin)
router.put('/episodes/:id', authenticate, requireAdmin, episodeController.updateEpisode);

// Xóa tập phim (chỉ admin)
router.delete('/episodes/:id', authenticate, requireAdmin, episodeController.deleteEpisode);

module.exports = router;