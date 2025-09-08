const Setup = require('../models/setupModel');
// const reusableApi = require('../utils/reusableApi');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.topTwo = (req, res, next) => {
  req.customQuery = {
    limit: '2',
    sort: '-price',
    fields: 'gpu cpu price',
  };
  next();
};

// ROUTE HANDLERS

exports.pcBuilds = factory.getAll(Setup);
exports.createPcBuild = factory.create(Setup);

exports.getPcBuild = factory.getOne(Setup);
// exports.getPcBuild = catchAsync(async (req, res, next) => {
//   const build = await Setup.findById(req.params.id).populate('reviews');
//   if (!build) {
//     return next(new AppError(`Can't find the build..`, 404));
//   }
//   res.status(200).json({ status: 'success', data: build });
// });

exports.updatePcBuild = factory.update(Setup);
// exports.updatePcBuild = catchAsync(async (req, res, next) => {
//   const build = await Setup.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   res.status(200).json({ status: 'success', updatedBuild: build });
// });

exports.deletePcBuild = factory.deleteOne(Setup);

exports.pcBuildsV2 = catchAsync(async (req, res, next) => {
  // pick source of queries
  const queryObj = req.customQuery || req.query;

  let query = Setup.find();

  // apply filters (if you have them)
  if (queryObj.sort) query = query.sort(queryObj.sort);
  if (queryObj.fields) query = query.select(queryObj.fields);
  if (queryObj.limit) query = query.limit(queryObj.limit * 1);

  const builds = await query;

  res.status(200).json({
    status: 'success',
    results: builds.length,
    data: { builds },
  });
});

exports.buildStat = catchAsync(async (req, res, next) => {
  // try {
  const stat = await Setup.aggregate([
    {
      $match: { price: { $lte: 100000 } },
    },
    {
      $group: {
        _id: { $toUpper: '$category' },
        num: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    {
      $match: { _id: { $ne: 'BEGINNER' } },
    },
  ]);
  res.status(200).json({
    status: 'success',
    results: Setup.length,
    data: { stat },
  });
});

exports.tags = catchAsync(async (req, res, next) => {
  const tag = await Setup.aggregate([
    {
      $unwind: '$tags',
    },
    {
      $match: {
        tags: {
          $in: ['AAA gaming', '1080p ultra', '1440p gaming', 'streaming'],
        },
      },
    },
    {
      $group: {
        _id: {
          tags: '$tags',
          name: '$name',
          cpu: '$cpu',
          gpu: '$gpu',
          summary: '$summary',
        },
        totalBuilds: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        // summary: { $addToSet: '$summary' },
        // build: { $push: '$summary' },
        // build: { $push: ['$name', '&cpu', '$gpu'] }, // can push single component
      },
    },
    {
      $addFields: { build: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $limit: 6,
    },
    // {
    //   $project: {
    //     _id: 0,
    //     tags: '$_id.tags',
    //     name: '$_id.name',
    //     cpu: '$_id.cpu',
    //     gpu: '$_id.gpu',
    //     totalBuilds: 1,
    //     avgPrice: { $round: ['$avgPrice', 2] }, // rounding for neatness
    //     build: 1,
    //   },
    // }, chatgpt better verion
  ]);
  res.status(200).json({
    status: 'success',
    data: { tag },
  });
});
