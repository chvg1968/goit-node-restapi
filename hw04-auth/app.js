const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const contactsRouter = require('./routes/api/contacts');
const usersRouter = require('./routes/api/users');

// const apiRoutes = require('./api');

const app = express();



// Determine the log format based on the environment
const logFormat = app.get('env') === 'development' ? 'dev' : 'short';

// Middleware for logging requests
app.use(logger(logFormat));

// Middleware to enable CORS
app.use(cors());

// Middleware to parse request bodies as JSON
app.use(express.json());

// Route handler for '/api/contacts' endpoint
app.use('/api/contacts', contactsRouter);

// Use the entire apiRoutes for the '/api' prefix
// app.use('/api', apiRoutes);



// Route handler for '/api/users' endpoint
app.use('/api/users', usersRouter);

// Middleware for handling 404 Not Found errors
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Error handling middleware for handling 500 Internal Server Error
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
