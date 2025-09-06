const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNHANDLED EXCEPTION!💥 Shutting down...');
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});
dotenv.config({ path: './config.env' });
const app = require('./app');
app.set('query parser', 'extended');

const db = process.env.DATABASE;
mongoose
  .connect(db)
  .then(() => console.log('db connection successful'))
  .catch((err) => console.error(err));

// START SERVER
const port = 3000;
const server = app.listen(port, () => {
  console.log(`App running on ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION!💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
