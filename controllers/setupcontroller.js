const Setup = require('./../models/setupModel');

exports.topTwo = (req, res, next) => {
  req.query.limit = '2';
  req.query.sort = 'price';
  req.query.fields = 'gpu,cpu,price';
  console.log(req.query.fields); // undefined
  next();
};

// ROUTE HANDLERS

exports.pcBuilds = async (req, res) => {
  try {
    // BUILDQUERY

    // 1A]filtering
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);
    // console.log(req.query, queryObj);
    console.log(req.query);

    // 1B]advanced filtering

    //{name:'The Potato Masher',price:{$le:100000}}
    //127.0.0.1:3000/api/v2/setups?name=The Potato Masher&price[le]=100000&page=2&sort=10&limit=11&fields=10

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replaceAll(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );
    // console.log(JSON.parse(queryString));
    let query = Setup.find(JSON.parse(queryString));

    // 2]SORTING
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
      //sort('price days')
    } //can add else as well to filter like latest dates to old

    // 3]LIMITING FIELDS
    if (req.query.fields) {
      const select = req.query.fields.split(',').join(' ');
      query = query.select(select);
    } else {
      query = query.select('-__v');
    }

    // 4] PAGINATION

    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 1;
    let skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const docNum = await Setup.countDocuments();
      console.log(docNum);
      if (skip >= docNum) throw new Error();
    }

    // EXECUTE QUERY
    // SEND RESPONSE

    // const allBuilds = await Setup.find().where('price').lt(100000);
    const allBuilds = await query;
    res.status(200).json({
      status: 'success',
      requestTime: req.requestTime,
      data: { allBuilds },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data, missing required fields',
    });
  }
};

exports.createPcBuild = async (req, res) => {
  try {
    const newSetup = await Setup.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { setups: newSetup },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data, missing required fields',
    });
  }
};

exports.getPcBuild = async (req, res) => {
  try {
    const build = await Setup.findById(req.params.id);
    res.status(200).json({ status: 'success', data: build });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data, missing required fields',
    });
  }
};

exports.updatePcBuild = async (req, res) => {
  try {
    const build = await Setup.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: 'success', updatedBuild: build });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
};

exports.deletePcBuild = async (req, res) => {
  try {
    const deletedBuild = await Setup.findByIdAndDelete(req.params.id);
    res.json({
      message: 'Build deleted successfully',
      deletedBuild: deletedBuild,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
};
