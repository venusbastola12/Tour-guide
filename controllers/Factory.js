const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new ApiError('document not found', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id);
//     if (!tour) {
//       return next(new ApiError('Tour not found', 404));
//     }
//     res.status(204).json({
//       status: 'success',
//       data: null,
//     });
