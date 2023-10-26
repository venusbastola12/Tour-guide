const express = require('express');
const reviewController = require('../controllers/reviewController');

const reviewRouter = express.Router();
reviewRouter.get('/', reviewController.getReview);
reviewRouter.post('/', reviewController.createReview);

module.exports = reviewRouter;
