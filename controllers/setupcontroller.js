const Setup = require('./../models/setupModel');

// ROUTE HANDLERS

exports.pcBuilds = async (req, res) => {
  try {
    // BUILDQUERY
    // 1]filtering
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);
    // console.log(req.query, queryObj);
    console.log(req.query);

    // 2]advanced filtering

    //{name:'The Potato Masher',price:{$le:100000}}
    //127.0.0.1:3000/api/v2/setups?name=The Potato Masher&price[le]=100000&page=2&sort=10&limit=11&fields=10
    //{ name: 'The Potato Masher', 'price[lte]': '100000' }
    //gte,gt,lt,lte

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );
    console.log(JSON.parse(queryString));
    // EXECUTE QUERY
    const query = Setup.find(JSON.parse(queryString));
    // console.log(query);
    // console.log(req.query);
    // const query = Setup.find(req.query);

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
