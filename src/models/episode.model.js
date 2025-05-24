const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  episodeNumber: {
    type: Number,
    required: true,
    min: 1
  },
  videoSources: [{
    type: {
      type: String,
      enum: ['iframe', 'direct', 'hls'],
      default: 'iframe'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    }
  }],
  type: {
    type: String,
    enum: ['TvSeries', 'Movie'],
    default: 'TvSeries'
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Tự động tạo createdAt và updatedAt
});

// Index để đảm bảo không trùng episodeNumber trong cùng 1 movie
episodeSchema.index({ movie: 1, episodeNumber: 1 }, { unique: true });

module.exports = mongoose.model('Episode', episodeSchema);