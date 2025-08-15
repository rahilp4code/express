const mongoose = require('mongoose');

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

const pcBuilds = mongoose.model('pcBuilds', setupSchema);

module.exports = pcBuilds;
