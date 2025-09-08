const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.setupId) filter = { setup: req.params.setupId };
//   const reviews = await Review.find(filter).populate('user');
//   res.status(200).json({
//     status: 'success',
//     Data: {
//       reviews,
//     },
//   });
// });
exports.setSetupUserId = (req, res, next) => {
  // Allow Nested Routes
  if (!req.body.setup) req.body.setup = req.params.setupId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.createReview = factory.create(Review);
exports.updateReview = factory.update(Review);
exports.deleteOne = factory.deleteOne(Review);
