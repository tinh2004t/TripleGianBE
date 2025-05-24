const express = require('express');
const router = express.Router();
const AdminLog = require('../models/adminlog.model');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');


// Lấy tất cả log, sắp xếp theo thời gian gần nhất
router.get('/', async (req, res) => {
  try {
    const logs = await AdminLog.find()
      .sort({ createdAt: -1 })
      .populate('adminId', 'username email');

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}, authenticate, requireAdmin);

module.exports = router;
