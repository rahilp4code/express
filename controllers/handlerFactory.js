const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const reusableApi = require('../utils/reusableApi');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('Document not found', 404));
    }
    res.status(202).json({
      message: 'deleted successfully',
      deletedDocument: doc,
    });
  });

exports.create = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.update = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: 'success', updatedData: doc });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To get reviews for specific sepupid
    let filter = {};
    if (req.params.setupId) filter = { setup: req.params.setupId };

    let features = new reusableApi(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const data = await features.query;
    //   console.log(req.query);

    res.status(200).json({
      status: 'success',
      //   requestTime: req.requestTime,
      length: data.length,
      data: { data },
    });
  });

exports.getOne = (Model, popOption) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOption) query = query.populate(popOption);
    const data = await query;
    if (!data) {
      return next(
        new AppError(`Invalid Id or Document does not exist anymore`, 401),
      );
    }
    res.status(200).json({ status: 'success', data: data });
  });
