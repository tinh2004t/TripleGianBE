const Notification = require('../models/notification.model');
const { ObjectId } = require('mongoose').Types;

// GET - Lấy danh sách thông báo của user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('=== GET USER NOTIFICATIONS ===');
    console.log('User ID:', userId);
    
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('movie', 'title posterUrl')
      .populate('episode', 'title episodeNumber')
      .lean(); // Use lean() for better performance

    console.log(`Found ${notifications.length} notifications for user ${userId}`);
    
    // Add formatted data
    const formattedNotifications = notifications.map(notification => ({
      ...notification,
      id: notification._id, // Add id field for compatibility
      createdAt: notification.createdAt || new Date(),
      updatedAt: notification.updatedAt || new Date()
    }));

    res.json(formattedNotifications);
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({ message: 'Lấy thông báo thất bại', error: error.message });
  }
};

// PATCH - Đánh dấu thông báo đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notificationId = req.params.id;

    console.log('=== MARK AS READ ===');
    console.log('User ID:', userId);
    console.log('Notification ID:', notificationId);
    console.log('Notification ID type:', typeof notificationId);
    
    // Validate ObjectId format
    if (!ObjectId.isValid(notificationId)) {
      console.log('❌ Invalid ObjectId format');
      return res.status(400).json({ 
        message: 'ID thông báo không hợp lệ',
        received: notificationId
      });
    }

    // Find and update notification
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: notificationId, 
        user: userId 
      },
      { 
        isRead: true, 
        updatedAt: new Date() 
      },
      { 
        new: true 
      }
    );

    if (!notification) {
      console.log('❌ Notification not found or does not belong to user');
      return res.status(404).json({ 
        message: 'Không tìm thấy thông báo hoặc thông báo không thuộc về bạn' 
      });
    }

    console.log('✅ Successfully marked notification as read');
    console.log('Updated notification isRead:', notification.isRead);

    res.json({ 
      message: 'Đã đánh dấu là đã đọc', 
      success: true,
      notification: {
        _id: notification._id,
        id: notification._id,
        isRead: notification.isRead,
        message: notification.message,
        updatedAt: notification.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Mark notification as read error:', error);
    res.status(500).json({ 
      message: 'Cập nhật thông báo thất bại',
      error: error.message 
    });
  }
};

// PATCH - Đánh dấu tất cả thông báo đã đọc
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('=== MARK ALL AS READ ===');
    console.log('User ID:', userId);

    const result = await Notification.updateMany(
      { 
        user: userId, 
        isRead: false 
      },
      { 
        isRead: true, 
        updatedAt: new Date() 
      }
    );

    console.log(`✅ Marked ${result.modifiedCount} notifications as read`);

    res.json({ 
      message: `Đã đánh dấu ${result.modifiedCount} thông báo đã đọc`,
      success: true,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ Mark all notifications as read error:', error);
    res.status(500).json({ 
      message: 'Cập nhật thông báo thất bại',
      error: error.message 
    });
  }
};

// DELETE - Xóa thông báo
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notificationId = req.params.id;

    console.log('=== DELETE NOTIFICATION ===');
    console.log('User ID:', userId);
    console.log('Notification ID:', notificationId);

    // Validate ObjectId format
    if (!ObjectId.isValid(notificationId)) {
      console.log('❌ Invalid ObjectId format');
      return res.status(400).json({ 
        message: 'ID thông báo không hợp lệ',
        received: notificationId
      });
    }

    // Delete notification only if it belongs to the user
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      console.log('❌ Notification not found or does not belong to user');
      return res.status(404).json({ message: 'Không tìm thấy thông báo để xóa' });
    }

    console.log('✅ Successfully deleted notification');
    res.json({ 
      message: 'Đã xóa thông báo thành công',
      success: true
    });
  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({ 
      message: 'Xóa thông báo thất bại',
      error: error.message 
    });
  }
};

// DELETE - Xóa tất cả thông báo
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('=== DELETE ALL NOTIFICATIONS ===');
    console.log('User ID:', userId);

    const result = await Notification.deleteMany({ user: userId });

    console.log(`✅ Deleted ${result.deletedCount} notifications`);

    res.json({ 
      message: `Đã xóa ${result.deletedCount} thông báo`,
      success: true,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Delete all notifications error:', error);
    res.status(500).json({ 
      message: 'Xóa thông báo thất bại',
      error: error.message 
    });
  }
};