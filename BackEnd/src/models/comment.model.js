const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  episodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Episode' }, // optional
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);
