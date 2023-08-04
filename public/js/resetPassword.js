/* eslint-disable*/
import axios from 'axios';
import errorHandler from './helpers/error';
import successHandler from './helpers/success';
import { createLoader, removeLoader } from './helpers/loadingMaker';
const resetSection = document.getElementById('reset-password--section');
// if (!resetSection) return;
if (resetSection) {
  const form = document.getElementById('reset-password--form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!createLoader(form)) return;
    const fd = new FormData(form);
    const password = fd.get('password');
    const passwordConfirm = fd.get('passwordConfirm');
    try {
      await axios({
        method: 'PATCH',
        url: `/api/v1/users${location.pathname}`,
        data: { passwordConfirm, password },
      });
      successHandler('رمز با موفقیت تغییر پیدا کرد', resetSection, 1000, () => {
        location.assign('/login');
      });
    } catch (err) {
      errorHandler(err, resetSection);
    }
    removeLoader(form);
  });
}
