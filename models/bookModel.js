const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'هر کتاب باید یک نام داشته باشد'],
      maxLength: [40, 'هر کتاب باید حداکثر 40 حرف داشته باشد'],
      minLength: [2, 'هر کتاب باید حداقل 2 حرف داشته باشد'],
      trim: true,
    },
    level: {
      type: String,
      enum: {
        values: ['دهم', 'یازدهم', 'پایه', 'دوازدهم', 'جامع'],
        message: 'مقدار پایه معتبر نیست',
      },
      required: [true, 'هر کتاب باید یک پایه معتبر داشته باشد'],
    },
    publisher: {
      type: String,
      enum: {
        values: [
          'خیلی سبز',
          'گاج',
          'مهر و ماه',
          'نشر الگو',
          'دیگر',
          'نشر دریافت',
          'کانون قلمچی',
          'مبتکران',
          'خوشخوان',
          'سفیر خرد',
          'فار',
        ],
        message:
          'انتشارات باید یکی از حالات زیر باشد:\nخیلی سبز ، نشر الگو ، مبتکران ، نشر دریافت ، کانون قلمچی ، گاج ، مهر و ماه ،سفیر خرد ، خوشخوان ، فار ، دیگر',
      },
      default: 'دیگر',
    },
    major: {
      type: String,
      enum: {
        values: [
          'ریاضی',
          'تجربی',
          'انسانی',
          'عمومی',
          'ریاضی-تجربی',
          'کتابچه عمومی',
          'کتابچه تخصصی',
        ],
        message:
          "رشته باید یکی از حالات زیر  باشد:\n'ریاضی','تجربی','انسانی','عمومی','ریاضی-تجربی','کتابچه عمومی','کتابچه تخصصی'",
      },
      required: [true, 'هر کتاب باید یک رشته داشته باشد'],
    },
    year: {
      type: Number,
      min: [1300, 'سال باید از 1300 بیشتر باشد'],
      max: [10000, 'سال باید از 10000 کمتر باشد'],
      required: [true, 'هر کتاب باید یک سال انتشار داشته باشد'],
    },
    image: { type: [String], default: ['img/books/book.png'] },
    existing: {
      type: Boolean,
      default: true,
    },
    reserved: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: [true, 'هر کتاب باید قیمت داشته باشد'],
      min: [0, 'قیمت باید مثبت باشد'],
    },
    summery: {
      type: String,
      maxLength: [300, 'توضیحات باید از 300 کاراکتر کمتر باشند.'],
    },
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      select: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// schema.pre('find', function (next) {
//   if (!this._fields) return next();
//   let isInclusion = false;
//   Object.keys(this._fields).forEach((key) => {
//     if (this._fields[key] === 1) isInclusion = true;
//   });
//   if (!isInclusion || this._fields.editors)
//     return next();
//   });

schema.methods.isAvailable = function () {
  return this.existing && !this.reserved;
};
schema.methods.setAcceptRequest = function () {
  this.reserved = true;
};
schema.methods.setFailRenting = function () {
  this.reserved = false;
};
schema.methods.setStartRenting = function (id) {
  this.reserved = false;
  this.existing = false;
  this.renter = id;
};
schema.methods.setEndRenting = function () {
  this.reserved = false;
  this.existing = true;
  this.renter = null;
};

schema.methods.convert = function () {
  const book = {
    ...this._doc,
    editors: this.editors,
  };
  if (book.year) {
    book.realYear = book.year;
    book.year = book.year.toLocaleString('fa-IR').replace(/٬/g, '');
  }
  if (book.price !== undefined) {
    book.realPrice = book.price;
    book.defualtPrice = (
      Math.round((0.04 * 2 * book.price) / 100) * 100 || 1000
    ).toLocaleString('fa-IR');
    book.price = book.price.toLocaleString('fa-IR');
  }

  if (book.renter && book.renter._id) {
    book.renter = book.renter._doc;
    book.renter.personalPhone = `۰${(+book.renter.personalPhone)
      .toLocaleString('fa-IR')
      .replace(/٬/g, '')}`;
  }
  if (book.editors && book.editors.length > 0) {
    book.editors = book.editors.map((editor) => {
      editor = editor._doc;
      editor.user.personalPhone = `۰${(+editor.user.personalPhone)
        .toLocaleString('fa-IR')
        .replace(/٬/g, '')}`;
      editor.createdAt = editor.createdAt.toLocaleString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
      });
      return editor;
    });
  }
  return book;
};

schema.virtual('editors', {
  ref: 'Editor',
  localField: '_id',
  foreignField: 'book',
});
schema.pre('findOne', function (next) {
  if (!this._fields) return next();
  if (this._fields['+editors'] === 1)
    this.populate({ path: 'editors', select: 'user createdAt activity' });
  if (this._fields['+renter'] === 1)
    this.populate({
      path: 'renter',
      select: 'firstName lastName photo role active personalPhone',
    });
  next();
});

schema.index({ publisher: 1, major: 1, existing: -1, reserved: -1, name: 1 });
schema.index({ major: 1, existing: -1, reserved: -1, name: 1 });
schema.index({ createdAt: -1, existing: -1, reserved: -1 });

const model = mongoose.model('Book', schema);
module.exports = model;
