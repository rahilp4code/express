const fs = require('fs');

const setups = JSON.parse(
  fs.readFileSync(`${__dirname}/../GamingGo/dev-data/data/setup-simple.json`)
);

//middlware param function

exports.idCheck = (req, res, next, val) => {
  console.log(`Tour ID is: ${val}`);
  if (parseInt(req.params.id) > setups.length) {
    return res.status(404).json({ message: 'inavlid ID' });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.cpu || !req.body.gpu) {
    return res.status(400).json({ message: 'Missing either cpu or gpu' });
  }
  next();
};

// ROUTE HANDLERS (setups)

exports.pcBuilds = (req, res) => {
  res.status(200).json({
    status: 'success',
    length: setups.length,
    requestTime: req.requestTime,
    data: { setups },
  });
};

exports.createPcBuild = (req, res) => {
  const newId = setups[setups.length - 1].id + 1;
  const newSetup = Object.assign({ id: newId }, req.body);

  setups.push(newSetup);
  fs.writeFile(
    `${__dirname}/../GamingGo/dev-data/data/setup-simple.json`,
    JSON.stringify(setups, null, 2),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: { setups: newSetup },
      });
    }
  );
};

exports.getPcBuild = (req, res) => {
  const id = req.params.id * 1;
  const setup = setups.find((obj) => obj.id === id);
  res.status(200).json({ status: 'success', data: { setup } });
};

exports.updatePcBuild = (req, res) => {
  const id = parseInt(req.params.id);
  const update = req.body;

  //find build by id
  const buildIndex = setups.findIndex((obj) => obj.id === id);
  //update only provided fields
  setups[buildIndex] = { ...setups[buildIndex], ...update };

  // Save updated data to file
  fs.writeFile(
    `${__dirname}/../GamingGo/dev-data/data/setup-simple.json`,
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

exports.deletePcBuild = (req, res) => {
  const id = req.params.id * 1;

  const deleteIndex = setups.findIndex((obj) => obj.id === id);

  //delete only provided index
  const deleteIt = setups.splice(deleteIndex, 1)[0];

  // Save updated data to JSON file
  fs.writeFile(
    `${__dirname}/../GamingGo/dev-data/data/setup-simple.json`,
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
