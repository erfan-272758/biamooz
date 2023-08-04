/* eslint-disable*/
import axios from 'axios';
import errorHandler from './helpers/error';
import successHandler from './helpers/success';
import { createLoader, removeLoader } from './helpers/loadingMaker';

const loginSection = document.getElementById('login--section');
if (loginSection) {
  const form = document.getElementById('login--form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!createLoader(form)) return;
    const fd = new FormData(form);
    const username = fd.get('email');
    const password = fd.get('password');
    const body = {
      password,
      ...JSON.parse(
        `{"${+username.trim() ? 'username' : 'email'}" : "${username}"}`
      ),
    };
    try {
      await axios({
        method: 'POST',
        url: '/api/v1/users/login',
        data: body,
      });
      successHandler('با موفقیت وارد شدید', loginSection, 1000, () => {
        location.assign('/my');
      });
    } catch (err) {
      errorHandler(err, loginSection);
    }
    removeLoader(form);
  });
}
