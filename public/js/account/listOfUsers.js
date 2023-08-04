/* eslint-disable*/
import filterFeature from '../helpers/filterFeature';
import autoSender from '../helpers/autoQuerySender';
import autoWatcher from '../helpers/autoWatcher';
import Watcher from '../helpers/Watcher';
import localReader from '../helpers/readLocal';

const profile = document.getElementsByClassName('profile')[0];
const container = document.querySelector('#b-users-list-a');
const header = document.querySelector('header.header');

// if (!profile || !container) return;
if (profile && container) {
  const queryScroll = document.getElementById('container--query-list-users');
  const bodyResponse = container.querySelector('.body-response');
  const fullBody = bodyResponse.querySelector('.full-body');
  const emptyBody = bodyResponse.querySelector('.empty-body');
  const form = document.getElementById('users-list-a--form');
  const tbody = document.querySelector('.users-list-a--table tbody');
  const pages = document.querySelector('#b-users-list-a .pages');
  const firstP = pages.getElementsByClassName('first-page')[0];
  const prvious = pages.getElementsByClassName('prvious-page')[0];
  const text = pages.querySelector('h6');
  const next = pages.getElementsByClassName('next-page')[0];
  const lastP = pages.getElementsByClassName('last-page')[0];
  const filterBtn = document.getElementById('users-list-a_filter');
  const filterContainer = document.getElementById(
    'allusers-filter--contrainer'
  );
  const filterForm = document.getElementById('filter-allusers--form');
  const filterCancel = document.getElementById('allusers_filter--cancel');
  const qc = document.getElementById('container--query-list-users');

  localReader(form, text);

  const clearArr = [
    'lastName',
    'username',
    'email',
    'personalPhone',
    'familyPhone',
    'schoolName',
    'address',
    'role',
    'active',
    'box',
    'box[gt]',
    'box[lt]',
    'sort',
  ];

  const getArr = [
    'lastName',
    'username',
    'personalPhone',
    'familyPhone',
    'schoolName',
    'address',
    'email',
  ];

  const getAllArr = ['active', 'role'];

  const rangeArr = ['box'];

  const emptyResult = {
    creator() {
      return `<div class="empty-result">
          <i class="fas fa-user"></i>
          <h1>کاربری یافت نشد</h1>
      </div>`;
    },
    insertPlace: emptyBody,
    hidePlace: fullBody,
  };

  const makeUpCreator = (user) => {
    let level;
    if (user.role === 'user') level = 'معمولی';
    if (user.role === 'user-admin') level = 'نیمه مدیریتی';
    if (user.role === 'admin') level = 'مدیر';
    return `
              <tr data-id="${user._id}">
                  <td>
                  <img
                      src="/${user.photo}"
                      class="user_img--table photo-profile"
                      alt="عکس"
                  />
                  </td>
                  <td>${user.firstName} ${user.lastName}</td>
                  <td>${user.parentName}</td>
                  <td>${user.personalPhone}</td>
                  <td>${user.username}</td>
                  <td>${level}</td>
                  <td>${user.active ? 'فعال' : 'غیرفعال'}</td>
            </tr>
       `;
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
    { searchKey: 'firstName', url: '/api/v1/users' },
    { limit: 12 }
  );
  autoSender(ff, '#b-users-list-a');
  const w = Watcher.watch(
    header,
    qc,
    'fixed--menu',
    0.99,
    () => !container.classList.contains('none')
  );
  autoWatcher(w, '#b-users-list-a');
  container.addEventListener('scroll', () => {
    w.unobserve();
  });

  tbody.addEventListener('click', function (e) {
    const tr = e.target.closest('tr');
    if (!tr) return;
    location.assign(`/users/${tr.dataset.id}`);
    e.stopPropagation();
  });
}
