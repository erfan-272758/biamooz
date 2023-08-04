const router = require('express').Router();
const controller = require('../controllers/aggregateController');
const authController = require('../controllers/authController');

router.use(authController.protect, authController.restrictTo('admin'));
router.get('/rent-per-month', controller.rentPerMonth);
router.get('/most-penalties-users', controller.mostPenaltiesUsers);
router.get('/most-popular-books', controller.mostPopularBooks);
router.get('/most-active-users', controller.mostActiveUsers);

module.exports = router;
