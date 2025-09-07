const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cant be empty!'],
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    setup: {
      type: mongoose.Schema.ObjectId,
      ref: 'pcBuilds',
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'users',
    },
  },
  {
    toJSON: { virtuals: true }, //vituals to be part of json output, true
    toObject: { virtuals: true }, // virtuals to be part of Object output, true
  },
);

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'setup',
  //     select: 'name',
  //   }).populate({
  //     path: 'user',
  //     select: 'name',
  //   });
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

const Review = mongoose.model('Reviews', reviewSchema);

module.exports = Review;
