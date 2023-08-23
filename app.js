const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const contactsRouter = require('./routes/api/contacts');
const usersRouter = require('./routes/api/users');

// const apiRoutes = require('./api');

const app = express();


const logFormat = app.get('env') === 'development' ? 'dev' : 'short';

// Middlewares
app.use(logger(logFormat));
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/contacts', contactsRouter);
app.use('/api/', usersRouter);


// Middleware for handling 404 Not Found errors
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Error handling middleware for handling 500 Internal Server Error
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
