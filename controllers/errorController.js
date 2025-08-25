const AppError = require('../utils/appError');

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const errForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const errForProduction = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // log error
    // console.error('ERROR💥', err);

    //send response message
    res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  console.error(' Global error handler caught:', err.name, err.message);

  // Set defaults
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    if (err.name === 'CastError') err = handleCastError(err);
    if (err.name === 'ValidationError') err = handleValidationError(err);
    errForDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // let error = { ...err }; this caused error with isOperational property
    if (err.name === 'CastError') err = handleCastError(err);
    if (err.name === 'ValidationError') err = handleValidationError(err);
    errForProduction(err, res);
  }
};

// Handle invalid Mongo ObjectId (CastError)
// if (err.name === 'CastError') {
//   err = new AppError(`Invalid ${err.path}: ${err.value}`, 404);
// }
