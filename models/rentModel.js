const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    start: {
      type: Date,
    },
    end: {
      type: Date,
    },
    delay: {
      // dayes
      type: Number,
      min: [0, 'تاخیر نمی تواند منفی باشد'],
    },
    request: {
      type: Date,
      default: Date.now,
    },
    requestMonth: {
      type: Number,
      min: 2,
      max: 12,
      validate: [(v) => Number.isInteger(v), 'ماه باید عدد صحیح باشد'],
      required: true,
    },
    price: {
      type: Number,
      min: [0, 'قیمت کرایه باید مثبت باشد'],
      required: true,
    },
    penalty: {
      type: Number,
      min: [0, 'جریمه نمی تواند منفی باشد'],
    },
    state: {
      type: String,
      enum: {
        values: [
          'sendRequest',
          'acceptRequest',
          'rejectRequest',
          'startRenting',
          'endRenting',
          'failRenting',
        ],
      },
      default: 'sendRequest',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

schema.methods.setState = function (state) {
  this.state = state;
};

schema.methods.setStartRenting = function (state) {
  this.setState(state);
  this.start = Date.now();
  this.end = Date.now() + this.requestMonth * 3600 * 24 * 1000 * 30;
};

schema.methods.setEndRenting = function () {
  this.delay =
    Date.now() > this.end
      ? parseInt((Date.now() - this.end) / (1000 * 60 * 60 * 24), 10)
      : 0;

  this.penalty =
    Math.round((this.delay * this.price * 0.1) / (this.requestMonth * 100)) *
      100 || 0;
  this.state = 'endRenting';
};

schema.methods.convert = function () {
  const rent = { ...this._doc };
  ['request', 'end', 'start'].forEach((k) => {
    if (!rent[k]) return;
    rent[k] = this[k].toLocaleString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    });
  });
  if (rent.requestMonth)
    rent.requestMonth = rent.requestMonth.toLocaleString('fa-IR');
  if (!rent.start) rent.end = `${rent.requestMonth} ماه بعد از دریافت`;
  if (rent.price !== undefined) rent.price = rent.price.toLocaleString('fa-IR');
  if (rent.delay !== undefined)
    rent.delay = rent.delay.toLocaleString('fa-IR').replace(/٬/g, '');
  if (rent.penalty !== undefined)
    rent.penalty = rent.penalty.toLocaleString('fa-IR');

  if (rent.user && rent.user._id) {
    rent.user = { ...rent.user._doc };
    if (rent.user.personalPhone)
      rent.user.personalPhone = `۰${(+rent.user.personalPhone)
        .toLocaleString('fa-IR')
        .replace(/٬/g, '')}`;
    if (rent.user.box !== undefined)
      rent.user.box = rent.user.box.toLocaleString('fa-IR');
  }
  if (rent.book && rent.book._id) {
    rent.book = { ...rent.book._doc };
    if (rent.book.year)
      rent.book.year = rent.book.year.toLocaleString('fa-IR').replace(/٬/g, '');
    if (rent.book.price !== undefined)
      rent.book.price = rent.book.price.toLocaleString('fa-IR');
  }
  return rent;
};

schema.pre(/^find/, function (next) {
  if (!this._fields) return next();
  if (this._fields['+book'] === 1)
    this.populate({
      path: 'book',
      select: 'name image reserved existing price year',
    });
  if (this._fields['+user'] === 1)
    this.populate({
      path: 'user',
      select: 'firstName lastName photo role active personalPhone box',
    });
  next();
});

schema.index({ book: 1, user: 1, request: -1, state: 1 });
schema.index({ user: 1, request: -1 });
schema.index({ state: 1, start: -1, request: -1 });

const model = mongoose.model('Rent', schema);
module.exports = model;
