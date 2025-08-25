const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please tell us your Email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Password is Manditory'],
    minlength: [8, 'Password should atleast conatin 8 characters'],
    unique: true,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Enter the password again to confirm it'],
    minlength: [8, 'Password should atleast conatin 8 characters'],
    unique: true,
  },
});

const user = mongoose.model('users', userSchema);

module.exports = user;
