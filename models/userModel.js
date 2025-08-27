const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Enter the password again to confirm it'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not same',
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  // only run this func if the password was actually modified
  if (!this.isModified('password')) return next();

  //hash the password with the cost of 12 ans then deleted confirmPassword
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

//gobal method
userSchema.methods.correctPass = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
//since select is false for password we cant compare it in this function

userSchema.methods.passwordChangedAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return changedTimestamp > jwtTimestamp;
  }
  return false;
};

const user = mongoose.model('users', userSchema);

module.exports = user;
