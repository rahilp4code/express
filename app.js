const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const userRouter = require('./routes/userRoutes');
const setupRouter = require('./routes/setupRoutes');

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = express();

// 1] MIDDLEWARES

app.use(express.json()); // this express.json here caliing this function basically returns a function, and so that method is added to the middleware stack

//Creating middleware

// app.use((req, res, next) => {
//   console.log('Hello from the Middleware');
//   next(); // always remember to add next() or it will block the execution of middleware stack
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime);
  next();
});

// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}

// ROUTES

app.use('/api/v2/setups', setupRouter);
app.use('/api/v2/users', userRouter);
// app.use(express.static(`${__dirname}/GamingGo/public`));

// ROUTE FOR ANY URL THAT WE GET WHICH ISNT DEFINED

app.use((req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this sever!..`,
  // });

  const err = new Error(`Can't find ${req.originalUrl} on this sever!..`);
  err.statusCode = 404;
  err.status = 'fail';
  next(err);
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
