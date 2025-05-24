const Movie = require("../models/movie.model");
const mongoose = require("mongoose");
const logAdminAction = require("../utils/logAdminAction");

// GET /api/movies
exports.getAllMovies = async (req, res) => {
  try {
    const {
      genre,
      year,
      yearBefore,
      status,
      country,
      type,
      q,
      sort = "createdAt",
      page = 1,
      limit = 18,
    } = req.query;

    const query = {};

    if (type && ["Movies", "TvSeries"].includes(type)) {
      query.type = type;
    }

    // Sửa lại phần genre filter
    if (genre) {
      // Kiểm tra xem genre có phải là ObjectId không
      if (mongoose.Types.ObjectId.isValid(genre)) {
        query.genres = new mongoose.Types.ObjectId(genre);
      } else {
        // Nếu là string (tên thể loại), tìm theo tên trong Genre collection
        const Genre = require("../models/genre.model");
        try {
          const genreDoc = await Genre.findOne({
            name: { $regex: genre, $options: "i" },
          });
          if (genreDoc) {
            query.genres = genreDoc._id;
          } else {
            // Nếu không tìm thấy genre, tạo query không match gì để trả về empty
            query.genres = new mongoose.Types.ObjectId(
              "000000000000000000000000"
            );
          }
        } catch (err) {
          console.error("Error finding genre:", err);
          // Fallback: không áp dụng filter genre nếu có lỗi
          delete query.genres;
        }
      }
    }

    if (year) {
      query.releaseYear = Number(year);
    }

    // Thêm xử lý yearBefore
    if (yearBefore) {
      query.releaseYear = { $lt: Number(yearBefore) };
    }

    if (status) query.status = status;
    if (country) query.country = { $regex: country, $options: "i" };

    // Tìm kiếm theo title và description
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const totalItems = await Movie.countDocuments(query);

    const movies = await Movie.find(query)
      .populate("genres")
      .sort({ [sort]: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: movies,
      total: totalItems,
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / Number(limit)),
    });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách phim:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/movies/:id
exports.getMovieById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const movie = await Movie.findById(id).populate("genres");

    if (!movie) {
      return res.status(404).json({ message: "Không tìm thấy phim" });
    }

    res.json(movie);
  } catch (err) {
    console.error("Error fetching movie:", err);
    res.status(500).json({ message: "Lỗi khi lấy thông tin phim" });
  }
};

// GET /api/movies/search?q=
exports.searchMovies = async (req, res) => {
  try {
    const q = req.query.q || "";
    const movies = await Movie.find({
      title: { $regex: q, $options: "i" },
    }).populate("genres");
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/movies?genre=...&year=...&status=...
exports.filterMovies = async (req, res) => {
  try {
    const query = {};
    if (req.query.genre)
      query.genres = { $regex: req.query.genre, $options: "i" };
    if (req.query.year) query.releaseYear = Number(req.query.year);
    if (req.query.status) query.status = req.query.status;

    const movies = await Movie.find(query).populate("genres");
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/movies
exports.createMovie = async (req, res) => {
  try {
    // Validate required fields
    const { title, description, genres } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Tên phim không được để trống" });
    }

    // Process genres - convert to ObjectIds if needed
    let processedGenres = [];
    if (Array.isArray(genres) && genres.length > 0) {
      const Genre = require("../models/genre.model"); // Import Genre model

      for (let genre of genres) {
        if (typeof genre === "string") {
          // Find or create genre by name
          let genreDoc = await Genre.findOne({ name: genre });
          if (!genreDoc) {
            // Create new genre if it doesn't exist
            genreDoc = new Genre({ name: genre });
            await genreDoc.save();
          }
          processedGenres.push(genreDoc._id);
        } else if (mongoose.Types.ObjectId.isValid(genre)) {
          processedGenres.push(genre);
        }
      }
    }

    const movieData = {
      ...req.body,
      title: title.trim(),
      description: description ? description.trim() : "",
      genres: processedGenres,
      releaseYear: req.body.releaseYear || new Date().getFullYear(),
      status: req.body.status || "ongoing",
      type: req.body.type || "Movies",
      viewCount: 0,
    };

    const newMovie = new Movie(movieData);
    const saved = await newMovie.save();

    // Populate genres before returning
    const populatedMovie = await Movie.findById(saved._id).populate("genres");

    console.log("Admin đang thao tác:", req.user);
    await logAdminAction(req.user.userId, `Tạo phim: ${newMovie.title}`);

    res.status(201).json({
      success: true,
      data: populatedMovie,
      message: "Tạo phim thành công",
    });
  } catch (err) {
    console.error("Error creating movie:", err);
    res.status(400).json({
      message: err.message || "Lỗi khi tạo phim",
      error: err.errors
        ? Object.keys(err.errors).map((key) => err.errors[key].message)
        : [],
    });
  }
};

// PUT /api/movies/:id
exports.updateMovie = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    // Check if movie exists
    const existingMovie = await Movie.findById(id);
    if (!existingMovie) {
      return res.status(404).json({ message: "Không tìm thấy phim" });
    }

    // Validate title if provided
    if (req.body.title && !req.body.title.trim()) {
      return res.status(400).json({ message: "Tên phim không được để trống" });
    }

    const updateData = { ...req.body };
    if (updateData.title) {
      updateData.title = updateData.title.trim();
    }
    if (updateData.description) {
      updateData.description = updateData.description.trim();
    }

    // Process genres if provided
    if (updateData.genres && Array.isArray(updateData.genres)) {
      const Genre = require("../models/genre.model");
      let processedGenres = [];

      for (let genre of updateData.genres) {
        if (typeof genre === "string") {
          // Find or create genre by name
          let genreDoc = await Genre.findOne({ name: genre });
          if (!genreDoc) {
            // Create new genre if it doesn't exist
            genreDoc = new Genre({ name: genre });
            await genreDoc.save();
          }
          processedGenres.push(genreDoc._id);
        } else if (mongoose.Types.ObjectId.isValid(genre)) {
          processedGenres.push(genre);
        }
      }
      updateData.genres = processedGenres;
    }

    const updated = await Movie.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("genres");

    await logAdminAction(req.user.userId, `Cập nhật phim: ${updated.title}`);

    res.json({
      success: true,
      data: updated,
      message: "Cập nhật phim thành công",
    });
  } catch (err) {
    console.error("Error updating movie:", err);
    res.status(400).json({
      message: err.message || "Lỗi khi cập nhật phim",
      error: err.errors
        ? Object.keys(err.errors).map((key) => err.errors[key].message)
        : [],
    });
  }
};

// DELETE /api/movies/:id
exports.deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ message: "Không tìm thấy phim" });
    }

    await Movie.findByIdAndDelete(id);

    await logAdminAction(req.user.userId, `Xóa phim: ${movie.title}`);

    res.json({
      success: true,
      message: "Xóa phim thành công",
    });
  } catch (err) {
    console.error("Error deleting movie:", err);
    res.status(500).json({ message: "Lỗi khi xóa phim" });
  }
};

// GET /api/movies/top
exports.getTopMovies = async (req, res) => {
  try {
    const topMovies = await Movie.find({})
      .sort({ viewCount: -1 })
      .limit(5)
      .populate("genres", "name");

    res.json(topMovies);
  } catch (err) {
    console.error("Error fetching top movies:", err);
    res.status(500).json({ message: "Error fetching top movies" });
  }
};

// GET /api/movies/random
exports.getRandomMovies = async (req, res) => {
  try {
    const randomMovies = await Movie.aggregate([{ $sample: { size: 10 } }]);

    res.json(randomMovies);
  } catch (error) {
    console.error("Lỗi khi lấy phim ngẫu nhiên:", error);
    res.status(500).json({ message: "Lỗi server khi lấy phim ngẫu nhiên." });
  }
};

// GET /api/movies/type/:type
exports.getMoviesByType = async (req, res) => {
  const { type } = req.params;

  if (!["Movies", "TvSeries"].includes(type)) {
    return res
      .status(400)
      .json({ message: "Type không hợp lệ. Phải là Movies hoặc TvSeries" });
  }

  try {
    const movies = await Movie.find({ type }).populate("genres");
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// GET /api/movies/top-view/:type?limit=12
exports.getTopViewByType = async (req, res) => {
  const { type } = req.params;
  const limit = parseInt(req.query.limit) || 12;

  if (!["Movies", "TvSeries"].includes(type)) {
    return res
      .status(400)
      .json({ message: "Type không hợp lệ. Phải là Movies hoặc TvSeries" });
  }

  try {
    const movies = await Movie.find({ type })
      .sort({ viewCount: -1 })
      .limit(limit)
      .populate("genres");

    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// PUT /api/movies/:movieId/increment-view
exports.incrementViewCount = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const movie = await Movie.findByIdAndUpdate(
      movieId,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate("genres");

    if (!movie) {
      return res.status(404).json({ message: "Không tìm thấy phim" });
    }

    res.json(movie);
  } catch (err) {
    console.error("Error incrementing view count:", err);
    res.status(500).json({ message: "Lỗi khi tăng lượt xem" });
  }
};
