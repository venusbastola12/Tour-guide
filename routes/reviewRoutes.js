const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const reviewRouter = express.Router();
reviewRouter.get('/', reviewController.getReview);
reviewRouter.post(
  '/',
  authController.protect,
  authController.restrictTo('user'),
  reviewController.createReview
);

module.exports = reviewRouter;
