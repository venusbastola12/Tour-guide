const ApiError = require('../utils/apiError');

const handleCastError = (err) => {
  const message = `invalid ${err.path}: ${err.value}`;
  return new ApiError(message, 400);
};
const handleDuplicateError = (err) => {
  const message = `duplicate '${err.keyValue.name}' name ,plz use another one`;
  return new ApiError(message, 400);
};
const handleValidationError = (err) => {
  const message = 'invalid data sent';
  return new ApiError(message, 400);
};
const sendDevError = (err, res) => {
  console.log(err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendProdError = (err, res) => {
  //console.log(err);
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //console.error('error', err); //error other than operational are checked here...
    res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
};
module.exports = (err, req, res, next) => {
  //console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    //console.log(error);
    if (error.kind === 'ObjectId') {
      //handling the cast error
      // console.log('cast error');
      error = handleCastError(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateError(error);
    }
    if (error._message === 'Validation failed') {
      error = handleValidationError(error);
    }
    sendProdError(error, res);
  }
};
