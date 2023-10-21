const express = require('express');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const ApiError = require('./utils/apiError');
const ErrorController = require('./controllers/ErrorController');

const app = express();
app.use(express.json()); //middleware ->it is used to give 'req' to have body method containing data,usually express dont give permission directly so we have to use middlware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
// app.get('/api/tour', async (request, response) => {
//   console.log('i am calling an api route');
//   response
//     .status(200)
//     .json('congratulations you have connected to the tour route');
// });
//Routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'failed',
  //   message: 'the requested url is not available in the current server',
  // });
  next(
    new ApiError(
      'the requested url is not availabel in the current server',
      404
    )
  );
});
// app.use((err, req, res, next) => {
//   //console.log(err.stack);
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// });
app.use(ErrorController);
module.exports = app;
