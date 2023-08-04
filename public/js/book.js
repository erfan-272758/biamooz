/*eslint-disable */
import axios from 'axios';

import errorHandler from './helpers/error';
import successHandler from './helpers/success';
import setImage from './helpers/setImage';
import { createLoader, removeLoader } from './helpers/loadingMaker';
import Watcher from './helpers/Watcher';

const container = document.getElementById('book_visit--container');
const header = document.querySelector('header.header');
// if (!container) return;
if (container) {
  const imgBox = document.querySelector('.img-box');
  const datePrice = document.getElementById('end-price');
  const dateSubmit = document.getElementById('date--submit');
  const dateContainer = document.getElementById('date--container');
  const dateContent = dateContainer?.querySelector('div');
  const dateCancel = document.getElementById('date--cancel');
  const dateSelect = document.getElementById('requestMonth');
  const updateForm = document.getElementById('book-update--form');
  const bookVisit = document.getElementById('book-visit');
  const bookUpdate = document.getElementById('book-update');
  const btnUpdate = document.getElementById('btn-update');
  const menu = document.querySelector('section.visit--menu');
  const bookEditors = document.getElementById('book-editors');
  const bookRenter = document.getElementById('book-renter');
  const im0 = document.getElementById('book-image-0');
  const im1 = document.getElementById('book-image-1');
  const inputFile = document.getElementById('image');
  const deleteContainer = document.getElementById('delete--container');
  const deleteContent = deleteContainer?.querySelector('div div');
  const acceptDelete = document.getElementById('accept--delete');
  const rejectDelete = document.getElementById('reject--delete');

  if (menu) Watcher.watch(header, menu, 'fixed--menu', 0.99);

  dateSubmit?.addEventListener('click', async (e) => {
    if (!createLoader(dateContent)) return;
    try {
      const {
        data: { data, notifications },
      } = await axios({
        url: `${location.origin}/api/v1${location.pathname}/rents`,
        method: 'POST',
        data: { requestMonth: dateSelect.dataset.requestMonth },
      });

      const message = `درخواست با موفقیت ارسال شد${
        notifications?.length
          ? `\n\n${notifications.map((notif) => notif.message).join('\n')}\n\n`
          : ''
      }`;

      successHandler(message, dateContainer, message.length * 35, () => {
        dateContainer.classList.add('none');
        location.reload();
      });
    } catch (err) {
      errorHandler(err, dateContainer, 2000);
    }
    removeLoader(dateContent);
  });

  dateSelect?.addEventListener('input', () => {
    const price = parseInt(
      dateSelect.value * dateSelect.dataset.price * 0.04,
      10
    );
    datePrice.textContent = `${new Intl.NumberFormat('fa-IR').format(
      Math.round(price / 100) * 100 || 1000
    )} تومان`;

    dateSelect.dataset.requestMonth = dateSelect.value;
  });

  dateCancel?.addEventListener('click', (e) => {
    dateContainer.classList.add('none');
    menu.scrollIntoView();
  });

  const requestBook = () => {
    dateContainer.classList.remove('none');
    dateContent.scrollIntoView();
  };

  updateForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!createLoader(updateForm)) return;
    try {
      await axios({
        url: `${location.origin}/api/v1${location.pathname}`,
        data: new FormData(updateForm),
        method: 'PUT',
      });
      successHandler('با موفقیت تغییر پیدا کرد', bookUpdate, 1500, () => {
        location.reload();
      });
    } catch (err) {
      errorHandler(err, bookUpdate, 2000);
    }
    removeLoader(updateForm);
  });

  bookRenter?.addEventListener('click', () => {
    const { id } = bookRenter.dataset;
    location.assign(`/users/${id}`);
  });

  bookEditors?.addEventListener('click', (e) => {
    e.stopPropagation();
    const user = e.target.closest('.user-show');
    if (!user) return;
    const { id } = user.dataset;
    location.assign(`/users/${id}`);
  });

  const editBook = () => {
    [bookVisit, bookUpdate].forEach((el) => el.classList.toggle('none'));

    btnUpdate.textContent = 'لغو';
    btnUpdate.dataset.act = 'cancel';
  };
  const cancelBook = () => {
    [bookVisit, bookUpdate].forEach((el) => el.classList.toggle('none'));

    btnUpdate.textContent = 'ویرایش';
    btnUpdate.dataset.act = 'edit';
  };

  const deleteBook = () => {
    deleteContainer.classList.remove('none');
    deleteContainer.scrollIntoView();
  };

  acceptDelete?.addEventListener('click', async () => {
    if (!createLoader(deleteContent)) return;
    try {
      await axios({
        url: `${location.origin}/api/v1${location.pathname}`,
        method: 'DELETE',
      });
      successHandler('با موفقیت حذف شد', deleteContent, 1500, () => {
        location.assign('/');
      });
    } catch (err) {
      errorHandler(err, deleteContent, 2000);
    }
    removeLoader(deleteContent);
  });

  rejectDelete?.addEventListener('click', () => {
    deleteContainer.classList.add('none');
    menu.scrollIntoView();
  });

  const copyQr = async () => {
    if (!createLoader(menu)) return;
    try {
      await navigator.clipboard.writeText(
        location.pathname.replace('/books/', '')
      );
      successHandler('با موفقیت کپی شد', menu, 1500, () => {
        location.s;
      });
    } catch (err) {
      errorHandler(err, menu, 2000);
    }
    removeLoader(menu);
  };

  menu?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    switch (btn.dataset.act) {
      case 'request-book':
        requestBook();
        break;
      case 'copy-qr':
        copyQr();
        break;
      case 'edit':
        editBook();
        break;
      case 'cancel':
        cancelBook();
        break;
      case 'remove':
        deleteBook();
        break;
    }
  });

  const wait = (time = 1500) => {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, time);
    });
  };

  let changeStart = false;
  if (window.innerWidth <= 710) {
    imgBox.addEventListener('click', async () => {
      const frontImg = document.querySelector('.img-front');
      const backImg = document.querySelector('.img-back');
      if (!backImg || changeStart) return;
      changeStart = true;
      frontImg.style.cssText = `top : 6rem !important;
      left : 6rem !important;opacity : 0;`;
      await wait(500);
      frontImg.style.cssText = `top : 0rem !important;
      left : 0rem !important;
      z-index : 0;opacity : 0.4;`;
      backImg.style.cssText = `top : 0.5rem !important;
      left : 0.5rem !important;
      z-index : 100;`;
      await wait(500);
      frontImg.style.opacity = 1;
      await wait(500);
      [frontImg, backImg].forEach((el) => {
        if (el.classList.contains('img-front')) {
        } else {
        }
        el.classList.toggle('img-front');
        el.classList.toggle('img-back');
      });
      changeStart = false;
    });
  }

  setImage(inputFile, [im0, im1], '/img/books/book.png');
}
