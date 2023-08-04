const model = require('../models/bookModel');
const editorModel = require('../models/editorModel');
const factory = require('../utils/helperFactory')(model);
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { isLogIn } = require('./authController');

class Controller {
  static getAll(req, res, next) {
    factory.getAll(req, res, next, {
      sort: '-existing reserved -createdAt',
    });
  }

  static _getOneBookAdmin(id, role) {
    const select = role === 'admin' ? '+editors' : '';
    return model.findById(id).select(`${select} +renter`);
  }

  static async getOne(req, res, next) {
    const hasRole = await isLogIn(req, res, ['admin', 'user-admin']);
    const options = {
      isAdmin: hasRole && req.user.role === 'admin',
      isUserAdmin: hasRole && req.user.role === 'user-admin',
    };
    factory.getOne(req, res, next, options, Controller._getOneBookAdmin);
  }

  static async _insertEditors(
    data,
    eModel,
    req,
    activity = 'کتاب را ایجاد کرد'
  ) {
    return eModel.create({ user: req.user._id, book: data._id, activity });
  }

  static insertOne(req, res, next) {
    factory.filterBody(
      req.body,
      'editors',
      'existing',
      'reserved',
      'createdAt'
    );
    factory.insertOne(
      req,
      res,
      next,
      {
        reqSave: true,
        notSend: true,
        editorModel,
      },
      Controller._insertEditors
    );
  }

  static async _updateBookEditors(data, req, options) {
    const message = `در کتاب تغییراتی ایجاد کرده است. تغییرات ایجاد شده : \n ${JSON.stringify(
      req.body
    )}`;

    await Controller._insertEditors(data, options.editorModel, req, message);
    if (options.isAdmin) return Controller._getOneBookAdmin(data._id);
    return data;
  }

  static async updateOne(req, res, next) {
    factory.filterBody(
      req.body,
      'editors',
      'existing',
      'reserved',
      'createdAt'
    );
    factory.updateOne(
      req,
      res,
      next,
      {
        pushEditors: true,
        editorModel,
        isAdmin: await isLogIn(req, res, ['admin']),
      },
      Controller._updateBookEditors
    );
  }

  static deleteOne = catchAsync(async (req, res, next) => {
    const book = await model.findById(req.params.id);
    if (!book) return next(new AppError(404, 'کتاب مورد نظر یافت نشد'));
    if (!book.existing || book.reserved)
      return next(
        new AppError(403, 'اجازه ندارید کتابی که موجود نیست را حذف کنید.')
      );
    factory.deleteOne(req, res, next, {
      deletePath: `./public/img/${req.params.id}`,
    });
  });
}

module.exports = Controller;
