const model = require('../models/userModel');
const factory = require('../utils/helperFactory')(model);
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

class Controller {
  static getAll(req, res, next) {
    factory.getAll(req, res, next, {
      sort: '-active -role firstName lastName parentName',
      select:
        'firstName lastName photo role active personalPhone parentName username',
      limit: 12,
    });
  }

  static getOne(req, res, next) {
    factory.getOne(req, res, next);
  }

  static updateMe(req, res, next) {
    factory.filterBody(
      req.body,
      'passwordConfirm',
      'password',
      'passwordChangeAt',
      'passwordResetToken',
      'passwordResetExpires',
      'createdAt',
      'rentings',
      'role',
      'active',
      'box',
      'username'
    );
    factory.updateOne(req, res, next);
  }

  static changeUserProperty = catchAsync(async (req, res, next) => {
    //got data from body
    const { id } = req.params;
    const { box } = req.body;
    let active;
    let role;
    if (req.user.role === 'admin') [{ active, role }] = [req.body];

    //validate data
    //admin
    if (!['user', 'user-admin', undefined].includes(role))
      return next(
        new AppError(400, 'نقش ها باید یکی از حالات user , user-admin باشد')
      );
    const updateBody = {};

    //user-admin admin
    if (role) updateBody.role = role;
    if (active !== undefined) updateBody.active = active;
    if (box !== undefined) updateBody.box = box;

    const user = await model.findByIdAndUpdate(id, updateBody, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: 'success', user });
  });

  static deleteOne(req, res, next) {
    factory.deleteOne(req, res, next);
  }
}

module.exports = Controller;
