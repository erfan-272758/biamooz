// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');
const fs = require('fs').promises;
const catchAsync = require('./catchAsync');
const AppError = require('./appError');
const apiFeatur = require('./apiFeaturs');

class Factory {
  /**
   *
   * @param {mongoose.Model} model
   */
  constructor(model) {
    this.model = model;
  }

  static newInstance(model) {
    return new Factory(model);
  }

  filterBody(body = {}, ...args) {
    args.forEach((val) => delete body[val]);
  }

  getAll = catchAsync(async (req, res, next, options) => {
    if (!options) options = {};
    const {
      sort,
      select,
      limit,
      maxLimit,
      concat,
      except,
      extraForbbiden = ['calcNumOfPages'],
    } = options;
    let numOfPages;
    if (req.query.calcNumOfPages === 'true' && req.query.limit) {
      const qo = JSON.parse(JSON.stringify(req.query));
      qo.select = '_id';
      qo.limit = 10000;
      qo.page = 1;
      const { query } = apiFeatur(this.model.find(), qo)
        .select(select, concat, except)
        .filter(extraForbbiden, concat, except)
        .paginate(10000, 10000);
      const result = await query;
      numOfPages = Math.ceil(result.length / +req.query.limit);
    }
    const { query } = apiFeatur(this.model.find(), req.query)
      .sort(sort, concat, except)
      .select(select, concat, except)
      .filter(extraForbbiden, concat, except)
      .paginate(limit, maxLimit);

    let data = await query;
    if (!req.query.notConvert) data = [...data].map((doc) => doc.convert());
    if (options.notSend)
      return options.callback(req, res, next, data, numOfPages);

    res.json({ status: 'success', results: data.length, data, numOfPages });
  });

  //find from req.params.id
  getOne = catchAsync(async (req, res, next, options, callback) => {
    if (!options) options = {};
    const { id } = req.params;
    if (!id) return next(new AppError(400, 'id is not exist'));
    const data =
      options.isAdmin || options.isUserAdmin
        ? await callback(id, req.user.role)
        : await this.model.findById(id);
    if (!data) return next(new AppError(404, 'id is wrong'));
    if (options.notSend) return options.callback(req, res, next, data);
    res.status(200).json({ status: 'success', data });
  });

  insertOne = catchAsync(async (req, res, next, options, callback) => {
    if (!options) options = {};
    const data = await this.model.create(req.body);
    if (options.reqSave) {
      req.doc = data;
      req.model = this.model;
    }
    if (options.editorModel) await callback(data, options.editorModel, req);
    if (options.notSend) return next();
    res.status(201).json({ status: 'success', data });
  });

  //update and check validators
  updateOne = catchAsync(async (req, res, next, options, callback) => {
    if (!options) options = {};
    let { id } = req.params;
    if (!id && req.user) id = req.user._id;
    if (!id) return next(new AppError(400, 'id is not exist'));
    let data = await this.model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!data) return next(new AppError(404, 'id is wrong'));
    if (options.pushEditors) data = await callback(data, req, options);
    res.status(200).json({ status: 'success', data });
  });

  deleteOne = catchAsync(async (req, res, next, options) => {
    if (!options) options = {};
    const { id } = req.params;
    if (!id) return next(new AppError(400, 'id is not exist'));
    const data = await this.model.findByIdAndDelete(id);
    if (!data) return next(new AppError(404, 'id is wrong'));
    if (options.deletePath) {
      try {
        await fs.unlink(options.deletePath);
        // eslint-disable-next-line no-empty
      } catch (err) {}
    }
    res.status(204).json({ status: 'success', data: null });
  });
}

module.exports = Factory.newInstance;
