const router = require('express').Router();
const controller = require('../controllers/bookController');
const authController = require('../controllers/authController');
const { upload, bookUpload } = require('../utils/uploadImage');
const rentRouter = require('./rentRouter');

router
  .route('/')
  .get(controller.getAll)
  .post(
    authController.protect,
    authController.restrictTo('user-admin', 'admin'),
    upload.array('image', 2),
    controller.insertOne,
    bookUpload
  );
router
  .route('/:id')
  .get(controller.getOne)
  .put(
    authController.protect,
    authController.restrictTo('user-admin', 'admin'),
    upload.array('image', 2),
    bookUpload,
    controller.updateOne
  )
  .delete(
    authController.protect,
    authController.restrictTo('user-admin', 'admin'),
    controller.deleteOne
  );
router.use('/:bookId/rents', rentRouter);
module.exports = router;
