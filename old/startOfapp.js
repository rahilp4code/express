const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const app = express();

const setups = JSON.parse(
  fs.readFileSync(`${__dirname}/GamingGo/dev-data/data/setup-simple.json`)
);

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

// 2] ROUTE HANDLERS (setups)

const pcBuilds = (req, res) => {
  res.status(200).json({
    status: 'success',
    length: setups.length,
    requestTime: req.requestTime,
    data: { setups },
  });
};

const createPcBuild = (req, res) => {
  //   console.log(req.body);
  //   res.send('done');

  const newId = setups[setups.length - 1].id + 1;
  const newSetup = Object.assign({ id: newId }, req.body);

  setups.push(newSetup);
  fs.writeFile(
    `${__dirname}/GamingGo/dev-data/data/setup-simple.json`,
    JSON.stringify(setups, null, 2),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: { setups: newSetup },
      });
    }
  );
};

const getPcBuild = (req, res) => {
  //   console.log(req.params);
  //   res.send('done');
  const id = req.params.id * 1;
  const setup = setups.find((obj) => obj.id === id);

  //if (id>setups.length)
  if (!setup) {
    res.status(404).json({ status: 'Fail', mesaage: 'Invalid ID' });
  }
  res.status(200).json({ status: 'success', data: { setup } });
};

const updatePcBuild = (req, res) => {
  const id = parseInt(req.params.id);
  const update = req.body;

  //find build by id
  const buildIndex = setups.findIndex((obj) => obj.id === id);
  if (buildIndex === -1) {
    return res.status(404).json({ status: 'Fail', mesaage: 'Invalid ID' });
  }
  //update only provided fields
  setups[buildIndex] = { ...setups[buildIndex], ...update };

  // Save updated data to file
  fs.writeFile(
    `${__dirname}/GamingGo/dev-data/data/setup-simple.json`,
    JSON.stringify(setups, null, 2),
    (err) => {
      if (err) {
        res.status(404).json({ status: 'fail' });
      }
      res
        .status(200)
        .json({ status: 'success', updatedBuild: setups[buildIndex] });
    }
  );
};

const deletePcBuild = (req, res) => {
  const id = req.params.id * 1;

  const deleteIndex = setups.findIndex((obj) => obj.id === id);
  //   if (parseInt(req.params.id) > setups.length) {
  //     res.status(404).json({ status: 'Fail', mesaage: 'Invalid ID' });
  //   }
  if (deleteIndex === -1) {
    return res.status(404).json({ status: 'Fail', mesaage: 'Invalid ID' });
  }

  //delete only provided index
  const deleteIt = setups.splice(deleteIndex, 1)[0];

  // Save updated data to JSON file
  fs.writeFile(
    `${__dirname}/GamingGo/dev-data/data/setup-simple.json`,
    JSON.stringify(setups, null, 2),
    (err) => {
      if (err) {
        res.status(500).json({ status: 'fail' });
      }
      res.json({
        message: 'Build deleted successfully',
        deleteIt,
      });
    }
  );
};

// ROUTE HANDLERS (users)

const users = (req, res) => {
  res.status(500).json({ message: 'This router isnt implemented yet' });
};
const createUser = (req, res) => {
  res.status(500).json({ message: 'This router isnt implemented yet' });
};
const getUser = (req, res) => {
  res.status(500).json({ message: 'This router isnt implemented yet' });
};
const updateUser = (req, res) => {
  res.status(500).json({ message: 'This router isnt implemented yet' });
};
const deleteUser = (req, res) => {
  res.status(500).json({ message: 'This router isnt implemented yet' });
};

// 3] ROUTES

// app.get('/api/v2/setups', pcBuilds);
// app.post('/api/v2/setups', createPcBuild);
// app.get('/api/v2/setups/:id', getPcBuild);
// app.patch('/api/v2/setups/:id', updatePcBuild);
// app.delete('/api/v2/setups/:id', deletePcBuild);

//refracting our routing

//builds

// app.route('/api/v2/setups').get(pcBuilds).post(createPcBuild);
// app
// .route('/api/v2/setups/:id')
// .get(getPcBuild)
// .patch(updatePcBuild)
// .delete(deletePcBuild);

// //user

// app.route('/api/v2/users').get(users).post(createUser);
// app
//   .route('/api/v2/users/:id')
//   .get(getUser)
//   .patch(updateUser)
//   .delete(deleteUser);

// Mounting Routers

const setupRouter = express.Router();
const userRouter = express.Router();

app.use('/api/v2/users', userRouter);
app.use('/api/v2/setups', setupRouter);

setupRouter.route('/').get(pcBuilds).post(createPcBuild);
setupRouter
  .route('/:id')
  .get(getPcBuild)
  .patch(updatePcBuild)
  .delete(deletePcBuild);

userRouter.route('/').get(users).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

const port = 3000;
app.listen(port, () => {
  console.log(`App running on ${port}...`);
});
