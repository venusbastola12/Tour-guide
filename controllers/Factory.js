const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');

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
exports.getOne = (Model, popOptn) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptn) query = query.populate(popOptn);
    const doc = await query;

    if (!doc) {
      return next(new ApiError('document not found', 404));
    }
    //const tour = Array.from(tours).find((el) => el.id === req.params.id * 1);
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    //aliasing...mostly we do it for accessing the url that is requested quite rapidly..
    //created middleware that will give the default values for the sort ,limit and fields when the repetitive route is being invoked.

    let filter = {};
    if (req.params.id) filter = { tour: req.params.id };

    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitField()
      .paginate();
    const doc = await apiFeatures.query;

    res.status(200).json({
      status: 'success',
      length: `${doc.length}`,

      data: {
        doc,
      },
    });
  });
