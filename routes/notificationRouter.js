const router = require('express').Router({ mergeParams: true });
const controller = require('../controllers/notificationController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/').post(controller.insertOne).get(controller.getMine);

router.use(authController.restrictTo('user-admin', 'admin'));

router.get('/all', controller.getAll);

router
  .route('/:id')
  .get(controller.getOne)
  .delete(controller.deleteOne)
  .put(controller.updateOne);

module.exports = router;
