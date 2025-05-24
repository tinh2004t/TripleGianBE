const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

router.get('/me', authenticate, userController.getMe);
router.post('/me/favorites', authenticate, userController.addFavorite);
router.get('/me/favorites', authenticate, userController.getFavorites);
router.delete('/me/favorites/:movieId', authenticate, userController.removeFavorite);
router.post('/me/history', authenticate, userController.addHistory);
router.get('/me/history', authenticate, userController.getHistory);

// Các route cho admin quản lý người dùng
router.get('/', authenticate, requireAdmin, userController.getAllUsers); // Yêu cầu quyền admin nếu cần
router.put('/:userId', authenticate, requireAdmin, userController.updateUser);
router.delete('/:userId', authenticate, requireAdmin, userController.deleteUser);


module.exports = router;
