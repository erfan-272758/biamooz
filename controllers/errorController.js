const setValidationError = (err) => {
  err.statusCode = 400;
  const arr = Object.keys(err.errors).map((k) => err.errors[k].message);
  return [...new Set(arr)].join(' , ');
};

const setDuplicateError = (err) => {
  err.statusCode = 400;
  const arr = [];
  if (err.message.includes('username')) arr.push('کد ملی');
  if (err.message.includes('email')) arr.push('ایمیل');
  if (err.message.includes('personalPhone')) arr.push('تلفن شخصی');
  return `${arr.join(' ، ')} باید یکتا باشد.`;
};

class Handlers {
  static _productHandler(req, res, next, err) {
    if (!req.originalUrl.startsWith('/api'))
      return res.render('error', {
        title: err.statusCode || 500,
        message: err.message,
      });

    if (err.appError) {
      res
        .status(err.statusCode)
        .json({ status: 'fail', message: err.message, error: err });
    } else {
      let { message } = err;
      if (err.name === 'ValidationError') message = setValidationError(err);
      if (err.code === 11000) message = setDuplicateError(err);
      if (!err.statusCode || err.statusCode === 500)
        message = 'مشکلی پیش آمده است لطفا دوباره تلاش کنید';
      res
        .status(err.statusCode || 500)
        .json({ status: 'fail', message, error: err });
    }
  }

  static _developHandler(req, res, next, err) {
    console.log(err);
    res
      .status(err.statusCode || 500)
      .json({ status: 'fail', message: err.message, error: err });
  }

  static errorHandler(err, req, res, next) {
    if (process.env.NODE_ENV === 'production')
      Handlers._productHandler(req, res, next, err);
    if (process.env.NODE_ENV === 'development')
      Handlers._developHandler(req, res, next, err);
  }
}

module.exports = Handlers.errorHandler;
