const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.setupId) filter = { setup: req.params.setupId };
  const reviews = await Review.find(filter).populate('user');
  res.status(200).json({
    status: 'success',
    Data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.setup) req.body.setup = req.params.setupId;
  if (!req.body.user) req.body.user = req.user.id;
  const review = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    Data: {
      review: review,
    },
  });
});
