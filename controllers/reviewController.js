const Review = require('../models/reviewModel');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./Factory');

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
exports.setTourAndUser = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.id;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
exports.createReview = Factory.createOne(Review);
exports.deleteReview = Factory.deleteOne(Review);
exports.updateReview = Factory.updateOne(Review);
