const AppError = require('./appError');

// const getContentType = (headers) =>
//   headers['content-type'] ||
//   headers['Content-type'] ||
//   headers['content-Type'] ||
//   headers['Content-Type'];

exports.bookChecker = async (bookId, bookModel) => {
  if (!bookId) return [false, new AppError(400, 'ارسال اطلاعات ناقص است')];
  const book = await bookModel
    .findById(bookId)
    .select('reserved existing name image +renter price year');
  if (!book) return [false, new AppError(404, 'کتاب مورد نظر یافت نشد')];
  return [true, book];
};

exports.userChecker = async (userId, userModel) => {
  if (!userId) return [false, new AppError(400, 'ارسال اطلاعات ناقص است')];
  const user = await userModel
    .findOne({ _id: userId, active: true })
    .select('firstName lastName photo role active rentings box personalPhone');
  if (!user) return [false, new AppError(404, 'کاربر فعالی یافت نشد')];
  return [true, user];
};

exports.rentChecker = async (rentId, rentState, rentModel) => {
  if (!rentId) return [false, new AppError(400, 'ارسال اطلاعات ناقص است')];
  const rent = await rentModel.findOne({ _id: rentId, state: rentState });
  if (!rent)
    return [
      false,
      new AppError(
        404,
        'کرایه برای تغییر یافت نشد یا وضعیت کرایه تغییر کرده است و یا اطلاعات اشتباه است'
      ),
    ];
  return [true, rent];
};
