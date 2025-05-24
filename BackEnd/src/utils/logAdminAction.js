const AdminLog = require('../models/adminlog.model');

const logAdminAction = async (adminId, action) => {
  try {
    console.log('Ghi log admin thành công:', adminId, action);

    await AdminLog.create({ adminId, action });
    
  } catch (err) {
    console.error('Ghi log admin thất bại:', err.message);
  }
};

module.exports = logAdminAction;
