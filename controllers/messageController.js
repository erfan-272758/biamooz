/* eslint-disable prefer-const */
const { model } = require('../models/messageModel');
const factory = require('../utils/helperFactory')(model);
const catchAsync = require('../utils/catchAsync');

class Controller {
  static getAll = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.user.role === 'user') filter.sender = req.user.id;

    const data = await model.find(filter).sort('-updatedAt');
    res.json({ status: 'success', data });
  });

  static insertOne(req, res, next) {
    factory.insertOne(
      { body: { message: req.body.message, sender: req.user._id } },
      res,
      next
    );
  }

  static updateOne = catchAsync(async (req, res, next) => {
    const { message } = req.body;
    const data = await model.findOneAndUpdate(
      { _id: req.params.id, sender: req.user.id },
      { message },
      { runValidators: true, new: true }
    );
    res.json({ status: 'success', data });
  });

  static deleteOne = catchAsync(async (req, res, next) => {
    await model.findOneAndDelete({ _id: req.params.id, sender: req.user.id });
    res.status(204).json({ status: 'success' });
  });
}

module.exports = Controller;
