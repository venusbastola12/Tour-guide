const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const tourRouter = express.Router();
//tourRouter.param('id', tourController.checkId); //param middleware
tourRouter.use('/:id/reviews', reviewRouter); //here we mount the given url with reviewRouter.so the route is redirected to the reviewRouter.
tourRouter
  .route('/top_5_tours')
  .get(tourController.aliasTours, tourController.getTours);

tourRouter.route('/tourstats').get(tourController.getTourStats);
tourRouter.route('/monthly_plan/:year').get(tourController.getMonthlyPlan);
tourRouter
  .route('/')
  .get(authController.protect, tourController.getTours)
  .post(tourController.createTour);

tourRouter
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('lead-guide', 'admin'),
    tourController.deleteTour
  );
// tourRouter
//   .route('/:id/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

module.exports = tourRouter;
