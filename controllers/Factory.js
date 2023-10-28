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

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new ApiError('document not found', 404));
    }

    //const tour = Array.from(tours).find((el) => el.id === req.params.id * 1);
    // const updatedTour = { ...tour, difficulty: 'medium' };
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    //console.log(req.body);
    //const newId = tours[tours.length - 1].id + 1;
    //const newTour = Object.assign(req.body, { id: newId });
    //tours.push(newTour);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
