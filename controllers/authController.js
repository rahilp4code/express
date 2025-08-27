const Users = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { promisify } = require('util');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  //   const newUser = await Users.create(req.body); // has security flaws
  const newUser = await Users.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  //   const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //     expiresIn: process.env.JWT_EXPIRES_IN,
  //   });
  const token = signToken(newUser._id);

  res.status(200).json({
    status: 'success',
    token,
    user: newUser,
  });
});

exports.login = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;

  // 1] check if email and password both exsist
  if (!email || !password) {
    return next(new AppError('Please provide email and password'), 400);
  }
  // 2] check if the user and password are correct
  const user = await Users.findOne({ email }).select('+password'); // + is used to add field

  if (!user || !(await user.correctPass(password, user.password))) {
    return next(new AppError('Incorrect email or password'), 401);
  }
  // 3] generate token
  const token = signToken(user._id);
  // 4] hide password in response or simply dont send the user object
  user.password = undefined;
  // 5] send the response
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async function (req, res, next) {
  // 1] get token and check if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! login to get access', 401),
    );
  }

  // 2] token verification
  let decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3] checking if the user still exist

  let currentUser = await Users.findById(decoded.id);
  if (!currentUser) {
    next(
      new AppError('The user belonging to this token no longer exists!.', 401),
    );
  }

  // 4] check if user changed password after token was issued
  if (currentUser.passwordChangedAfter(decoded.iat)) {
    next(
      new AppError('User has changed the password, please log in again', 401),
    );
  }

  // grant access to the protected route
  req.user = currentUser;
  next();
});
