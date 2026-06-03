function notFound(req, res) {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
}

function globalError(err, req, res, next) {
  console.error('[ERROR]', err.stack);

  const statusCode = err.statusCode || 500;
  const message    = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({ success: false, error: message });
}

module.exports = { notFound, globalError };