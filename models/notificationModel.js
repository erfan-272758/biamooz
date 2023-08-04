const BOOK_RECIVED = 'book-recived';

const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    recivers: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },

    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

schema.pre(/^find/, function (next) {
  this.populate({
    path: 'creator',
    select: 'firstName lastName photo role _id',
  });
  next();
});

const model = mongoose.model('Notification', schema);

module.exports = { model, BOOK_RECIVED };
