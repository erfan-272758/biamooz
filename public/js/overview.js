/* eslint-disable*/
import filterFeature from './helpers/filterFeature';
import localReader from './helpers/readLocal';

// if (!document.getElementsByClassName('allbook_container')[0]) return;
if (document.getElementsByClassName('allbook_container')[0]) {
  const queryScroll = document.getElementsByClassName('allbook_query')[0];
  const navbar = document.getElementsByClassName('navbar')[0];
  const form = document.getElementById('allbook--form');
  const allbooks = document.getElementById('allbook_books');
  const pages = document.getElementsByClassName('pages')[0];
  const firstP = pages.getElementsByClassName('first-page')[0];
  const prvious = pages.getElementsByClassName('prvious-page')[0];
  const text = pages.querySelector('h6');
  const next = pages.getElementsByClassName('next-page')[0];
  const lastP = pages.getElementsByClassName('last-page')[0];
  const filterBtn = document.getElementById('allbook_filter');
  const filterContainer = document.getElementById('allbook_filter--container');
  const filterForm = document.getElementById('filter-allbooks--form');
  const filterCancel = document.getElementById('allbook_filter--cancel');

  localReader(form, text, () => {
    return location.hash === '#useFilter';
  });

  const emptyResult = () => {
    return `<div class="empty-result">
      <i class="fas fa-book"></i>
      <h1>کتابی یافت نشد</h1>
    </div>`;
  };

  const makeUpCreator = (book) => {
    const str = book.existing
      ? `${book.reserved ? 'رزرو شده' : 'موجود'}`
      : 'ناموجود';
    return `
    <div class="allbook_book">
      <div class="card__picture">
        <div class="card__picture--cover"></div>
        <img src="/${book.image[0]}" alt="عکس کتاب" />
      </div>
      <div class="allbook--details">
        <div class="book_card--group">
          <div class="book_card--mini-group">
            <svg>
              <use xlink:href="/img/icons.svg#icon-info"></use>
            </svg>
            <h5>${book.name}</h5>
          </div>
          <h5>${book.level}</h5>
        </div>
        <div class="book_card--group">
          <div class="book_card--mini-group">
            <svg>
              <use xlink:href="/img/icons.svg#icon-book-open"></use>
            </svg>
            <h5>${book.major}</h5>
          </div>
          <h5>${book.publisher}</h5>
        </div>
        <div class="book_card--group">
          <div class="book_card--mini-group">
            <svg>
              <use xlink:href="/img/icons.svg#icon-calendar"></use>
            </svg>
            <h5>${book.year}</h5>
          </div>
          <h5 class = ${
            !book.reserved && book.existing ? 'green' : 'red'
          }>${str}</h5>
        </div>
      </div>
      <a href= "books/${book._id}" class="allbook--see see">مشاهده</a>
  </div>
  `;
  };

  const clearArr = [
    'major',
    'publisher',
    'year',
    'price',
    'level',
    'price[gt]',
    'price[lt]',
    'sort',
  ];

  const getArr = [];
  const getAllArr = ['major', 'publisher', 'year', 'level'];
  const rangeArr = ['price'];

  const callback = async (params) => {
    console.log('overview ', params);
    location.hash = 'useFilter';
    return params;
  };

  const ff = filterFeature(
    { filterBtn, filterContainer, filterForm, filterCancel },
    {
      bodyInsert: allbooks,
      form,
      bodyScroll: form,
      queryScroll,
      makeUpCreator,
      emptyResult,
    },
    { pages, firstP, prvious, text, next, lastP },
    { clearArr, getArr, getAllArr, rangeArr },
    { searchKey: 'name', url: '/api/v1/books', callback }
  );
  if (form.dataset.query) ff.sendQuery();

  navbar.addEventListener('click', async (e) => {
    const sub = e.target.closest('.nav--li');
    const parent = e.target.closest('.nav');
    if (!sub && !parent) return;
    let key = parent.dataset.content;
    if (sub) {
      key = key.concat(',', sub.dataset.content);
    }
    const [level, major] = key.split(',');
    e.stopPropagation();
    e.preventDefault();
    const params = { level };
    if (major) {
      params.major = major;
    }
    form.dataset.query = JSON.stringify(params);
    ff.sendQuery();
  });
}
