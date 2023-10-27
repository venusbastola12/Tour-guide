const { json } = require('express/lib/response');
const Tour = require('../models/tourModel');
const ApiFeatures = require('../utils/apiFeatures');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./Factory');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
// );

//route handlers

exports.aliasTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,ratingAverage,price,summary,description';
  next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        toursNum: { $sum: 1 },
        ratingAverage: { $avg: '$ratingAverage' },
        priceAverage: { $avg: '$price' },
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    length: stats.length,
    data: {
      stats,
    },
  });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'error',
  //     message: err.message,
  //   });
  // }
});
exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $sort: { numTours: -1 },
    },
  ]);

  return res.status(200).json({
    status: 'success',
    length: plan.length,
    data: {
      plan,
    },
  });

  // } catch (err) {
  //   res.status(404).json({
  //     status: 'error',
  //     message: err.message,
  //   });
  // }
  //next();
});

exports.getTours = catchAsync(async (req, res) => {
  //aliasing...mostly we do it for accessing the url that is requested quite rapidly..
  //created middleware that will give the default values for the sort ,limit and fields when the repetitive route is being invoked.

  const apiFeatures = new ApiFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitField()
    .paginate();
  const tours = await apiFeatures.query;

  res.status(200).json({
    status: 'success',
    length: `${tours.length}`,

    data: {
      tours,
    },
  });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'error',
  //     message: err.message,
  //   });
  // }
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');
  if (!tour) {
    return next(new ApiError('Tour not found', 404));
  }
  //const tour = Array.from(tours).find((el) => el.id === req.params.id * 1);
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'error',
  //     message: 'invalid data sent',
  //   });
  // }
});
exports.createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);
  //console.log(req.body);
  //const newId = tours[tours.length - 1].id + 1;
  //const newTour = Object.assign(req.body, { id: newId });
  //tours.push(newTour);
  res.status(201).json({
    status: 'success',
    data: {
      tours: newTour,
    },
  });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'error',
  //     message: err,
  //   });
  // }
});
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new ApiError('Tour not found', 404));
  }

  //const tour = Array.from(tours).find((el) => el.id === req.params.id * 1);
  // const updatedTour = { ...tour, difficulty: 'medium' };
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'error',
  //     message: 'incorrect data sent as a update',
  //   });
  // }
});
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new ApiError('Tour not found', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
exports.deleteTour = Factory.deleteOne(Tour);
// } catch (err) {
//   res.status(404).json({
//     status: 'error',
//     message: 'no data to delete',
//   });
// }
