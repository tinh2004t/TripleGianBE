const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// GET - Lấy danh sách thông báo của user
router.get('/', authenticate, notificationController.getUserNotifications);

// PATCH - Đánh dấu 1 thông báo đã đọc
router.patch('/:id/read', authenticate, notificationController.markAsRead);

// PATCH - Đánh dấu tất cả thông báo đã đọc
router.patch('/mark-all-read', authenticate, notificationController.markAllAsRead);

// DELETE - Xóa 1 thông báo
router.delete('/:id', authenticate, notificationController.deleteNotification);

// DELETE - Xóa tất cả thông báo
router.delete('/', authenticate, notificationController.deleteAllNotifications);

module.exports = router;