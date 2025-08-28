const express = require('express');
const setupcontroller = require('../controllers/setupcontroller');
const authController = require('../controllers/authController');

const router = express.Router();

// router.param('id', setupcontroller.idCheck);
router.route('/top-2').get(setupcontroller.topTwo, setupcontroller.pcBuildsV2);
router.route('/price-stat').get(setupcontroller.buildStat);
router.route('/tags').get(setupcontroller.tags);

router
  .route('/')
  .get(authController.protect, setupcontroller.pcBuilds)
  .post(setupcontroller.createPcBuild);

router
  .route('/:id')
  .get(setupcontroller.getPcBuild)
  .patch(setupcontroller.updatePcBuild)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    setupcontroller.deletePcBuild,
  );

module.exports = router;
