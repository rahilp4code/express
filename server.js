const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
app.set('query parser', 'extended');

const db = process.env.DATABASE;
mongoose
  .connect(db)
  .then((con) => console.log('db connection successful'))
  .catch((err) => console.error(err));

// START SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`App running on ${port}...`);
});

//save
