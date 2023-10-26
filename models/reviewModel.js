//review,rating,review created at,ref to tour,ref to user...
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'a review must not be empty'],
  },
  rating: {
    type: 'number',
    min: 1,
    max: 5.0,
  },
  reviewCreatedAt: {
    type: 'date',
    default: `${Date.now()}`,
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'review must be associated with a tour'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'review must be associated with the user'],
  },
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
