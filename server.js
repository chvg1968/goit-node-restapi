const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose');
require('dotenv').config();



const usersRouter = require('./routes/api/users');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.DB_HOST, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));


// Routes

app.use('/api/users', usersRouter);

// 404 Not Found
app.use((_, res, __) => {
  res.status(404).json({
    status: 'error',
    code: 404,
    message: `Use api on routes: 
    /api/users/registration - registration user {username, email, password}
    /api/users/login - login {email, password}
    /api/users/logout - token
    /api/users/list - get message if user is authenticated`,
    data: 'Not found',
  })
});

// Error handling

app.use((err, _, res, __) => {
  console.log(err.stack)
  res.status(500).json({
    status: 'fail',
    code: 500,
    message: err.message,
    data: 'Internal Server Error',
  })
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, function () {
  console.log(`Server running. Use our API on port: ${PORT}`)
});

module.exports = server; 
