const router = require('express').Router();
const controller = require('../controllers/messageController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/').get(controller.getAll).post(controller.insertOne);
router.route('/:id').put(controller.updateOne).delete(controller.deleteOne);

module.exports = router;
