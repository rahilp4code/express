const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const userRouter = require('./routes/userRoutes');
const setupRouter = require('./routes/setupRoutes');

const app = express();

// 1] MIDDLEWARES

app.use(express.json()); // this express.json here caliing this function basically returns a function, and so that method is added to the middleware stack

//Creating middleware

app.use((res, req, next) => {
  console.log('Hello from the Middleware');
  next(); // always remember to add next() or it will block the execution of middleware stack
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime);
  next();
});

app.use(morgan('dev'));

// ROUTES

app.use('/api/v2/setups', setupRouter);
app.use('/api/v2/users', userRouter);
app.use(express.static(`${__dirname}/GamingGo/public`));

module.exports = app;
