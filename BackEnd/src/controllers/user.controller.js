const User = require('../models/user.model');
const Movie = require('../models/movie.model');
const logAdminAction = require('../utils/logAdminAction');


// Lấy thông tin người dùng
exports.getMe = async (req, res) => {
    console.log('User from token:', req.user);
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Thêm phim yêu thích
exports.addFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user.favorites.includes(movieId)) {
      user.favorites.push(movieId);
      await user.save();
    }
    res.json({ message: 'Đã thêm vào yêu thích' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy danh sách yêu thích
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('favorites');
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Ghi lịch sử xem
exports.addHistory = async (req, res) => {
  try {
    const { movieId, episodeId } = req.body;

    const user = await User.findById(req.user.userId);

    // Kiểm tra nếu đã có lịch sử cho phim này thì cập nhật tập mới
    const existing = user.history.find(
      (item) => item.movie.toString() === movieId
    );

    if (existing) {
      existing.episode = episodeId;
      existing.updatedAt = new Date();
    } else {
      user.history.push({ movie: movieId, episode: episodeId });
    }

    await user.save();

    res.json({ message: 'Đã cập nhật lịch sử xem' });
  } catch (err) {
    console.error('Lỗi addHistory:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};


exports.removeFavorite = async (req, res) => {
  try {
    const { movieId } = req.params;  // Lấy movieId từ params, không phải body
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    user.favorites = user.favorites.filter(
      (favId) => favId.toString() !== movieId
    );
    await user.save();
    res.json({ message: 'Đã xóa khỏi yêu thích' });
  } catch (err) {
    console.error('Lỗi removeFavorite:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};


// Lấy lịch sử xem
exports.getHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('history.movie')
      .populate('history.episode'); // populate thêm episode

    res.json(user.history);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (err) {
    console.error('Lỗi getAllUsers:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Sửa thông tin người dùng
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select('-passwordHash');
    await logAdminAction(req.user.userId, `Sửa thông tin người dùng ${updatedUser.username}`);

    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error('Lỗi updateUser:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deleted = await User.findByIdAndDelete(userId);


    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    await logAdminAction(req.user.userId, `Xóa người dùng ${deleted.username}`);
    res.json({ message: 'Đã xóa người dùng' });
  } catch (err) {
    console.error('Lỗi deleteUser:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

