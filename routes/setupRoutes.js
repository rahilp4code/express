const express = require('express');
const setupcontroller = require('./../controllers/setupcontroller');

const router = express.Router();

// router.param('id', setupcontroller.idCheck);
router.route('/top-2').get(setupcontroller.topTwo, setupcontroller.pcBuilds);

router
  .route('/')
  .get(setupcontroller.pcBuilds)
  .post(setupcontroller.createPcBuild);

router
  .route('/:id')
  .get(setupcontroller.getPcBuild)
  .patch(setupcontroller.updatePcBuild)
  .delete(setupcontroller.deletePcBuild);

module.exports = router;
