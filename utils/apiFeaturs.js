/* eslint-disable no-proto */
// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');

class ApiFeature {
  /**
   *
   * @param {mongoose.Query} query
   * @param {*} options
   */
  constructor(query, options) {
    this.query = query;
    this.options = options || {};
  }

  _concat(fields = '', concat, except) {
    if (!concat) return fields;
    if (typeof fields === 'string')
      return fields
        .split(' ')
        .map((val) => {
          if (val === except) return val;
          const sign = val[0] === '-' || val[0] === '+' ? val[0] : '';
          return `${sign}${concat}.${sign ? val.slice(1) : val}`;
        })
        .join(' ');

    const entries = Object.entries(fields).map(([key, val]) => {
      if (key === except) return [key, val];
      return [`${concat}.${key}`, val];
    });
    return Object.fromEntries(entries);
  }

  static newInstance(query, options) {
    return new ApiFeature(query, options);
  }

  sort(sort = '-createdAt', concat = '', except = '') {
    let fields = this.options.sort;
    if (fields) {
      fields = fields.replace(/,/g, ' ');
    } else fields = sort;
    this.query.sort(this._concat(fields, concat, except));
    return this;
  }

  static _setRegExp(fields, key) {
    if (
      fields[key] !== undefined &&
      [
        'name',
        'firstName',
        'lastName',
        'parentName',
        'username',
        'email',
        'major',
        'personalPhone',
        'familyPhone',
        'address',
      ].includes(key)
    ) {
      if (typeof fields[key] === 'string')
        fields[key] = new RegExp(fields[key]);
      else if (fields[key].__proto__ === Array.prototype)
        fields[key] = fields[key].map((val) => new RegExp(val));
    }
  }

  // /.*m.*/
  filter(extraForbbiden, concat = '', except = '') {
    let fields = JSON.stringify(this.options);
    fields = fields.replace(/\b(gt|gte|lte|lt|ne)\b/g, (match) => `$${match}`);
    fields = JSON.parse(fields);

    let forbbiden = ['sort', 'page', 'select', 'limit', 'notConvert'];
    if (extraForbbiden) forbbiden = forbbiden.concat(extraForbbiden);

    Object.keys(fields).forEach((key) => {
      //delete forbbiden
      if (forbbiden.includes(key)) delete fields[key];

      //insert RegExp
      ApiFeature._setRegExp(fields, key);
    });
    this.query.find(this._concat(fields, concat, except));
    return this;
  }

  select(select = '-__v', concat = '', except = '') {
    let fields = this.options.select;
    if (fields)
      fields = fields.replace(/(password|Password)/g, '').replace(/,/g, ' ');
    else fields = select;
    this.query.select(this._concat(fields, concat, except));
    return this;
  }

  paginate(
    llimit = process.env.LIMIT_ITEM_SHOW,
    maxLimit = process.env.MAX_LIMIT_ITEM_SHOW
  ) {
    let { page, limit } = this.options;
    if (!limit) limit = llimit;
    if (limit > maxLimit) limit = maxLimit;
    if (!page) page = 1;
    const skip = (page - 1) * limit;
    this.query.skip(skip).limit(+limit);
    return this;
  }
}

module.exports = ApiFeature.newInstance;
