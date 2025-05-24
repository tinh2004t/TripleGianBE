const Comment = require('../models/comment.model');

exports.createComment = async (req, res) => {
  try {
    const { movieId, episodeId, content } = req.body;

    const comment = await Comment.create({
      movieId,
      episodeId,
      userId: req.user.userId,
      content
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'username');

    res.status(201).json(populatedComment);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ message: 'Error creating comment' });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { movieId, episodeId, page = 1, limit = 10 } = req.query;

    if (!movieId) {
      return res.status(400).json({ message: 'movieId is required' });
    }

    const filter = { movieId };
    if (episodeId) filter.episodeId = episodeId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Đếm tổng số bình luận
    const totalComments = await Comment.countDocuments(filter);

    // Lấy bình luận theo phân trang
    const comments = await Comment.find(filter)
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      comments,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalComments / limit),
      totalComments,
    });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ message: 'Error fetching comments' });
  }
};



exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Chỉ cho phép xóa nếu là admin hoặc chính chủ comment
    if (req.user.role !== 'admin' && comment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err); // ➜ log lỗi chi tiết
    res.status(500).json({ message: 'Error deleting comment' });
  }
};
