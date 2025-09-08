const Users = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFileds) => {
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFileds.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// ROUTE HANDLERS (users)

exports.users = factory.getAll(Users);
exports.createUser = (req, res) => {
  res.status(500).json({ message: 'This router isnt implemented yet' });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1]check if the body contains password / confirmPassword
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'This route is not for password updates. Go to updateMyPassword',
        400,
      ),
    );
  }
  // 2] filter out unwanted field names, which are not allowed to be updated
  const filter = filterObj(req.body, 'name', 'email');
  console.log(filter);
  // 3] update user document
  const updateUser = await Users.findByIdAndUpdate(req.user.id, filter, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

exports.deleteAdmin = factory.deleteOne(Users);
exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await Users.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
