const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const apiRoutes = require('./api');
const app = express();



// Determine the log format based on the environment
const logFormat = app.get('env') === 'development' ? 'dev' : 'short';

// Middleware for logging requests
app.use(logger(logFormat));

// Middleware to enable CORS
app.use(cors());

// Middleware to parse request bodies as JSON
app.use(express.json());

// Use the entire apiRoutes for the '/api' prefix
app.use('/api', apiRoutes);

// Middleware for handling 404 Not Found errors
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Error handling middleware for handling 500 Internal Server Error
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
