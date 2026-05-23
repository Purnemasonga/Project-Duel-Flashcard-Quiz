const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error occurred', error: err.message });
};

module.exports = { errorHandler };
