const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Thêm bình luận
router.post('/', authenticate, commentController.createComment);

// Lấy danh sách bình luận theo movieId (và tùy chọn episodeId)
router.get('/', commentController.getComments);

// Xóa bình luận (user hoặc admin)
router.delete('/:id', authenticate, commentController.deleteComment);

module.exports = router;
