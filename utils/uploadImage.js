/* eslint-disable no-empty */
const multer = require('multer');
const sharp = require('sharp');
const { promisify } = require('util');
const fs = require('fs');
const AppError = require('./appError');

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/'))
    return cb(
      new AppError(
        400,
        'تنها میتوانید تصاویر با حجم کمتر از 8 مگابایت آپلود کنید',
        false
      )
    );
  const size = file.size / (1024 * 1024);
  if (size >= 8)
    return cb(
      new AppError(
        400,
        'تنها میتوانید تصاویر با حجم کمتر از 8 مگابایت آپلود کنید',
        false
      )
    );
  cb(null, true);
};

exports.upload = multer({ storage, fileFilter });

exports.bookUpload = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    if (req.doc && req.doc._id)
      return res.status(201).json({ status: 'success', data: req.doc });
    return next();
  }
  const id = req.params.id || req.doc._id;
  const path = `./public/img/books/${id}`;
  try {
    await promisify(fs.access)(path, fs.constants.F_OK);
  } catch (err) {
    await promisify(fs.mkdir)(path);
  }
  try {
    const promesis = req.files.map(async (file, i) => {
      const pathImage = `public/img/books/${id}/${i}.jpeg`;
      await sharp(file.buffer)
        .resize(512, 708)
        .toFormat('jpeg')
        .jpeg({ quality: 80 })
        .toFile(pathImage);
      if (!req.body.image) req.body.image = [];
      req.body.image[i] = pathImage.replace('public/', '');
    });
    await Promise.all(promesis);
    if (req.doc._id) {
      const data = await req.model.findByIdAndUpdate(
        req.doc._id,
        { image: req.body.image },
        { new: true }
      );
      return res.status(201).json({ status: 'success', data });
    }
  } catch (err) {}
  next();
};
exports.userUpload = async (req, res, next) => {
  if (!req.file) return next();
  const path = `public/img/users/${req.user._id}.jpeg`;
  try {
    await sharp(req.file.buffer)
      .resize(512, 512)
      .toFormat('jpeg')
      .jpeg({ quality: 80 })
      .toFile(path);
    req.body.photo = path.replace('public/', '');
  } catch (err) {}
  next();
};
