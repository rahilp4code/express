const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Setup = require('./../../../models/setupModel');
// const idk=require('./../../../GamingGo/dev-data/data/setup-simple.json')
dotenv.config({ path: './config.env' });

const db = process.env.DATABASE;
mongoose
  .connect(db)
  .then((con) => console.log('db connection successful'))
  .catch((err) => console.error(err));

// READ JSON FILE

const setup = JSON.parse(
  fs.readFileSync(`${__dirname}/setup-simple.json`, 'utf-8'),
);
// console.log(setup);

// IMPORT DATA INTO DATABASE

const importData = async () => {
  try {
    await Setup.create(setup);
    console.log('Done Loaded Successfully');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteAllData = async () => {
  try {
    await Setup.deleteMany();
    console.log('Done Deleted  Successfully');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

console.log(process.argv); //sends the location of node and the current file which is being executed
// process.argv is a array which holds the data of the line you used to run eg. node app.js --delete, in this case there are 3 elemets in array

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteAllData();
}
