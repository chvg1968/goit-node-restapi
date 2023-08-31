const mongoose = require("mongoose");


const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, "Email required"],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  verify:{
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required:[true, "verify token is required"],
  },
});



const User = mongoose.model("user", userSchema);

module.exports = User;
