const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
  },
  activity: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

schema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName photo role active personalPhone',
  });
  // .populate({
  //   path: 'book',
  //   select: 'name image reserved existing',
  // });
  next();
});

const model = mongoose.model('Editor', schema);
module.exports = model;
