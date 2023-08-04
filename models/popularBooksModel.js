const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    count: Number,
    book: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
      name: String,
      publisher: String,
      major: String,
      year: Number,
      image: [String],
      existing: Boolean,
      reserved: Boolean,
      price: Number,
      createdAt: Date,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

schema.index({
  'book.publisher': 1,
  'book.major': 1,
  'book.existing': -1,
  'book.reserved': -1,
  'book.name': 1,
});
schema.index({
  'book.major': 1,
  'book.existing': -1,
  'book.reserved': -1,
  'book.name': 1,
});
schema.index({
  'book.createdAt': -1,
  'book.existing': -1,
  'book.reserved': -1,
});

const model = mongoose.model('PopularBooks', schema);
module.exports = model;
