module.exports = (fn) => {
  if (fn.length === 3) {
    return (req, res, next) => {
      fn(req, res, next).catch((err) => next(err));
    };
  }
  if (fn.length === 4) {
    return (req, res, next, options) => {
      fn(req, res, next, options).catch((err) => next(err));
    };
  }
  if (fn.length === 5) {
    return (req, res, next, options, callback) => {
      fn(req, res, next, options, callback).catch((err) => next(err));
    };
  }
};
