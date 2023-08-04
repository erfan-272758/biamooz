/* eslint-disable*/
import axios from 'axios';
import filterFeature from '../helpers/filterFeature';
import errorHandler from '../helpers/error';
import autoSender from '../helpers/autoQuerySender';
import autoWatcher from '../helpers/autoWatcher';
import Watcher from '../helpers/Watcher';
import localReader from '../helpers/readLocal';

const profile = document.getElementsByClassName('profile')[0];
const container = document.getElementById('b-requests-list-u');
const header = document.querySelector('header.header');

// if (!profile) return;
if (profile) {
  const queryScroll = document.getElementById(
    'container--query--mine-requests'
  );
  const bodyResponse = container.querySelector('.body-response');
  const fullBody = bodyResponse.querySelector('.full-body');
  const emptyBody = bodyResponse.querySelector('.empty-body');
  const form = document.getElementById('requests-list-u--form');
  const tbody = document.querySelector('.requests-list-u--table tbody');
  const pages = document.querySelector('#b-requests-list-u .pages');
  const firstP = pages.getElementsByClassName('first-page')[0];
  const prvious = pages.getElementsByClassName('prvious-page')[0];
  const text = pages.querySelector('h6');
  const next = pages.getElementsByClassName('next-page')[0];
  const lastP = pages.getElementsByClassName('last-page')[0];
  const filterBtn = document.getElementById('requests-list-u_filter');
  const filterContainer = document.getElementById(
    'alluser-rents-filter--contrainer'
  );
  const filterForm = document.getElementById('filter-alluser-rents--form');
  const filterCancel = document.getElementById('alluser-rents_filter--cancel');
  const qc = document.getElementById('container--query--mine-requests');

  localReader(form, text);

  const clearArr = ['book', 'state', 'sort'];

  const getArr = ['book'];

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

  const callback = async (params) => {
    if (profile.dataset.userRole !== 'user') params.mine = true;
    const name = params['book.name'];
    delete params['book.name'];
    if (!name) return params;
    try {
      const {
        data: { data },
      } = await axios({
        url: '/api/v1/books',
        method: 'GET',
        params: {
          name,
          select: '_id',
        },
      });
      if (!data || data.length === 0) {
        errorHandler(
          {
            response: {
              status: 404,
              data: { message: 'کتاب مورد نظر یافت نشد' },
            },
          },
          queryScroll,
          2500
        );
        return params;
      }
      const book = Array.from(data).map((d) => d._id);
      params.book = book;
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
      searchKey: 'book.name',
      url: '/api/v1/rents',
      callback,
      limit: 12,
    }
  );

  autoSender(ff, '#b-requests-list-u');
  const w = Watcher.watch(
    header,
    qc,
    'fixed--menu',
    0.99,
    () => !container.classList.contains('none')
  );
  autoWatcher(w, '#b-requests-list-u');
  container.addEventListener('scroll', () => {
    w.unobserve();
  });

  tbody.addEventListener('click', function (e) {
    const tr = e.target.closest('tr');
    if (!tr) return;
    location.assign(`/rents/${tr.dataset.id}`);
    e.stopPropagation();
  });
}
