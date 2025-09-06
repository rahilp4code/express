const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
// const Users = require('../models/userModel');

const setupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Nameless Setup',
      maxLength: [30, 'max length should be below 30'],
      minLength: [5, 'min length should be above 5'],
      // validate: [validator.isAlpha, 'Validator Error'],
    },
    slug: String,
    background_image: {
      type: String,
    },
    category: {
      type: String,
    },
    summary: {
      type: String,
    },
    tags: {
      type: Object,
    },
    performance_rating: {
      type: Number,
    },
    location: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    images: [String],
    benchmarks: {
      type: Map,
      of: Number, // values are numbers (FPS)
    },
    gpu: {
      type: String,
      required: [true, 'Your build must have a GPU or put None'],
    },
    cpu: {
      type: String,
      required: [true, 'Your build must have a CPU or put None'],
    },
    price: {
      type: Number,
      required: [true, 'Your build must have a Price'],
    },
    discount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'The discount value ({VALUE}) should be below regular price',
      },
    },
    description: {
      type: String,
      unique: true,
    },
    secret_price: {
      type: Boolean,
      default: false,
    },
    location: {
      //GeoJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinate: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinate: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
      },
    ],
  },
  {
    toJSON: { virtuals: true }, //vituals to be part of json output, true
    toObject: { virtuals: true }, // virtuals to be part of Object output, true
  },
);

setupSchema.virtual('worth-it').get(function () {
  if (this.price > 50000) return 'yes';
});

// DOCUMENT MIDDLEWAR: runs before .save() and .create()

setupSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// setupSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(
//     async (id) => await Users.findById(id),
//   );
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// setupSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE

setupSchema.pre(/^find/, function (next) {
  this.find({ secret_price: { $ne: true } });
  this.populate({
    path: 'guides',
    select:
      '-__v -passwordChangedAt -passwordResetExpires -passwordResetToken -role',
  });
  next();
});

// AGGREGATION MIDDLEWARE

setupSchema.pre('aggregate', function (next) {
  console.log(this.pipeline()); // logs the aggregate array
  this.pipeline().unshift({ $match: { secret_price: { $ne: true } } });
  next();
});

const pcBuilds = mongoose.model('pcBuilds', setupSchema);

module.exports = pcBuilds;
