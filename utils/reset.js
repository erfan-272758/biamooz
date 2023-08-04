const bcrypt = require('bcryptjs');
const rentModel = require('../models/rentModel');
const bookModel = require('../models/bookModel');
const userModel = require('../models/userModel');
const popBooksModel = require('../models/popularBooksModel');
const editorModel = require('../models/editorModel');

const deleteAll = async () => {
  const ps = [rentModel, bookModel, editorModel, popBooksModel, userModel].map(
    async (model) => await model.deleteMany({})
  );
  await Promise.all(ps);
};

const insertAdmin = async () => {
  await userModel.collection.insertOne({
    password: await bcrypt.hash('Amoozesh1400', 12),
    email: 'biamooz1400@gmail.com',
    firstName: 'admin',
    lastName: '-',
    role: 'admin',
    personalPhone: '-',
    familyPhone: '-',
    username: '-',
    address: '-',
    parentName: '-',
    schoolName: '-',
    photo: 'img/users/user.png',
    active: true,
    box: 0,
    createdAt: Date.now(),
  });
  // await userModel.create(
  //   {
  //     password: 'Amoozesh1400',
  //     email: 'biamooz1400@gmail.com',
  //     firstName: 'admin',
  //     lastName: '-',
  //     role: 'admin',
  //     personalPhone: '-',
  //     familyPhone: '-',
  //     username: '-',
  //     address: '-',
  //     parentName: '-',
  //     schoolName: '-',
  //     photo: 'img/users/user.png',
  //   },
  //   { validateBeforeSave: false }
  // );
};

const set = async () => {
  try {
    await deleteAll();
    if (process.env.NODE_ENV === 'development') console.log('Delete All');
    await insertAdmin();
    if (process.env.NODE_ENV === 'development') console.log('Insert Admin');
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.log(err);
  }
};

module.exports = set;
