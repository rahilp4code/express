const express = require('express');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
// const xss = require('xss-clean');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const setupRouter = require('./routes/setupRoutes');

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = express();

// 1] Global MIDDLEWARES

// Set security HTTP header
// app.use(helmet());
// Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many request from this ip, please try again in an hour!',
});
app.use('/api', limiter);

// Body parcer , readin data from the body into req.body
app.use(
  express.json({
    limit: '10kb',
  }),
); // this express.json here caliing this function basically returns a function, and so that method is added to the middleware stack

// Data sanitization against NOSQL query injection
// app.use(mongoSanitize());

// Protection against XSS

// app.use((req, res, next) => {
//   if (req.body) {
//     for (let key in req.body) {
//       if (typeof req.body[key] === 'string') {
//         req.body[key] = xss(req.body[key]);
//       }
//     }
//   }
//   next();
// });

// serving tatic file
app.use(express.static(`${__dirname}/public`));
//Creating middleware

// app.use((req, res, next) => {
//   console.log('Hello from the Middleware');
//   next(); // always remember to add next() or it will block the execution of middleware stack
// });

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime);
  // console.log(req.headers);
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

  // const err = new Error(`Can't find ${req.originalUrl} on this sever!..`);
  // err.statusCode = 404;
  // err.status = 'fail';
  // next(err);
  next(new AppError(`Can't find ${req.originalUrl} on this sever!..`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
