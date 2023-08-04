const router = require('express').Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { upload, userUpload } = require('../utils/uploadImage');
const rentRouter = require('./rentRouter');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);
router.put(
  '/updateMe',
  upload.single('photo'),
  userUpload,
  userController.updateMe
);
router.put('/updateMyPassword', authController.updateMyPassword);

router
  .route('/')
  .get(authController.restrictTo('admin'), userController.getAll);
router
  .route('/:id')
  .get(authController.restrictTo('user-admin', 'admin'), userController.getOne)
  .put(
    authController.restrictTo('user-admin', 'admin'),
    userController.changeUserProperty
  )
  .delete(authController.restrictTo('admin'), userController.deleteOne);
router.use('/:userId/rents', rentRouter);
module.exports = router;
