/* eslint-disable*/
import axios from 'axios';
import errorHandler from '../helpers/error';
import successHandler from '../helpers/success';
import setImage from '../helpers/setImage';
import { createLoader, removeLoader } from '../helpers/loadingMaker';

const profile = document.getElementsByClassName('profile')[0];
const insertForm = document.getElementsByClassName('insert-book--form')[0];
const im0 = document.getElementById('book-image-0');
const im1 = document.getElementById('book-image-1');
const inputFile = document.getElementById('image');

if (profile && insertForm) {
  setImage(inputFile, [im0, im1], '/img/books/book.png');
  insertForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!createLoader(insertForm)) return;
    try {
      await axios({
        url: '/api/v1/books',
        method: 'POST',
        data: new FormData(insertForm),
      });

      insertForm.reset();
      [im0, im1].forEach((el) => (el.src = '/img/books/book.png'));
      successHandler('با موفقیت افزوده شد', insertForm, 2500);
    } catch (err) {
      errorHandler(err, insertForm);
    }
    removeLoader(insertForm);
  });
}
