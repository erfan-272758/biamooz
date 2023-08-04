/* eslint-disable no-multi-assign */
const bookModel = require('../models/bookModel');
const userModel = require('../models/userModel');
const rentModel = require('../models/rentModel');
const bookFactory = require('../utils/helperFactory')(bookModel);
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { isLogIn } = require('./authController');

class Controller {
  static async overview(req, res, next) {
    const callback = (rq, rs, nt, books, numOfPages) => {
      rs.render('overview', {
        books,
        numOfPages,
        // name: rq.query.name,
        // page: rq.query.page,
        // query: rq.query,
      });
    };

    // req.query.page = req.params.page || 1;
    req.query.page = 1;
    req.query.limit = req.query.limit || 24;
    if (req.query.page === 1) req.query.calcNumOfPages = 'true';
    bookFactory.getAll(req, res, next, {
      notSend: true,
      sort: '-existing reserved -createdAt',
      select: '-__v -summery -price',
      callback,
    });
  }

  static _getOneBookAdmin(id, role) {
    const select = role === 'admin' ? '+editors' : '';
    return bookModel.findById(id).select(`${select} +renter`);
  }

  static async getOneBook(req, res, next) {
    const callback = (rq, rs, nt, book) => {
      let isSendRequest;
      if (!req.user) isSendRequest = false;
      else
        isSendRequest = req.user.requestsList.some(
          (id) => id.toString() === book.id
        );
      const map = new Map();
      map.set(book.level, 'selected');
      map.set(book.major, 'selected');
      map.set(book.publisher, 'selected');
      rs.render('book', {
        title: `کتاب ${book.name}`,
        book: book.convert(),
        // book: book,
        isSendRequest,
        map,
      });
    };

    const hasRole = await isLogIn(req, res, ['admin', 'user-admin']);
    const options = {
      isAdmin: hasRole && req.user.role === 'admin',
      isUserAdmin: hasRole && req.user.role === 'user-admin',
      notSend: true,
      callback,
    };
    bookFactory.getOne(req, res, next, options, Controller._getOneBookAdmin);
  }

  static signup(req, res, next) {
    if (req.user) return res.redirect('/');
    res.render('signup', { title: 'ثبت نام' });
  }

  static login(req, res, next) {
    if (req.user) return res.redirect('/');
    res.render('login', { title: 'ورود' });
  }

  static logout(req, res, next) {
    if (!req.user) return res.redirect('/');
    const options = { expires: new Date(Date.now() + 1 * 500), httpOnly: true };
    res.cookie('jwt', 'loggedout', options);
    res.redirect('/');
  }

  static account(req, res, next) {
    res.locals.user = res.locals.user.convert();
    res.render('account', { title: 'پروفایل' });
  }

  static getOneUser = catchAsync(async (req, res, next) => {
    const userVisiting = await userModel.findById(req.params.id);
    if (!userVisiting)
      return next(new AppError(404, 'کاربر مورد نظر یافت نشد'));
    const map = new Map();
    map.set(userVisiting.role, 'selected');
    map.set(`${userVisiting.active}`, 'selected');
    res.render('user', {
      title: userVisiting.firstName,
      userVisiting: userVisiting.convert(),
      map,
    });
  });

  static getOneRent = catchAsync(async (req, res, next) => {
    const rent = await rentModel.findById(req.params.id).select('+book +user');
    if (!rent) return next(new AppError(404, 'کرایه مورد نظر یافت نشد'));
    let stateMessage;
    let acceptButton;
    let rejectButton;
    let isRejectButton = false;
    let isAcceptButton = false;
    switch (rent.state) {
      case 'sendRequest':
        stateMessage = 'کاربر درخواست داده است  در انتظار تایید...';
        isAcceptButton = isRejectButton = true;
        acceptButton = 'تایید درخواست';
        rejectButton = 'رد درخواست';
        break;
      case 'acceptRequest':
        stateMessage = 'درخواست قبول شده است در انتظار دریافت...';
        isAcceptButton = isRejectButton = true;
        acceptButton = 'شروع کرایه';
        rejectButton = 'خطایی رخ داد';
        break;
      case 'rejectRequest':
        stateMessage = 'درخواست رد شده است.';
        break;
      case 'failRenting':
        stateMessage = 'کرایه با خطا مواجه شده است';
        break;
      case 'startRenting':
        stateMessage = 'کرایه داده شده در انتظار تحویل...';
        isAcceptButton = true;
        acceptButton = 'پایان کرایه';
        break;
      case 'endRenting':
        stateMessage = 'کرایه به پایان رسیده است.';
        break;
      default:
        return next(new AppError(500, 'مشکلی پیش آمده است'));
    }

    res.render('rent', {
      title: 'کرایه',
      rent: rent.convert(),
      stateMessage,
      isAcceptButton,
      isRejectButton,
      acceptButton,
      rejectButton,
    });
  });

  static forgotPassword(req, res, next) {
    if (req.user) return res.redirect('/');
    res.render('forgot-password', { title: 'فراموشی رمز عبور' });
  }

  static resetPassword(req, res, next) {
    res.render('reset-password', { title: 'بازیابی رمز عبور' });
  }
}

module.exports = Controller;
