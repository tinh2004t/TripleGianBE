const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: String,

  description: String,
  posterUrl: String,
  trailerUrl: String,
  genres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
  releaseYear: Number,
  status: String,
  country: String,
  totalEpisodes: Number,
  viewCount: { type: Number, default: 0 },
  type: { type: String, enum: ['Movies', 'TvSeries'], required: true },
}, {
  timestamps: true,
});

// Thêm index text cho trường title
movieSchema.index({ title: 'text' });

module.exports = mongoose.model('Movie', movieSchema);
