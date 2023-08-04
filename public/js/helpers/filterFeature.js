/* eslint-disable*/
import axios from 'axios';
import errorHandler from './error';
import { createLoader, removeLoader } from './loadingMaker';
import $ from 'jquery';

const faFormat = new Intl.NumberFormat('fa-IR');

class Filter {
  constructor(
    { filterBtn, filterContainer, filterForm, filterCancel },
    {
      form,
      bodyInsert,
      bodyScroll,
      queryScroll = filterForm,
      makeUpCreator,
      emptyResult,
    },
    { pages, firstP, prvious, text, next, lastP, notAction },
    { clearArr, getArr, getAllArr, rangeArr },
    { limit, searchKey, url, callback }
  ) {
    this.form = form;
    this.filterBtn = filterBtn;
    this.filterContainer = filterContainer;
    this.filterForm = filterForm;
    this.filterCancel = filterCancel;
    this.pages = pages;
    this.prvious = prvious;
    this.text = text;
    this.next = next;
    this.pageNotAction = notAction;
    this.bodyInsert = bodyInsert;
    this.bodyScroll = bodyScroll;
    this.makeUpCreator = makeUpCreator;
    this.queryScroll = queryScroll;
    this.limit = limit;
    this.searchKey = searchKey;
    this.url = url;
    this.callback = callback;
    this.firstP = firstP;
    this.lastP = lastP;
    this.clearArr = clearArr;
    this.getArr = getArr;
    this.getAllArr = getAllArr;
    this.rangeArr = rangeArr;
    this.emptyResult = emptyResult;
  }

  static newInstance(
    { filterBtn, filterContainer, filterForm, filterCancel },
    {
      form,
      bodyInsert,
      bodyScroll,
      queryScroll = filterForm,
      makeUpCreator,
      emptyResult,
    },
    { pages, firstP, prvious, text, next, lastP, notAction },
    { clearArr, getArr, getAllArr, rangeArr },
    { searchKey, url, callback, limit = 24 }
  ) {
    const filter = new Filter(
      { filterBtn, filterContainer, filterForm, filterCancel },
      { form, bodyInsert, bodyScroll, queryScroll, makeUpCreator, emptyResult },
      { pages, firstP, prvious, text, next, lastP, notAction },
      { clearArr, getArr, getAllArr, rangeArr },
      { limit, searchKey, url, callback }
    );
    filter.setfilterBtnAction();
    filter.setFilterFormAction();
    filter.setQueryFormAction();
    filter.setPagesAction();
    return filter;
  }

  sendQuery() {
    const params = {
      ...JSON.parse(this.form.dataset.query || '{}'),
      limit: this.limit,
      calcNumOfPages: true,
    };
    params.page = params.page || 1;
    params[this.searchKey] =
      params[this.searchKey] ?? new FormData(this.form).get('search');

    this.form.dataset.query = JSON.stringify(params);
    this._sendQuery(params.page, this.form);
    this._setFilterOptions(params);
  }

  setfilterBtnAction() {
    this.filterBtn.addEventListener('click', () => {
      this.filterContainer.classList.remove('none');
      this.filterForm.scrollIntoView();
    });

    this.filterCancel.addEventListener('click', () => {
      this.filterContainer.classList.add('none');
      this.queryScroll.scrollIntoView();
    });
  }

  setFilterFormAction() {
    this.filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const params = JSON.parse(this.form.dataset.query || '{}');
      this.clearArr.forEach((value) => delete params[value]);
      const fd = new FormData(this.filterForm);

      this.getArr.forEach((key) => {
        const val = fd.get(key);
        if (!val) return;
        params[key] = val;
      });

      this.getAllArr.forEach((key) => {
        const val = fd.getAll(key);
        if (val.length === 0) return;
        params[key] = val;
      });

      this.rangeArr.forEach((key) => {
        const val = fd.get(key);
        if (val.length > 0) {
          const keyEq = fd.get(`${key}-eq`);
          if (keyEq === 'eq') params[key] = +val;
          if (keyEq === 'lt') params[`${key}[lt]`] = +val;
          if (keyEq === 'gt') params[`${key}[gt]`] = +val;
        }
      });

      const sort = fd.getAll('sort');
      const sortValues = sort
        .filter((key) => key.includes('_'))
        .map((key) => key.split('_'));
      const sortRes = sort
        .filter((key) => !key.includes('_'))
        .map((key) => {
          const [, value] = sortValues.find(([k]) => k === key);
          return `${+value < 0 ? '-' : ''}${key}`;
        })
        .join(' ');
      if (sortRes) params.sort = sortRes;

      this.form.dataset.query = JSON.stringify(params);
      this.filterContainer.classList.add('none');
      this.queryScroll.scrollIntoView();

      //save account filter
      if (this.filterForm.id === 'filter-alluser-rents--form') {
        localStorage.setItem(
          'filter-account-mine__bookQrCode',
          params.book ?? ''
        );
      }
      if (this.filterForm.id === 'filter-allrents--form') {
        localStorage.setItem(
          'filter-account-others__user.username',
          params['user.username'] ?? ''
        );
        localStorage.setItem(
          'filter-account-others__user.email',
          params['user.email'] ?? ''
        );
        localStorage.setItem(
          'filter-account-others__bookQrCode',
          params.book ?? ''
        );
      }
    });
  }

  _setFilterOptions(params) {
    this.filterForm.reset();

    //input text
    this.getArr.forEach((kn) => {
      const value = params[kn];
      if (!value) return;
      const tagName = `${kn === 'address' ? 'textarea' : 'input'}`;
      const el = this.filterForm.querySelector(`${tagName}[name="${kn}"]`);
      el.value = value;
    });
    //input checkbox
    this.getAllArr.forEach((kn) => {
      let valueArr = params[kn];
      if (!valueArr) return;
      if (valueArr.__proto__ !== Array.prototype) valueArr = [valueArr];
      const elArr = this.filterForm.querySelectorAll(`input[name="${kn}"]`);
      elArr.forEach((el) => {
        el.checked = valueArr.includes(el.value);
      });
    });
    //input number and radio buttons
    this.rangeArr.forEach((kn) => {
      const eq = params[kn];
      const lt = params[`${kn}[lt]`];
      const gt = params[`${kn}[gt]`];
      if (eq === undefined && lt === undefined && gt === undefined) return;
      const numberEl = this.filterForm.querySelector(`input[name="${kn}"]`);
      numberEl.value = eq ?? lt ?? gt;
      const [gtEl, eqEl, ltEl] = this.filterForm.querySelectorAll(
        `input[name="${kn}-eq"]`
      );
      gtEl.checked = gt !== undefined;
      eqEl.checked = eq !== undefined;
      ltEl.checked = lt !== undefined;
    });
    //special names
    const usernameText = localStorage.getItem(
      'filter-account-others__user.username'
    );
    const emailText = localStorage.getItem('filter-account-others__user.email');

    let bookText;
    if (this.filterForm.id === 'filter-alluser-rents--form') {
      bookText = localStorage.getItem('filter-account-mine__bookQrCode');
    }
    if (this.filterForm.id === 'filter-allrents--form') {
      bookText = localStorage.getItem('filter-account-others__bookQrCode');
    }

    const usernameEl = this.filterForm.querySelector(
      'input[name="user.username"]'
    );
    const emailEl = this.filterForm.querySelector('input[name="user.email"]');
    const bookEl = this.filterForm.querySelector('input[name=book]');

    if (usernameEl) usernameEl.value = usernameText ?? '';
    if (emailEl) emailEl.value = emailText ?? '';
    if (bookEl) bookEl.value = bookText ?? '';

    //search input
    const search = this.form.querySelector('input[name=search]');
    if (this.searchKey.includes('.')) {
      search.value =
        localStorage.getItem(`filter-search__${this.searchKey}`) ?? '';
    } else {
      search.value = params[this.searchKey];
    }
    //sort
    const { sort } = params;
    if (!sort) return;
    sort
      .split(' ')
      .flatMap((kn) => [
        kn.replace('-', ''),
        `${kn.replace('-', '')}_${kn.startsWith('-') ? '-' : ''}1`,
      ])
      .forEach((value) => {
        if (value.includes('_')) {
          const el = this.filterForm.querySelector(`option[value="${value}"]`);
          el.selected = true;
        } else {
          const el = this.filterForm.querySelector(`input[value="${value}"]`);
          el.checked = true;
        }
      });
  }

  _changeUrl() {
    const params = JSON.parse(this.form.dataset.query || '{}');
    const page = params.page || 1;
    if (params.page) delete params.page;
    params.calcNumOfPages = true;
    const url = `${this.url}/${page}?${$.param(params)}`;
    location.assign(url);
  }

  _pageContext(page, numOfPages) {
    //text content
    this.text.textContent = faFormat.format(page).replace(/٬/g, '');
    this.text.dataset.current = page;
    if (numOfPages !== undefined) {
      this.text.dataset.numOfPages = numOfPages;
      localStorage.setItem(`${this.form.id}__num`, numOfPages);
    }

    //set first page
    page > 2
      ? this.firstP.classList.remove('none')
      : this.firstP.classList.add('none');

    //set previous page
    page > 1
      ? this.prvious.classList.remove('none')
      : this.prvious.classList.add('none');

    //set next page
    page < +this.text.dataset.numOfPages
      ? this.next.classList.remove('none')
      : this.next.classList.add('none');

    //set last page
    page < +this.text.dataset.numOfPages - 1
      ? this.lastP.classList.remove('none')
      : this.lastP.classList.add('none');
  }

  async _sendQuery(page, place) {
    if (this.pageNotAction) return this._changeUrl();
    if (!createLoader(place)) return;
    try {
      let params;
      if (this.callback) {
        params = await this.callback(
          JSON.parse(this.form.dataset.query || '{}')
        );
        this.form.dataset.query = JSON.stringify(params);
      } else params = JSON.parse(this.form.dataset.query || '{}');
      const { data } = await axios({
        url: this.url,
        method: 'GET',
        params,
      });
      localStorage.setItem(`${this.form.id}__params`, JSON.stringify(params));

      this._insertElements(data.data);
      // page context
      this._pageContext(page, data.numOfPages);

      const ep = document.querySelector('.error-panel');
      if (ep) ep.scrollIntoView();
      else this.bodyScroll.scrollIntoView();
    } catch (err) {
      errorHandler(err, this.queryScroll, 1500);
      this.bodyInsert.innerHTML = '';

      if (!this.pageNotAction) {
        this.text.textContent = faFormat.format(1);
        this.text.dataset.current = 1;
        [this.firstP, this.prvious, this.next, this.lastP].forEach((el) =>
          el.classList.add('none')
        );
      }
      console.dir(err);
    }
    removeLoader(place);
  }

  _insertElements(data) {
    const emptyCreator = this.emptyResult.creator ?? this.emptyResult;
    const emptyInsertPlace = this.emptyResult.insertPlace ?? this.bodyInsert;
    const emptyHidePlace = this.emptyResult.hidePlace ?? this.pages;
    this.bodyInsert.innerHTML = '';
    emptyInsertPlace.innerHTML = '';
    if (data.length > 0) {
      const makeup = Array.from(data)
        .map((doc) => this.makeUpCreator(doc))
        .join('\n');
      emptyHidePlace.classList.remove('none');
      // if (emptyInsertPlace !== this.bodyInsert)
      //   emptyInsertPlace.classList.add('none');
      this.bodyInsert.insertAdjacentHTML('afterbegin', makeup);
    } else {
      const makeup = emptyCreator();
      emptyInsertPlace.insertAdjacentHTML('afterbegin', makeup);
      emptyHidePlace.classList.add('none');
      emptyInsertPlace.classList.remove('none');
    }
  }

  setQueryFormAction() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const params = {
        ...JSON.parse(this.form.dataset.query || '{}'),
        limit: this.limit,
        calcNumOfPages: true,
        page: 1,
      };
      params[this.searchKey] = new FormData(this.form).get('search');

      this.form.dataset.query = JSON.stringify(params);
      this._sendQuery(1, this.form);

      if (this.filterForm.id === 'filter-alluser-rents--form') {
        localStorage.setItem(
          'filter-search__book.name',
          params[this.searchKey] ?? ''
        );
      }
      if (this.filterForm.id === 'filter-allrents--form') {
        localStorage.setItem(
          'filter-search__user.personalPhone',
          params[this.searchKey] ?? ''
        );
      }
    });
  }

  setPagesAction() {
    this.pages.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();
      const a = e.target.closest('a');
      if (!a) return;
      const params = JSON.parse(this.form.dataset.query || '{}');
      params.calcNumOfPages = false;
      const current = +this.text.dataset.current;

      if (a === this.firstP) params.page = 1;
      if (a === this.prvious) params.page = current - 1;
      if (a === this.next) params.page = current + 1;
      if (a === this.lastP) params.page = this.text.dataset.numOfPages;

      this.form.dataset.query = JSON.stringify(params);
      this._sendQuery(params.page, this.pages);
    });
  }
}

export default Filter.newInstance;
