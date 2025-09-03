const Users = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const crypto = require('crypto');
const sendEmail = require('../utils/emailer');
const { promisify } = require('util');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true, // this makes sure it isnt updated on the browser
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  // secure = true
  //if your site is served over HTTP, the cookie will not be sent with requests.
  //If your site is served over HTTPS, the cookie will be included in requests.

  // remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
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
  createSendToken(newUser, 201, res);
  // const token = signToken(newUser._id);

  // res.status(200).json({
  //   status: 'success',
  //   token,
  //   user: newUser,
  // });
});

exports.login = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;

  // 1] check if email and password both exsist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // 2] check if the user and password are correct
  const user = await Users.findOne({ email }).select('+password'); // + is used to add field

  if (!user || !(await user.correctPass(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3] generate token
  // const token = signToken(user._id);
  // 5] send the response
  createSendToken(user, 200, res);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
  // 4] hide password in response or simply dont send the user object
  // user.password = undefined;
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
  console.log(decoded);

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

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin','guide']. role='user'
    if (!roles.includes(req.user.role)) {
      next(
        new AppError('You dont have permission to perform this action', 403),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async function (req, res, next) {
  // 1] get the user based on posted email
  if (!req.body || !req.body.email) {
    return next(new AppError('please provide an email first', 400));
  }
  const user = await Users.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  // 2] generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // next();

  // 3] send it to users email
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v2/users/resetPassword/${resetToken} `;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\n if you didnt forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for only 10min)',
      message,
    });

    res.status(200).json({
      status: 'sucess',
      message: 'token sent to your email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    next(
      new AppError(
        'There was an error sending the email! please try again later',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1]get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await Users.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2]if token has not expired, and there is user, set new password

  if (!user) {
    next(new AppError('Token is invalid or has expired', 401));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3]update changedPasswordAt property for the user
  // 4]log the user in,send jwt
  createSendToken(user, 200, res);
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1] Get user from the collection
  const user = await Users.findOne(req.user._id).select('+password');

  // 2] check if posted current pass is correct
  if (!(await user.correctPass(req.body.currentPassword, user.password))) {
    return next(new AppError('Incorrect currentPassword'), 401);
  }
  // 3] if yes update current pass
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  // 4] log user in send token
  createSendToken(user, 200, res);
});
