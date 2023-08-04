/* eslint-disable prefer-const */
const { model, BOOK_RECIVED } = require('../models/notificationModel');
const factory = require('../utils/helperFactory')(model);
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

class Controller {
  static getAll = catchAsync(async (req, res, next) => {
    const data = await model.aggregate([
      {
        $lookup: {
          from: 'users',
          as: 'creator',
          let: { id: '$creator' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$id'],
                },
              },
            },
            {
              $project: { firstName: 1, lastName: 1, photo: 1, role: 1 },
            },
          ],
        },
      },

      {
        $group: {
          _id: '$category',
          notifications: {
            $push: {
              creator: { $arrayElemAt: ['$creator', 0] },
              message: '$message',
              recivers: '$recivers',
              updatedAt: '$updatedAt',
              id: '$_id',
            },
          },
        },
      },
      {
        $addFields: { category: '$_id' },
      },
      {
        $project: { _id: 0 },
      },
    ]);
    res.json({ status: 'success', data });
  });

  static getMine = catchAsync(async (req, res, next) => {
    const data = await model.aggregate([
      {
        $match: {
          $or: [
            { recivers: null },
            { recivers: [] },
            { $expr: { $in: [req.user.id, '$recivers'] } },
          ],
        },
      },
      {
        $lookup: {
          from: 'users',
          as: 'creator',
          let: { id: '$creator' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$id'],
                },
              },
            },
            {
              $project: { firstName: 1, lastName: 1, photo: 1, role: 1 },
            },
          ],
        },
      },

      {
        $group: {
          _id: '$category',
          notifications: {
            $push: {
              creator: { $arrayElemAt: ['$creator', 0] },
              message: '$message',
              recivers: '$recivers',
              updatedAt: '$updatedAt',
              id: '$_id',
            },
          },
        },
      },
      {
        $addFields: { category: '$_id' },
      },
      {
        $project: { _id: 0 },
      },
    ]);

    res.json({ status: 'success', data });
  });

  static getOne(req, res, next) {
    factory.getOne(req, res, next);
  }

  static async getExactOne(user, category) {
    return await model.find({
      category,
      $or: [{ recivers: null }, { recivers: [] }, { recivers: user._id }],
    });
  }

  static insertOne = catchAsync(async (req, res, next) => {
    const { category, message, recivers = [] } = req.body;

    if (!message || category !== BOOK_RECIVED)
      return next(new AppError(401, 'اطلاعات وارد شده ناقص است'));

    const data = await model.create({
      category,
      message,
      recivers,
      creator: req.user._id,
    });
    res.status(201).json({ status: 'success', data });
  });

  static updateOne = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    let { message, recivers, pushRecivers } = req.body;

    const notif = await model.findById(id);
    if (!notif) return next(new AppError(404, 'اعلان مورد نظر یافت نشد'));

    if (message) notif.message = message;
    if (recivers) notif.recivers = recivers;
    if (pushRecivers) {
      if (!notif.recivers) notif.recivers = [];

      if (!Array.isArray(pushRecivers)) pushRecivers = [pushRecivers];

      pushRecivers.forEach((pushR) => {
        if (!notif.recivers.includes(pushR)) notif.recivers.push(pushRecivers);
      });
    }

    await notif.save();

    res.json({ status: 'success', data: notif });
  });

  static deleteOne(req, res, next) {
    factory.deleteOne(req, res, next);
  }
}

module.exports = Controller;
