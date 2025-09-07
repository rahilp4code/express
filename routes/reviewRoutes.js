const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

// POST /reviews
// POST setups/setupId/reviews

router
  .route('/')
  .get(authController.protect, reviewController.getAllReviews)
  .post(authController.protect, reviewController.createReview);

module.exports = router;
