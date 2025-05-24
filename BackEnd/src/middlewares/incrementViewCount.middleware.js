const Movie = require('../models/movie.model');

const incrementViewCount = async (req, res, next) => {
  try {
    const { id } = req.params; // Lấy movieId từ URL
    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Tăng viewCount lên 1
    movie.viewCount += 1;
    await movie.save(); // Lưu lại thay đổi

    next(); // Tiếp tục với middleware tiếp theo
  } catch (err) {
    console.error('Error incrementing view count:', err);
    return res.status(500).json({ message: 'Error incrementing view count' });
  }
};

module.exports = incrementViewCount;
