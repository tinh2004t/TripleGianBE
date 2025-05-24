const express = require('express');
const cors = require('cors');
const movieRoutes = require('./routes/movie.routes');
const authRoutes = require('./routes/auth.routes');
const genreRoutes = require('./routes/genre.routes');
const episodeRoutes = require('./routes/episode.routes');
const userRoutes = require('./routes/user.routes');
const commentRoutes = require('./routes/comment.routes');
const adminLogRoutes = require('./routes/adminlog.route');
const notificationRoute = require('./routes/notification.route');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api', episodeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin-logs', adminLogRoutes);
app.use('/api/notifications', notificationRoute);


app.get('/', (req, res) => {
  res.send('🎬 Movie API is running!');
});

module.exports = app;
