const catchAsync = require('../utils/catchAsync');
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    res.json({
      message: 'deleted successfully',
      deletedDocument: doc,
    });
  });

// exports.deletePcBuild = catchAsync(async (req, res, next) => {
//   const deletedBuild = await Setup.findByIdAndDelete(req.params.id);
//   res.json({
//     message: 'Build deleted successfully',
//     deletedBuild: deletedBuild,
//   });
// });
