/* eslint-disable prefer-const */
const model = require('../models/rentModel');
const bookModel = require('../models/bookModel');
const userModel = require('../models/userModel');
const notificationController = require('./notificationController');
const factory = require('../utils/helperFactory')(model);
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const {
  bookChecker,
  userChecker,
  rentChecker,
} = require('../utils/requestChecker');
const { BOOK_RECIVED } = require('../models/notificationModel');

const queryConcat = (query, key, concat) => {
  query[key] = query[key] ? `${concat} ${query[key]}` : concat;
};

class Controller {
  static getAll(req, res, next) {
    if (
      req.originalUrl.startsWith('/api/v1/books') ||
      req.originalUrl.startsWith('/api/v1/users')
    )
      return next();

    // a user wants to see his rents
    let select = '+book';

    if (req.user.role === 'user' || req.query.mine)
      req.query.user = req.user._id;
    else select = `${select} +user`;

    queryConcat(req.query, 'select', select);
    factory.getAll(req, res, next, {
      sort: '-request -start state',
      extraForbbiden: ['calcNumOfPages', 'mine'],
      limit: 12,
    });
  }

  static getUserRents(req, res, next) {
    if (!req.originalUrl.startsWith('/api/v1/users')) return next();
    const { userId } = req.params;
    req.query.user = userId;
    queryConcat(req.query, 'select', '+book');
    factory.getAll(req, res, next, {
      sort: '-request -start state',
      limit: 12,
    });
  }

  static getBookRents(req, res, next) {
    const { bookId } = req.params;
    req.query.book = bookId;
    queryConcat(req.query, 'select', '+user');
    factory.getAll(req, res, next, {
      sort: '-request -start state',
      limit: 12,
    });
  }

  static getOne(req, res, next) {
    factory.getOne(req, res, next, { isAdmin: true }, (id) =>
      model.findById(id).select('+book +user')
    );
  }

  static insertOne = catchAsync(async (req, res, next) => {
    const { bookId } = req.params;
    const userId = req.user._id;
    const { requestMonth } = req.body;
    if (!bookId || !requestMonth)
      return next(new AppError(400, 'ارسال اطلاعات ناقص است'));
    const { price, reserved, existing } = await bookModel
      .findById(bookId)
      .select('price existing reserved');
    if (!price) return next(new AppError(400, 'ارسال اطلاعات ناقص است'));
    if (reserved || !existing)
      return next(
        new AppError(
          403,
          'برای کتابی که موجود نیست یا رزرو شده نمی  توانید درخواست ارسال کنید'
        )
      );
    if (
      await model.findOne({ book: bookId, user: userId, state: 'sendRequest' })
    )
      return next(new AppError(403, 'شما قبلا درخواست ارسال کرده اید'));

    const data = await model.create({
      book: bookId,
      user: userId,
      price: Math.round((requestMonth * price * 0.04) / 100) * 100 || 1000,
      requestMonth,
    });

    let notifications;
    try {
      notifications = await notificationController.getExactOne(
        req.user,
        BOOK_RECIVED
      );
    } catch (err) {
      console.log(err);
    }

    res.status(201).json({ status: 'success', data, notifications });
  });

  static acceptRejectReq = catchAsync(async (_, res, next, options) => {
    const { id, state } = options;

    //Check if rent state is send request
    let [rentChecked, rent] = await rentChecker(id, 'sendRequest', model);
    if (!rentChecked) return next(rent);

    //Check if book is in database
    let [bookChecked, book] = await bookChecker(rent.book, bookModel);
    if (!bookChecked) return next(book);

    //Chek if we want to acceptRequest is there an available book?
    if (state === 'acceptRequest') {
      if (!book.isAvailable())
        return next(
          new AppError(
            403,
            'این کتاب توسط شخص دیگری رزرو و یا تحویل گرفته شده است و شما نمی توانید درخواست رزرو را تایید کنید'
          )
        );
      book.setAcceptRequest();
      book = await book.save();
    }

    rent.setState(state);
    rent = await rent.save();

    res.status(200).json({ status: 'success', data: { rent, book } });
  });

  static failRenting = catchAsync(async (_, res, next, options) => {
    const { id, state } = options;

    //Check if rent state is send request
    let [rentChecked, rent] = await rentChecker(id, 'acceptRequest', model);
    if (!rentChecked) return next(rent);

    //Check if book is in database
    let [bookChecked, book] = await bookChecker(rent.book, bookModel);
    if (!bookChecked) return next(book);

    book.setFailRenting();
    book = await book.save();

    rent.setState(state);
    rent = await rent.save();

    res.status(200).json({ status: 'success', data: { rent, book } });
  });

  static startRenting = catchAsync(async (_, res, next, options) => {
    const { id, state } = options;

    //Check if rent state is acceptRequest
    let [rentChecked, rent] = await rentChecker(id, 'acceptRequest', model);
    if (!rentChecked) return next(rent);

    //Check if book is in database
    let [bookChecked, book] = await bookChecker(rent.book, bookModel);
    if (!bookChecked) return next(book);

    //Check if user is in database
    let [userChecked, user] = await userChecker(rent.user, userModel);
    if (!userChecked) return next(user);

    //update rent
    rent.setStartRenting(state);
    rent = await rent.save();

    //push user rentings
    user.setStartRenting(rent);
    user = await user.save({ validateBeforeSave: false });

    //set book existing = false
    book.setStartRenting(user._id);
    book = await book.save();

    res.status(200).json({ status: 'success', data: { book, user, rent } });
  });

  static endRenting = catchAsync(async (_, res, next, options) => {
    const { id } = options;

    //Check if rent state is startRenting
    let [rentChecked, rent] = await rentChecker(id, 'startRenting', model);
    if (!rentChecked) return next(rent);

    //Check if book is in database
    let [bookChecked, book] = await bookChecker(rent.book, bookModel);
    if (!bookChecked) return next(book);

    //Check if user is in database
    let [userChecked, user] = await userChecker(rent.user, userModel);
    if (!userChecked) return next(user);

    //update rent
    rent.setEndRenting();
    rent = await rent.save();

    //pull user rentings
    user.setEndRenting(rent);
    user = await user.save({ validateBeforeSave: false });

    //set book existing = true
    book.setEndRenting();
    book = await book.save();

    res.status(200).json({ status: 'success', data: { book, user, rent } });
  });

  static updateOne(req, res, next) {
    const { id } = req.params;
    const { state } = req.body;
    switch (state) {
      case 'acceptRequest':
      case 'rejectRequest':
        Controller.acceptRejectReq(req, res, next, { id, state });
        break;
      case 'startRenting':
        Controller.startRenting(req, res, next, { id, state });
        break;
      case 'endRenting':
        Controller.endRenting(req, res, next, { id, state });
        break;
      case 'failRenting':
        Controller.failRenting(req, res, next, { id, state });
        break;
      default:
        next(new AppError(400, 'بدنه ی درخواست نامعتبر است'));
    }
  }

  static deleteOne = catchAsync(async (req, res, next) => {
    const conditions = {
      _id: req.params.id,
      state: {
        $in: ['endRenting', 'failRenting', 'rejectRequest', 'sendRequest'],
      },
    };
    if (req.user.role === 'user') conditions.user = req.user._id;
    const data = await model.findOne(conditions);

    if (!data)
      return next(
        new AppError(
          403,
          'عملیات کرایه در موقعیت درستی قرار ندارد لذا شما نمی توانید آن را حذف کنید'
        )
      );

    factory.deleteOne(req, res, next);
  });
}

module.exports = Controller;
