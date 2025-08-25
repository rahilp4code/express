const Users = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await Users.create(req.body);

  res.status(200).json({
    status: 'success',
    user: newUser,
  });
});
