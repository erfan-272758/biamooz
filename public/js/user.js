/*eslint-disable */
import axios from 'axios';
import errorHandler from './helpers/error';
import successHandler from './helpers/success';
import { createLoader, removeLoader } from './helpers/loadingMaker';
import Watcher from './helpers/Watcher';

const container = document.getElementById('user_visit--container');
const header = document.querySelector('header.header');

// if (!container) return;
if (container) {
  const updateDiv = document.getElementById('user-update-details');
  const visitDiv = document.getElementById('user-visit-details');
  const boxForm = document.getElementById('user-update-box--form');
  const activeForm = document.getElementById('user-update-active--form');
  const rentings = document.getElementById('user-visit-rentings-book');
  const btnUpdate = document.getElementById('btn-update');
  const menu = document.querySelector('section.visit--menu');
  const deleteContainer = document.getElementById('delete--container');
  const deleteContent = deleteContainer.querySelector('div div');
  const acceptDelete = document.getElementById('accept--delete');
  const rejectDelete = document.getElementById('reject--delete');
  const url = `${location.origin}/api/v1${location.pathname}`;

  if (boxForm) Watcher.watch(header, menu, 'fixed--menu', 0.99);

  boxForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!createLoader(boxForm)) return;
    const box = +new FormData(boxForm).get('box');
    try {
      await axios({
        url,
        method: 'PUT',
        data: { box },
        headers: {
          'Content-type': 'application/json',
        },
      });

      successHandler('با موفقیت تغییر پیدا کرد', menu, 1500, () => {
        location.reload();
      });
    } catch (err) {
      errorHandler(err, menu, 2000);
    }
    removeLoader(boxForm);
  });

  if (activeForm) {
    activeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!createLoader(activeForm)) return;
      const active = new FormData(activeForm).get('active') === 'true';
      const role = new FormData(activeForm).get('role');
      try {
        await axios({
          url,
          method: 'PUT',
          data: { active, role },
          headers: {
            'Content-type': 'application/json',
          },
        });

        successHandler('با موفقیت تغییر پیدا کرد', menu, 1500, () => {
          location.reload();
        });
      } catch (err) {
        errorHandler(err, menu, 2000);
      }
      removeLoader(activeForm);
    });
  }

  const editBook = () => {
    [updateDiv, visitDiv].forEach((el) => el.classList.toggle('none'));

    btnUpdate.textContent = 'لغو';
    btnUpdate.dataset.act = 'cancel';

    boxForm.scrollIntoView();
  };
  const cancelBook = () => {
    [updateDiv, visitDiv].forEach((el) => el.classList.toggle('none'));

    btnUpdate.textContent = 'ویرایش';
    btnUpdate.dataset.act = 'edit';
  };

  const deleteBook = () => {
    deleteContainer.classList.remove('none');
    deleteContainer.scrollIntoView();
  };

  acceptDelete.addEventListener('click', async () => {
    if (!createLoader(deleteContent)) return;
    try {
      await axios({
        url,
        method: 'DELETE',
      });
      successHandler('با موفقیت حذف شد', deleteContent, 1500, () => {
        location.assign('/my');
      });
    } catch (err) {
      errorHandler(err, deleteContent, 2000);
    }
    removeLoader(deleteContent);
  });

  rejectDelete.addEventListener('click', () => {
    deleteContainer.classList.add('none');
    menu.scrollIntoView();
  });

  menu.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    switch (btn.dataset.act) {
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

  if (rentings) {
    rentings.addEventListener('click', (e) => {
      e.stopPropagation();
      const book = e.target.closest('.book-show');
      if (!book) return;
      const { id } = book.dataset;
      location.assign(`/books/${id}`);
    });
  }
}
