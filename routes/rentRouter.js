const router = require('express').Router({ mergeParams: true });
const controller = require('../controllers/rentController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router
  .route('/')
  .post(controller.insertOne)
  .get(
    controller.getAll,
    authController.restrictTo('user-admin', 'admin'),
    controller.getUserRents,
    controller.getBookRents
  );
router
  .route('/:id')
  .get(controller.getOne)
  .delete(controller.deleteOne)
  .put(authController.restrictTo('user-admin', 'admin'), controller.updateOne);

module.exports = router;
