/* eslint-disable*/
import axios from 'axios';
import errorHandler from './helpers/error';
import successHandler from './helpers/success';
import { createLoader, removeLoader } from './helpers/loadingMaker';
const forgotSection = document.getElementById('forgot-password--section');
// if (!forgotSection) return;
if (forgotSection) {
  const form = document.getElementById('forgot-password--form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!createLoader(form)) return;
    const fd = new FormData(form);
    const username = fd.get('username');
    const email = fd.get('email');
    try {
      await axios({
        method: 'POST',
        url: '/api/v1/users/forgotPassword',
        data: { email, username },
      });
      successHandler(
        'ایمیل با موفقیت ارسال شد اگر به دست شما نرسید منتظر بمانید و یا بخش spam را چک کنید.',
        forgotSection,
        8000,
        () => {
          form.reset();
        }
      );
    } catch (err) {
      errorHandler(err, forgotSection);
    }
    removeLoader(form);
  });
}
