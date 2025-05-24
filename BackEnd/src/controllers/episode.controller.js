const Episode = require('../models/episode.model');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const logAdminAction = require('../utils/logAdminAction');

// POST - Thêm tập phim (admin)
exports.createEpisode = async (req, res) => {
  try {
    const { title, episodeNumber, videoSources } = req.body;
    const movieId = req.params.movieId;

    console.log('=== CREATE EPISODE START ===');
    console.log('Movie ID:', movieId);
    console.log('User ID:', req.user?.userId);

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Không xác định được người dùng' });
    }

    if (!title || !episodeNumber || !Array.isArray(videoSources) || videoSources.length === 0) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin bắt buộc: title, episodeNumber, videoSources' 
      });
    }

    // Check if episode already exists
    const existingEpisode = await Episode.findOne({ 
      movie: movieId, 
      episodeNumber 
    });

    if (existingEpisode) {
      return res.status(400).json({ 
        message: `Tập ${episodeNumber} đã tồn tại cho phim này` 
      });
    }

    // Create episode
    const episode = new Episode({
      movie: movieId,
      title,
      episodeNumber,
      videoSources,
      type: 'TvSeries'
    });

    await episode.save();
    console.log('✅ Episode created:', episode._id);

    // Log admin action
    await logAdminAction(req.user.userId, `Tạo tập phim: ${episode.title}`);

    // Create notifications for users who favorited this movie
    try {
      console.log('=== CREATING NOTIFICATIONS ===');
      
      // Find users who have this movie in favorites
      const usersWithFavorite = await User.find({ 
        favorites: movieId 
      }).select('_id');

      console.log(`Found ${usersWithFavorite.length} users with movie in favorites`);

      if (usersWithFavorite.length > 0) {
        // Prepare notification data
        const notificationData = usersWithFavorite.map(user => ({
          user: user._id,
          movie: movieId,
          episode: episode._id,
          title: 'Tập phim mới',
          message: `Phim bạn yêu thích đã có tập mới: "${episode.title}"`,
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        // Insert notifications in batch
        const insertedNotifications = await Notification.insertMany(notificationData);
        console.log(`✅ Created ${insertedNotifications.length} notifications`);
      }
    } catch (notificationError) {
      console.error('❌ Error creating notifications:', notificationError);
      // Don't fail the episode creation if notification fails
    }

    console.log('=== CREATE EPISODE END ===');
    res.status(201).json(episode);
    
  } catch (err) {
    console.error('❌ Error creating episode:', err);
    res.status(500).json({ message: err.message });
  }
};

// PUT - Cập nhật tập phim (admin)
exports.updateEpisode = async (req, res) => {
  try {
    const { title, episodeNumber, videoSources } = req.body;
    
    // Validate required fields
    if (!title || !episodeNumber || !videoSources || videoSources.length === 0) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin bắt buộc: title, episodeNumber, videoSources' 
      });
    }

    // Check if episode exists
    const existingEpisode = await Episode.findById(req.params.id);
    if (!existingEpisode) {
      return res.status(404).json({ message: 'Không tìm thấy tập phim' });
    }

    // Check if episodeNumber is unique (exclude current episode)
    if (episodeNumber !== existingEpisode.episodeNumber) {
      const duplicateEpisode = await Episode.findOne({ 
        movie: existingEpisode.movie, 
        episodeNumber: episodeNumber,
        _id: { $ne: req.params.id }
      });
      
      if (duplicateEpisode) {
        return res.status(400).json({ 
          message: `Tập ${episodeNumber} đã tồn tại cho phim này` 
        });
      }
    }

    const updateData = {
      title,
      episodeNumber,
      videoSources,
      updatedAt: new Date()
    };

    const episode = await Episode.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );

    await logAdminAction(req.user.userId, `Cập nhật tập phim: ${episode.title}`);
    
    res.status(200).json(episode);
  } catch (err) {
    console.error('Update episode error:', err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE - Xóa tập phim (admin)
exports.deleteEpisode = async (req, res) => {
  try {
    const episode = await Episode.findByIdAndDelete(req.params.id);
    if (!episode) {
      return res.status(404).json({ message: 'Không tìm thấy tập phim' });
    }
    
    // Also delete related notifications
    await Notification.deleteMany({ episode: req.params.id });
    
    await logAdminAction(req.user.userId, `Xóa tập phim: ${episode.title}`);
    res.status(200).json({ message: 'Xóa tập phim thành công' });
  } catch (err) {
    console.error('Delete episode error:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET - Danh sách tập phim theo movieId
exports.getEpisodesByMovie = async (req, res) => {
  try {
    const episodes = await Episode.find({ movie: req.params.movieId })
      .sort({ episodeNumber: 1 });
    res.status(200).json(episodes);
  } catch (err) {
    console.error('Get episodes error:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET - 1 tập phim cụ thể
exports.getEpisodeById = async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.id);
    if (!episode) {
      return res.status(404).json({ message: 'Không tìm thấy tập phim' });
    }
    res.status(200).json(episode);
  } catch (err) {
    console.error('Get episode error:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET - Tập phim theo movieId và episodeId
exports.getEpisodeByMovieAndEpisodeId = async (req, res) => {
  const { movieId, episodeId } = req.params;

  try {
    const episode = await Episode.findOne({ 
      _id: episodeId, 
      movie: movieId 
    });

    if (!episode) {
      return res.status(404).json({ 
        message: 'Không tìm thấy tập phim thuộc phim này' 
      });
    }

    res.status(200).json(episode);
  } catch (err) {
    console.error('Get episode by movie and episode ID error:', err);
    res.status(500).json({ message: err.message });
  }
};