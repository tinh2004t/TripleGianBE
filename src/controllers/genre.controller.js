const Genre = require('../models/genre.model');
const logAdminAction = require('../utils/logAdminAction');

// GET /api/genres
exports.getAllGenres = async (req, res) => {
  try {
    const genres = await Genre.find({}).sort({ name: 1 });
    res.json({
      success: true,
      data: genres
    });
  } catch (err) {
    console.error('Error fetching genres:', err);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách thể loại' });
  }
};

// GET /api/genres/:id
exports.getGenreById = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (!genre) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }
    res.json(genre);
  } catch (err) {
    console.error('Error fetching genre:', err);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin thể loại' });
  }
};

// POST /api/genres
exports.createGenre = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Tên thể loại không được để trống' });
    }

    // Check if genre already exists
    const existingGenre = await Genre.findOne({ name: name.trim() });
    if (existingGenre) {
      return res.status(400).json({ message: 'Thể loại đã tồn tại' });
    }

    const genre = new Genre({
      name: name.trim(),
      description: description ? description.trim() : ''
    });

    const saved = await genre.save();
    
    await logAdminAction(req.user.userId, `Tạo thể loại: ${saved.name}`);
    
    res.status(201).json({
      success: true,
      data: saved,
      message: 'Tạo thể loại thành công'
    });
  } catch (err) {
    console.error('Error creating genre:', err);
    res.status(400).json({ message: err.message || 'Lỗi khi tạo thể loại' });
  }
};

// PUT /api/genres/:id
exports.updateGenre = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Tên thể loại không được để trống' });
    }

    // Check if another genre with same name exists
    const existingGenre = await Genre.findOne({ 
      name: name.trim(), 
      _id: { $ne: req.params.id } 
    });
    if (existingGenre) {
      return res.status(400).json({ message: 'Tên thể loại đã tồn tại' });
    }

    const updated = await Genre.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        description: description ? description.trim() : ''
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }

    await logAdminAction(req.user.userId, `Cập nhật thể loại: ${updated.name}`);
    
    res.json({
      success: true,
      data: updated,
      message: 'Cập nhật thể loại thành công'
    });
  } catch (err) {
    console.error('Error updating genre:', err);
    res.status(400).json({ message: err.message || 'Lỗi khi cập nhật thể loại' });
  }
};

// DELETE /api/genres/:id
exports.deleteGenre = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (!genre) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }

    await Genre.findByIdAndDelete(req.params.id);
    
    await logAdminAction(req.user.userId, `Xóa thể loại: ${genre.name}`);
    
    res.json({
      success: true,
      message: 'Xóa thể loại thành công'
    });
  } catch (err) {
    console.error('Error deleting genre:', err);
    res.status(500).json({ message: 'Lỗi khi xóa thể loại' });
  }
};