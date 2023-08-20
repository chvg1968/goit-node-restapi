const express = require('express')
const cors = require('cors')
const usersRouter = require('./routes/api/users');
const contactsRouter = require('./routes/api/contacts');
const mongoose = require('mongoose')
require('dotenv').config()
mongoose.Promise = global.Promise
mongoose.connect(process.env.DB_HOST, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
const app = express()

const server = app.listen();

// parse application/json
app.use(express.json())
// cors
app.use(cors())

require('./config/config_passport')

app.use('/api/users', usersRouter);
app.use('/api/contacts', contactsRouter);

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
})

app.use((err, _, res, __) => {
  console.log(err.stack)
  res.status(500).json({
    status: 'fail',
    code: 500,
    message: err.message,
    data: 'Internal Server Error',
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, function () {
  console.log(`Server running. Use our API on port: ${PORT}`)
})

module.exports = server; 