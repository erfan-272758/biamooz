const router = require('express').Router();
const controller = require('../controllers/viewController');
const authController = require('../controllers/authController');

router.get('/my', authController.protect, controller.account);
router.get(
  '/users/:id',
  authController.protect,
  authController.restrictTo('user-admin', 'admin'),
  controller.getOneUser
);
router.get('/rents/:id', authController.protect, controller.getOneRent);

router.use(authController.checkLogin());

router.get('/', controller.overview);
router.get('/signup', controller.signup);
router.get('/login', controller.login);
router.get('/logout', controller.logout);
router.get('/forgotPassword', controller.forgotPassword);
// router.get('/:page?', controller.overview);
router.get('/books/:id', controller.getOneBook);
router.get('/resetPassword/:token', controller.resetPassword);

module.exports = router;
