/* eslint-disable no-proto */
const rentModel = require('../models/rentModel');
const bookModel = require('../models/bookModel');
const popBooksModel = require('../models/popularBooksModel');
const userModel = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('../utils/helperFactory')(popBooksModel);

const createSort = (sort = '') => {
  const str = sort
    .split(',')
    .map((s) => {
      if (!s) return;
      let value = 1;
      if (s.startsWith('-')) {
        value = -1;
        s = s.slice(1);
      }
      return `"${s}":${value}`;
    })
    .join(',');
  let obj = JSON.parse(`{${str}}`);
  if (Object.keys(obj).length === 0) obj = { _id: 1 };
  return obj;
};

const createState = (state = '') => {
  if (!state) return 'endRenting';
  const str = state
    .split(',')
    .map((value) => `"${value}"`)
    .join(',');
  return JSON.parse(`{"$in":[${str}]}`);
};

const createYear = (year = '') => {
  if (!+year || !Number.isInteger(+year)) return `${new Date().getFullYear()}`;
  return year;
};

const populate = async (stats, key, newKey, model, select = '') => {
  const promises = stats.map(async (stat) => {
    if (stat[key].__proto__ !== Array.prototype) {
      //init new key
      stat[newKey] = await model.findById(stat[key]).select(select);

      //remove old key
      if (key !== newKey) delete stat[key];
    } else {
      const ps = stat[key].map((id) => model.findById(id).select(select));

      //init new key
      stat[newKey] = await Promise.all(ps);

      //remove old key
      if (key !== newKey) delete stat[key];
    }
    return stat;
  });
  return await Promise.all(promises);
};

class Controller {
  static rentPerMonth = catchAsync(async (req, res, next) => {
    const sort = createSort(req.query.sort || '_id');
    const state = createState(req.query.state);
    const year = createYear(req.query.year);
    const { notPopulate: noPop } = req.query;
    let stats = await rentModel.aggregate([
      {
        $match: {
          start: {
            $gt: new Date(year),
            $lt: new Date(`${+year + 1}`),
          },
          state,
        },
      },
      {
        $group: {
          _id: { $month: '$start' },
          rentIds: { $push: '$_id' },
          count: { $sum: 1 },
          totalPrice: { $sum: '$price' },
          totalPenalty: { $sum: '$penalty' },
          avgPenalty: { $avg: '$penalty' },
          avgDelay: { $avg: '$delay' },
        },
      },
      { $sort: sort },
    ]);

    if (!noPop)
      stats = await populate(
        stats,
        'rentIds',
        'rents',
        rentModel,
        '+user +book'
      );

    res.json({ status: 'success', stats });
  });

  static mostPenaltiesUsers = catchAsync(async (req, res, next) => {
    const sort = createSort(req.query.sort || '-totalPenalty');
    const year = createYear(req.query.year);
    const { notPopulate: noPop, limit } = req.query;

    let stats = await rentModel.aggregate([
      {
        $match: {
          penalty: { $gt: 0 },
          start: {
            $gt: new Date(year),
            $lt: new Date(`${+year + 1}`),
          },
        },
      },
      {
        $group: {
          _id: '$user',
          rents: { $push: '$_id' },
          totalPenalty: { $sum: '$penalty' },
          avgPenalty: { $avg: '$penalty' },
          avgDelay: { $avg: '$delay' },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          totalPenalty: { $gt: 0 },
        },
      },
      {
        $sort: sort,
      },
      { $limit: +limit < 25 ? +limit : 25 },
    ]);
    if (!noPop)
      stats = await populate(
        stats,
        '_id',
        'user',
        userModel,
        'firstName lastName photo role active box'
      );

    res.json({ status: 'success', stats });
  });

  static mostPopularBooks = catchAsync(async (req, res, next) => {
    const year = createYear(req.query.year);
    const state = createState(req.query.state);

    let stats = await rentModel.aggregate([
      {
        $match: {
          start: {
            $gt: new Date(year),
            $lt: new Date(`${+year + 1}`),
          },
          state,
        },
      },
      {
        $group: {
          _id: '$book',
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 0 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 100 },
    ]);

    stats = await populate(stats, '_id', 'book', bookModel, '-summery');
    await popBooksModel.deleteMany({});
    await popBooksModel.create(stats);

    factory.getAll(req, res, next, {
      sort: 'count',
      select: '-__v',
      concat: 'book',
      except: 'count',
    });
  });

  static mostActiveUsers = catchAsync(async (req, res, next) => {
    const year = createYear(req.query.year);
    const state = createState(
      req.query.state ||
        'sendRequest,acceptRequest,rejectRequest,startRenting,endRenting,failRenting'
    );
    const sort = createSort(req.query.sort || '-count');
    const { notPopulate: noPop, limit } = req.query;

    let stats = await rentModel.aggregate([
      {
        $match: {
          start: {
            $gt: new Date(year),
            $lt: new Date(`${+year + 1}`),
          },
          state,
        },
      },
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 },
          totalPrice: { $sum: '$price' },
          totalPenalty: { $sum: '$penalty' },
          avgPenalty: { $avg: '$penalty' },
          avgDelay: { $avg: '$delay' },
          rentIds: { $push: '$_id' },
        },
      },
      {
        $sort: sort,
      },
      { $limit: +limit < 25 ? +limit : 25 },
    ]);
    if (!noPop) {
      stats = await populate(
        stats,
        '_id',
        'user',
        userModel,
        'firstName lastName photo role active box'
      );
      stats = await populate(stats, 'rentIds', 'rents', rentModel, '+book');
    }
    res.json({ status: 'success', stats });
  });
}
module.exports = Controller;
