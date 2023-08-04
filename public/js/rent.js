/*eslint-disable */
import axios from 'axios';
import errorHandler from './helpers/error';
import successHandler from './helpers/success';
import { createLoader, removeLoader } from './helpers/loadingMaker';

const container = document.getElementById('rent_visit--container');
// if (!container) return;
if (container) {
  const book = document.getElementById('book--rent');
  const user = document.getElementById('user--rent');
  const menu = document.querySelector('section.visit--menu');
  const acceptBtn = menu.querySelector('#accept--rent');
  const deleteContainer = document.getElementById('delete--container');
  const deleteContent = deleteContainer.querySelector('div div');
  const acceptDelete = document.getElementById('accept--delete');
  const rejectDelete = document.getElementById('reject--delete');

  const { state, id } = menu.dataset;
  const url = `/api/v1/rents/${id}`;

  if (book) {
    [book, user].forEach((el) => {
      if (!el) return;
      el.addEventListener('click', () => {
        const { url } = el.dataset;
        location.assign(url);
      });
    });
  }

  const wait = (time = 1500) => {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, time);
    });
  };

  const handleRequest = async (
    message,
    state,
    changeLocation = true,
    loader = true
  ) => {
    if (loader && !createLoader(menu)) return {};
    try {
      const {
        data: {
          data: { rent, user },
        },
      } = await axios({
        url,
        method: 'PUT',
        data: { state },
      });
      successHandler(message, menu, 1500, () => {
        if (!changeLocation) return;

        location.reload();
      });
      removeLoader(menu);
      return { rent, user };
    } catch (err) {
      errorHandler(err, menu, 2000);

      removeLoader(menu);
      return {};
    }
  };

  const acceptRequest = handleRequest.bind(
    this,
    'درخواست کاربر قبول شد',
    'acceptRequest'
  );
  const startRenting = handleRequest.bind(
    this,
    'کرایه شروع شد',
    'startRenting'
  );
  const rejectRequest = handleRequest.bind(
    this,
    'درخواست کاربر رد شد',
    'rejectRequest'
  );
  const failRenting = handleRequest.bind(
    this,
    'کرایه با خطا مواجه شد',
    'failRenting'
  );

  const endRenting = async () => {
    if (!createLoader(menu)) return;
    const { rent, user } = await handleRequest(
      'کرایه پایان پذیرفت',
      'endRenting',
      false,
      false
    );
    if (!rent) {
      removeLoader(menu);
      return;
    }
    await wait(1500);

    if (rent.penalty === 0) {
      location.reload();
    }
    try {
      await axios({
        url: `/api/v1/users/${user.id}`,
        method: 'PUT',
        data: { box: Math.max(user.box - rent.penalty, 0) },
      });
      successHandler('جریمه از صندوق ذخیره کم شد', menu, 1500, () => {
        if (user.box - rent.penalty >= 0) return location.reload();
        acceptBtn.classList.add('none');
        const makeUp = `
            <h1 id="penalty-left">جریمه باقی مانده : ${new Intl.NumberFormat(
              'fa-IR'
            ).format(rent.penalty - user.box)}</h1>
          `;
        menu.insertAdjacentHTML('afterbegin', makeUp);
        menu.scrollIntoView();
      });
    } catch (err) {
      errorHandler(err, menu, 2000);
    }
    removeLoader(menu);
    return;
  };

  const accept = () => {
    switch (state) {
      case 'sendRequest':
        acceptRequest();
        break;
      case 'acceptRequest':
        startRenting();
        break;
      case 'startRenting':
        endRenting();
        break;
    }
  };
  const reject = () => {
    switch (state) {
      case 'sendRequest':
        rejectRequest();
        break;
      case 'acceptRequest':
        failRenting();
        break;
    }
  };
  const deleteRent = () => {
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

      successHandler(
        'درخواست کرایه با موفقیت حذف شد.',
        deleteContent,
        1500,
        () => {
          location.assign('/my');
        }
      );
    } catch (err) {
      errorHandler(err, deleteContent);
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
      case 'accept':
        accept();
        break;
      case 'reject':
        reject();
        break;
      case 'delete':
        deleteRent();
        break;
    }
  });
}
