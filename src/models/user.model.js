const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  history: [
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
    episode: { type: mongoose.Schema.Types.ObjectId, ref: 'Episode' }, // thêm trường này
    updatedAt: { type: Date, default: Date.now }
  }
]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
