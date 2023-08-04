/* eslint-disable*/
import axios from 'axios';
import filterFeature from '../helpers/filterFeature';
import errorHandler from '../helpers/error';
import autoSender from '../helpers/autoQuerySender';
import autoWatcher from '../helpers/autoWatcher';
import Watcher from '../helpers/Watcher';
import localReader from '../helpers/readLocal';

const profile = document.getElementsByClassName('profile')[0];
const container = document.getElementById('b-requests-list-u-a_a');
const header = document.querySelector('header.header');

if (profile && container) {
  const queryScroll = document.getElementById(
    'container--query--others-requests'
  );
  const bodyResponse = container.querySelector('.body-response');
  const fullBody = bodyResponse.querySelector('.full-body');
  const emptyBody = bodyResponse.querySelector('.empty-body');
  const form = document.getElementById('requests-list-u-a_a--form');
  const tbody = document.querySelector('.requests-list-u-a_a--table tbody');
  const pages = document.querySelector('#b-requests-list-u-a_a .pages');
  const firstP = pages.getElementsByClassName('first-page')[0];
  const prvious = pages.getElementsByClassName('prvious-page')[0];
  const text = pages.querySelector('h6');
  const next = pages.getElementsByClassName('next-page')[0];
  const lastP = pages.getElementsByClassName('last-page')[0];
  const filterBtn = document.getElementById('requests-list-u-a_a_filter');
  const filterContainer = document.getElementById(
    'allrents-filter--contrainer'
  );
  const qc = document.getElementById('container--query--others-requests');
  const filterForm = document.getElementById('filter-allrents--form');
  const filterCancel = document.getElementById('allrents_filter--cancel');

  localReader(form, text);

  const clearArr = ['username', 'email', 'book', 'state', 'sort', 'user'];

  const getArr = ['user.username', 'user.email', 'book'];

  const getAllArr = ['state'];

  const rangeArr = [];

  const emptyResult = {
    creator() {
      return `<div class="empty-result">
          <i class="fas fa-book"></i>
          <h1>درخواستی یافت نشد</h1>
      </div>`;
    },
    insertPlace: emptyBody,
    hidePlace: fullBody,
  };

  const setStateStr = (rent) => {
    let stateStr;
    switch (rent.state) {
      case 'sendRequest':
        stateStr = `
        <td>${rent.request}</td>
        <td> - </td>
        <td> ${rent.end} </td>
        <td>در خواست داده شد</td>
      `;
        break;
      case 'acceptRequest':
        stateStr = `
        <td>${rent.request}</td>
        <td> - </td>
        <td> ${rent.end} </td>
        <td>در خواست قبول شد</td>
      `;
        break;
      case 'rejectRequest':
        stateStr = `
        <td>${rent.request}</td>
        <td> - </td>
        <td> ${rent.end} </td>
        <td>در خواست رد شد</td>
      `;
        break;
      case 'failRenting':
        stateStr = `
        <td>${rent.request}</td>
        <td> - </td>
        <td> ${rent.end} </td>
        <td>کرایه با خطا مواجه شد</td>
      `;
        break;
      case 'startRenting':
        stateStr = `
          <td>${rent.request}</td>
          <td> ${rent.start} </td>
          <td> ${rent.end} </td>
          <td>کرایه شروع شد</td>
        `;
        break;
      case 'endRenting':
        stateStr = `
        <td>${rent.request}</td>
        <td> ${rent.start} </td>
        <td> ${rent.end} </td>
        <td>کرایه پایان یافت</td>
      `;
        break;
    }
    return stateStr;
  };

  const makeUpCreator = (rent) => {
    return `
    <tr data-id = "${rent._id}">
      <td>
        <img
          src="/${rent.user?.photo}"
          class="user_img--table photo-profile"
          alt="عکس"
        />
      </td>
      <td>${rent.user?.firstName || '-'} ${rent.user?.lastName || '-'}</td>
      <td>${rent.user.personalPhone}</td>
      <td>
        <img
          src="/${rent.book?.image[0] || '-'}"
          class="book_img--table"
          alt="عکس"
        />
      </td>
      <td>${rent.book?.name || '-'}</td>
      <td>${rent.price}</td>
      ${setStateStr(rent)}
      </tr>
       `;
  };

  const searchAction = async (params) => {
    let username, email, personalPhone;
    const arr = Object.keys(params).filter((key) => key.startsWith('user.'));
    arr.forEach((key) => {
      if (key === 'user.username') username = params[key];
      if (key === 'user.email') email = params[key];
      if (key === 'user.personalPhone') personalPhone = params[key];
      if (['user.username', 'user.email', 'user.personalPhone'].includes(key))
        delete params[key];
    });
    if (!username && !email && !personalPhone) return params;
    try {
      const {
        data: { data },
      } = await axios({
        url: '/api/v1/users',
        method: 'GET',
        params: {
          username,
          email,
          personalPhone,
          select: '_id',
        },
      });
      if (!data || data.length === 0) {
        errorHandler(
          {
            response: {
              status: 404,
              data: { message: 'کاربر مورد نشر یافت نشد' },
            },
          },
          queryScroll,
          2500
        );
        return params;
      }
      const user = Array.from(data).map((d) => d._id);
      params.user = user;
      return params;
    } catch (err) {
      errorHandler(err, queryScroll, 1500);
      return params;
    }
  };

  const ff = filterFeature(
    { filterBtn, filterContainer, filterForm, filterCancel },
    {
      form,
      bodyInsert: tbody,
      bodyScroll: form,
      queryScroll,
      makeUpCreator,
      emptyResult,
    },
    { pages, firstP, prvious, text, next, lastP },
    { clearArr, getArr, getAllArr, rangeArr },
    {
      searchKey: 'user.personalPhone',
      url: '/api/v1/rents',
      callback: searchAction,
      limit: 12,
    }
  );
  autoSender(ff, '#b-requests-list-u-a_a');

  const w = Watcher.watch(
    header,
    qc,
    'fixed--menu',
    0.99,
    () => !container.classList.contains('none')
  );
  autoWatcher(w, '#b-requests-list-u-a_a');
  container.addEventListener('scroll', () => {
    w.unobserve();
  });

  window.addEventListener('scroll', () => {
    w.observe();
  });

  tbody.addEventListener('click', function (e) {
    const tr = e.target.closest('tr');
    if (!tr) return;
    location.assign(`/rents/${tr.dataset.id}`);
    e.stopPropagation();
  });
}
