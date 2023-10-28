const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const reviewRouter = express.Router({ mergeParams: true });
reviewRouter.get('/', reviewController.getReview);
reviewRouter.post(
  '/',
  authController.protect,
  authController.restrictTo('user'),
  reviewController.setTourAndUser,
  reviewController.createReview
);
reviewRouter.delete('/:id', reviewController.deleteReview);

reviewRouter.patch('/:id', reviewController.updateReview);
module.exports = reviewRouter;
