const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
dotenv.config({ path: './config.env' });

const db = process.env.DATABASE;
mongoose
  .connect(db)
  .then((con) => console.log(con, 'db connection successful'))
  .catch((err) => console.error(err));

const setupSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Nameless Setup',
  },
  gpu: {
    type: String,
    required: [true, 'Your build must have a GPU or put None'],
  },
  cpu: {
    type: String,
    required: [true, 'Your build must have a CPU or put None'],
  },
  price: {
    type: Number,
    required: [true, 'Your build must have a Price'],
  },
  description: {
    type: String,
    unique: true,
  },
});

const Builds = mongoose.model('Builds', setupSchema);

// console.log(app.get('env'));
// console.log(process.env);

// START SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`App running on ${port}...`);
});
