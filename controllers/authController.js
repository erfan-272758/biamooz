const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const model = require('../models/userModel');
const { filterBody } = require('../utils/helperFactory')();
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const SendEmail = require('../utils/sendEmail');

const createSendToken = (req, res, user, code = 200) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') options.secure = req.secure;
  res.cookie('jwt', token, options);

  user.password = undefined;
  user.passwordChangeAt = undefined;

  res.status(code).json({
    status: 'success',
    token,
    user,
  });
};

const createUrl = (req, url) => `${process.env.EMAIL_URL}/${url}`;

class Controller {
  static signup = catchAsync(async (req, res, next) => {
    filterBody(
      req.body,
      'passwordChangeAt',
      'passwordResetToken',
      'passwordResetExpires',
      'createdAt',
      'rentings',
      'role',
      'active',
      'box'
    );
    const user = await model.create(req.body);
    try {
      await new SendEmail(user, createUrl(req, req, 'my')).welcome();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.log(err);
    }
    createSendToken(req, res, user, 201);
  });

  static login = catchAsync(async (req, res, next) => {
    const token = await Controller.isLogIn(req, res);
    if (token)
      return res.json({
        status: 'success',
        message: 'شما در حال حاضر وارد شده اید',
        token,
        user: req.user,
      });
    const username = req.body.username || req.body.email;
    if (!username || !req.body.password)
      return next(new AppError(400, 'نام کاربری یا رمز عبور را وارد کنید'));
    const user = await model
      .findOne({ $or: [{ email: username }, { username }] })
      .select('+password');
    if (!user || !(await user.checkPassword(req.body.password)))
      return next(new AppError(404, 'نام کاربری یا رمز عبور اشتباه است'));
    createSendToken(req, res, user);
  });

  static logout(req, res, next) {
    const options = { expires: new Date(Date.now() + 1 * 500), httpOnly: true };
    res.cookie('jwt', 'loggedout', options);
    res.json({ status: 'success', token: null });
  }

  static protect = catchAsync(async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    )
      token = req.headers.authorization.split(' ')[1];
    else token = req.cookies.jwt;
    if (!token || token === 'null' || token === 'undefined')
      return next(new AppError(401, 'لطفا ابتدا وارد شوید'));
    const decode = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET_KEY
    );
    if (!decode || !decode.id)
      return next(new AppError(401, 'لطفا ابتدا وارد شوید'));
    const currentUser = await model
      .findById(decode.id)
      .select('+passwordChangeAt');
    if (
      !currentUser ||
      currentUser.checkChangePassword(decode.iat) ||
      !currentUser.active
    )
      return next(
        new AppError(
          401,
          'اطلاعات اشتباه می باشد یا رمز به تازگی تغییر پیدا کرده است لطفا دوباره وارد شوید'
        )
      );
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  });

  static isLogIn = async (req, res, role = ['admin', 'user-admin', 'user']) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    )
      token = req.headers.authorization.split(' ')[1];
    else token = req.cookies.jwt;
    if (!token || token === 'null' || token === 'undefined') return false;
    try {
      const decode = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET_KEY
      );
      if (!decode || !decode.id) return false;
      const currentUser = await model
        .findById(decode.id)
        .select('+passwordChangeAt');
      if (
        !currentUser ||
        currentUser.checkChangePassword(decode.iat) ||
        !currentUser.active
      )
        return false;
      if (!role.includes(currentUser.role)) return false;

      currentUser.passwordChangeAt = undefined;
      req.user = currentUser;
      res.locals.user = currentUser;
      return token;
    } catch (err) {
      return false;
    }
  };

  static checkLogin(role = ['user', 'user-admin', 'admin']) {
    return async (req, res, next) => {
      await Controller.isLogIn(req, res, role);
      next();
    };
  }

  static restrictTo(...acceptes) {
    return (req, res, next) => {
      if (!acceptes.includes(req.user.role))
        return next(new AppError(403, 'شما اجازه دسترسی به این بخش را ندارید'));
      next();
    };
  }

  static forgotPassword = catchAsync(async (req, res, next) => {
    const { username, email } = req.body;
    if (!username || !email)
      return next(new AppError(400, 'ایمیل و نام کاربری را باید وارد کنید'));
    const user = await model.findOne({ username, email });
    if (!user)
      return next(new AppError(404, 'هیچ کاربری با این مشخصات یافت نشد'));
    const resetToken = user.createResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      await new SendEmail(
        user,
        createUrl(req, `resetPassword/${resetToken}`)
      ).forgotPassword();
      res.json({
        status: 'success',
        message: 'لینک بازیابی رمز به ایمیل کاربر ارسال شد',
      });
    } catch (err) {
      if (process.env.NODE_ENV === 'development')console.log(err);
      res.status(500).json({
        status: 'fail',
        message: 'دوباره تلاش کنید مشکلی پیش آمده است',
      });
    }
  });

  static resetPassword = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const { password, passwordConfirm } = req.body;
    if (!token)
      return next(new AppError(400, 'بدون کلید اجازه تغییر رمز ندارید'));
    if (!password || !passwordConfirm)
      return next(new AppError(400, 'رمز جدید را به همراه تکرار آن وارد کنید'));
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    const user = await model.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user)
      return next(
        new AppError(
          400,
          'کلید نامعتبر است یا از زمان آن گذشته است دوباره اقدام به بازیابی رمز عبور کنید'
        )
      );
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    createSendToken(req, res, user);
  });

  static _updateMyPasswordAdmin = catchAsync(async (req, res, next, user) => {
    if (req.user.password !== req.user.passwordConfirm)
      return next(new AppError(400, 'رمز و تکرار آن یکسان نیست'));
    await req.user.save({ validateBeforeSave: false });
    createSendToken(req, res, user);
  });

  static updateMyPassword = catchAsync(async (req, res, next) => {
    const { password, passwordConfirm, passwordCurrent } = req.body;
    if (!password || !passwordConfirm || !passwordCurrent)
      return next(
        new AppError(400, 'رمز فعلی ، رمز جدید و تکرار آن را وارد کنید')
      );
    const user = await model.findById(req.user._id).select('+password');
    if (!(await user.checkPassword(passwordCurrent)))
      return next(new AppError(401, 'رمز فعلی اشتباه می باشد'));
    req.user.password = password;
    req.user.passwordConfirm = passwordConfirm;
    if (user.role === 'admin')
      return Controller._updateMyPasswordAdmin(req, res, next, user);
    await req.user.save();
    createSendToken(req, res, user);
  });
}
module.exports = Controller;
