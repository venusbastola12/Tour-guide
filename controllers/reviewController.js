const Review = require('../models/reviewModel');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');

exports.getReview = catchAsync(async (req, res) => {
  let filter = {};
  if (req.params.id) filter = { tour: req.params.id };
  const review = await Review.find(filter);
  res.status(200).json({
    status: 'success',
    data: {
      reviews: review,
    },
  });
});
exports.createReview = catchAsync(async (req, res) => {
  if (!req.body.tour) req.body.tour = req.params.id;
  if (!req.body.user) req.body.user = req.user._id;
  const newReview = await Review.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      newReview,
    },
  });
});
