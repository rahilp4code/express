const Setup = require('../models/setupModel');
const reusableApi = require('../utils/reusableApi');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.topTwo = (req, res, next) => {
  req.customQuery = {
    limit: '2',
    sort: '-price',
    fields: 'gpu cpu price',
  };
  next();
};

// ROUTE HANDLERS

exports.pcBuilds = catchAsync(async (req, res, next) => {
  // try {
  // BUILDQUERY

  // 1A]filtering
  // const queryObj = { ...req.query };
  // const excludeFields = ['page', 'sort', 'limit', 'fields'];
  // excludeFields.forEach((el) => delete queryObj[el]);
  // // console.log(req.query, queryObj);
  // console.log(req.query);

  // // 1B]advanced filtering

  // //{name:'The Potato Masher',price:{$le:100000}}
  // //127.0.0.1:3000/api/v2/setups?name=The Potato Masher&price[le]=100000&page=2&sort=10&limit=11&fields=10

  // let queryString = JSON.stringify(queryObj);
  // queryString = queryString.replaceAll(
  //   /\b(gte|gt|lte|lt)\b/g,
  //   (match) => `$${match}`,
  // );
  // console.log(JSON.parse(queryString));
  // let query = Setup.find(JSON.parse(queryString));
  let features = new reusableApi(Setup.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const setups = await features.query;
  console.log(req.query);

  // 2]SORTING
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   query = query.sort(sortBy);
  //   //sort('price days')
  // } //can add else as well to filter like latest dates to old

  // // 3]LIMITING FIELDS
  // if (req.query.fields) {
  //   const select = req.query.fields.split(',').join(' ');
  //   query = query.select(select);
  // } else {
  //   query = query.select('-__v');
  // }

  // 4] PAGINATION

  // if (req.query.page) {
  //   let page = Number(req.query.page) || 1;
  //   let limit = Number(req.query.limit) || 1;
  //   let skip = (page - 1) * limit;
  //   query = query.skip(skip).limit(limit);
  //   const docNum = await Setup.countDocuments();
  //   console.log(docNum);
  //   if (skip >= docNum) throw new Error();
  // }

  // EXECUTE QUERY
  // SEND RESPONSE

  // const allBuilds = await Setup.find().where('price').lt(100000);
  res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
    data: { setups },
  });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: 'Invalid data, missing required fields',
  //   });
  // }
});

exports.createPcBuild = catchAsync(async (req, res, next) => {
  const newSetup = await Setup.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { setups: newSetup },
  });

  // try {

  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err.message,
  //   });
  // }
});

exports.getPcBuild = catchAsync(async (req, res, next) => {
  const build = await Setup.findById(req.params.id);
  if (!build) {
    return next(new AppError(`Can't find the build..`, 404));
  }
  res.status(200).json({ status: 'success', data: build });
});
// try {
// } catch (err) {
//   res.status(400).json({
//     status: 'fail',
//     message: 'Invalid data, missing required fields',
//   });
// }

exports.updatePcBuild = catchAsync(async (req, res, next) => {
  // try {
  const build = await Setup.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ status: 'success', updatedBuild: build });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: 'Invalid ID',
  //   });
  // }
});

exports.deletePcBuild = catchAsync(async (req, res, next) => {
  // try {
  const deletedBuild = await Setup.findByIdAndDelete(req.params.id);
  res.json({
    message: 'Build deleted successfully',
    deletedBuild: deletedBuild,
  });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: 'Invalid ID',
  //   });
  // }
});

exports.pcBuildsV2 = catchAsync(async (req, res, next) => {
  // try {
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
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err.message,
  //   });
  // }
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
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err.message,
  //   });
  // }
});

exports.tags = catchAsync(async (req, res, next) => {
  // try {
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
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err.message,
  //   });
  // }
});
