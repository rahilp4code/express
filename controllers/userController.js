const Users = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

// ROUTE HANDLERS (users)

exports.users = catchAsync(async function (req, res, next) {
  const users = await Users.find();

  res.status(200).json({
    status: 'success',
    users,
  });
});
exports.createUser = (req, res) => {
  res.status(500).json({ message: 'This router isnt implemented yet' });
};
exports.getUser = (req, res) => {
  res.status(500).json({ message: 'This router isnt implemented yet' });
};
exports.updateUser = (req, res) => {
  res.status(500).json({ message: 'This router isnt implemented yet' });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({ message: 'This router isnt implemented yet' });
};
