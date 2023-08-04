/* eslint-disable guard-for-in */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const rentModel = require('./rentModel');

const isPhoneNumber = (val) => val.length === 11 && val.startsWith('09');
const isAlpha = (val) => {
  val = val.replace(/ /g, '');
  // const req = /[^آ-ی]/g;
  return true;
};
const schema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: [true, 'شناسه کاربر (کد ملی) باید یکتا باشد'],
      required: [true, 'هر کاربر باید کد ملی داشته باشد'],
      trim: true,
      validate: [
        (val) => validator.isIdentityCard(val, 'IR'),
        'کد ملی باید تنها شامل اعداد بشود و 10 رقم باشد',
      ],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: [true, 'باید ایمیل هر کاربر یکتا باشد'],
      required: [true, 'هر کاربر باید ایمیل داشته باشد'],
      validate: {
        validator: validator.isEmail,
        message: 'ایمیل نادرست می باشد',
      },
    },
    password: {
      type: String,
      trim: true,
      required: [true, 'رمز نیاز است'],
      minLength: [8, 'رمز باید از 8 کاراکتر بیشتر باشد'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      trim: true,
      required: [true, 'رمز نیاز است'],
      validate: {
        validator: function (cpass) {
          return this.password === cpass;
        },
        message: 'رمز و تکرار آن باهم برابر نیستند',
      },
      select: false,
    },
    passwordChangeAt: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: { type: Date, select: false },
    firstName: {
      type: String,
      required: [true, 'نام برای هر کاربر نیاز است'],
      trim: true,
      minLength: [
        3,
        'اسم ها باید از 3 کاراکتر بیشتر و از 20 کاراکتر کمتر باشد',
      ],
      maxLength: [
        20,
        'اسم ها باید از 3 کاراکتر بیشتر و از 20 کاراکتر کمتر باشد',
      ],
      validate: [isAlpha, 'اسم ها باید فقط شامل حروف باشد'],
    },
    lastName: {
      type: String,
      required: [true, 'نام خانوادگی برای هر کاربر نیاز است'],
      trim: true,
      minLength: [
        3,
        'اسم ها باید از 3 کاراکتر بیشتر و از 20 کاراکتر کمتر باشد',
      ],
      maxLength: [
        20,
        'اسم ها باید از 3 کاراکتر بیشتر و از 20 کاراکتر کمتر باشد',
      ],
      validate: [isAlpha, 'اسم ها باید فقط شامل حروف باشد'],
    },
    parentName: {
      type: String,
      required: [true, 'نام والدین برای هر کاربر نیاز است'],
      trim: true,
      minLength: [
        3,
        'اسم ها باید از 3 کاراکتر بیشتر و از 20 کاراکتر کمتر باشد',
      ],
      maxLength: [
        20,
        'اسم ها باید از 3 کاراکتر بیشتر و از 20 کاراکتر کمتر باشد',
      ],
      validate: [isAlpha, 'اسم ها باید فقط شامل حروف باشد'],
    },
    address: {
      type: String,
      trim: true,
      required: [true, 'آدرس نیاز است'],
      maxLength: [100, 'آدرس باید کمتر از 100 و بیش تر از 10 کاراکتر باشد'],
      minLength: [10, 'آدرس باید کمتر از 100 و بیش تر از 10 کاراکتر باشد'],
    },
    personalPhone: {
      type: String,
      validate: [isPhoneNumber, 'تلفن معتبر نمی باشد'],
      trim: true,
      required: [true, 'تلفن شخصی نیاز است.'],
      unique: [true, 'تلفن شخصی باید یکتا باشد'],
    },
    familyPhone: {
      type: String,
      trim: true,
      validate: [isPhoneNumber, 'تلفن معتبر نمی باشد'],
      required: [true, 'تلفن والدین نیاز است.'],
    },

    schoolName: {
      type: String,
      required: [true, 'نام مدرسه برای هر کاربر نیاز است'],
      trim: true,
      minLength: [
        3,
        'اسم ها باید از 3 کاراکتر بیشتر و از 50 کاراکتر کمتر باشد',
      ],
      maxLength: [
        50,
        'اسم ها باید از 3 کاراکتر بیشتر و از 50 کاراکتر کمتر باشد',
      ],
      validate: [isAlpha, 'اسم ها باید فقط شامل حروف باشد'],
    },
    createdAt: { type: Date, default: Date.now },
    rentings: [
      {
        book: {
          type: mongoose.Schema.ObjectId,
          ref: 'Book',
          required: true,
        },
        price: { type: Number, required: true },
        start: { type: Date, required: true },
        end: { type: Date, required: true },
      },
    ],
    photo: { type: String, default: 'img/users/user.png' },
    role: {
      type: String,
      enum: {
        values: ['user', 'user-admin', 'admin'],
        message: 'نقش به درستی انتخاب نشده است',
      },
      default: 'user',
    },
    active: {
      type: Boolean,
      default: true,
    },
    box: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

schema.methods.checkPassword = async function (pass = '') {
  return await bcrypt.compare(pass, this.password);
};
schema.methods.checkChangePassword = function (time) {
  return parseInt(this.passwordChangeAt / 1000, 10) > time + 2;
};

schema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

schema.methods.setStartRenting = function (rent) {
  if (!this.rentings) this.rentings = [];
  this.rentings.push({
    book: rent.book,
    start: rent.start,
    end: rent.end,
    price: rent.price,
  });
};

schema.methods.setEndRenting = function (rent) {
  this.rentings = this.rentings.filter(
    (renting) =>
      !(
        `${renting.book.id}` === `${rent.book}` &&
        renting.start.getTime() === rent.start.getTime() &&
        renting.end.getTime() === rent.end.getTime()
      )
  );
};

schema.methods.convert = function () {
  const user = this._doc;
  if (user.box !== undefined) user.box = user.box.toLocaleString('fa-IR');
  if (user.username) {
    user.realUsername = user.username;
    user.username = (+user.username).toLocaleString('fa-IR').replace(/٬/g, '');
  }
  if (user.personalPhone) {
    user.realPersonalPhone = user.personalPhone;
    user.personalPhone = `۰${(+user.personalPhone)
      .toLocaleString('fa-IR')
      .replace(/٬/g, '')}`;
  }

  if (user.familyPhone) {
    user.realFamilyPhone = user.familyPhone;
    user.familyPhone = `۰${(+user.familyPhone)
      .toLocaleString('fa-IR')
      .replace(/٬/g, '')}`;
  }

  if (user.rentings && user.rentings.length > 0) {
    user.rentings.map((rent) => {
      if (!rent._id) return rent;
      rent = rent._doc;
      ['end', 'start'].forEach((k) => {
        rent[k] = rent[k].toLocaleString('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: '2-digit',
        });
      });
      rent.price = rent.price.toLocaleString('fa-IR');
      if (rent.book && rent.book._id) {
        rent.book = rent.book._doc;
        rent.book.year = rent.book.year
          .toLocaleString('fa-IR')
          .replace(/٬/g, '');
      }
      return rent;
    });
  }
  return user;
};

schema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    this.passwordChangeAt = Date.now();
  }
  next();
});

schema.pre('findOne', function (next) {
  this.populate({ path: 'rentings.book', select: '-__v -summery' });
  next();
});

let requestsList;

schema.post('findOne', async (doc, next) => {
  if (!doc) return next();

  doc.queryFindOne = true;
  const data = await rentModel
    .find({ user: doc._id, state: 'sendRequest' })
    .select('book');
  requestsList = Array.from(data).map((d) => d.book);
  next();
});

schema.virtual('requestsList').get(function () {
  if (!this.queryFindOne) return;
  return requestsList;
});

schema.index({
  lastName: 1,
  firstName: 1,
});

schema.index({ createdAt: -1, active: -1 });

const model = mongoose.model('User', schema);

module.exports = model;
