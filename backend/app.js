const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Routes Mounts
app.use('/api/auth', require('./routes/authRouter'));
app.use('/api/subjects', require('./routes/subjectRouter'));
app.use('/api/questions', require('./routes/questionRouter'));
app.use('/api/rooms', require('./routes/roomRouter'));
app.use('/api/admin', require('./routes/adminRouter'));
app.use('/api/users', require('./routes/userRouter'));
app.use('/api/requests', require('./routes/requestRouter'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error occurred' });
});

module.exports = app;
