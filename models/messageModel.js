const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxLength: [300, 'پیام نمی  تواند بیش از 300 کاراکتر داشته باشد'],
    },
  },
  {
    timestamps: true,
  }
);

schema.pre(/^find/, function (next) {
  this.populate({
    path: 'sender',
    select: 'firstName lastName photo role _id',
  });
  next();
});

const model = mongoose.model('Message', schema);

module.exports = { model };
