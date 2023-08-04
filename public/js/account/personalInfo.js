/* eslint-disable*/
import axios from 'axios';
import errorHandler from '../helpers/error';
import successHandler from '../helpers/success';
import setImage from '../helpers/setImage';
import { createLoader, removeLoader } from '../helpers/loadingMaker';
import { numFaToEn } from '../helpers/lgConvertor';

const profile = document.getElementsByClassName('profile')[0];
// if (!profile) return;
if (profile) {
  const publicForm = document.getElementsByClassName('public--form')[0];
  publicForm.dataset.url = '/api/v1/users/updateMe';
  const privateForm = document.getElementsByClassName('private--form')[0];
  privateForm.dataset.url = '/api/v1/users/updateMyPassword';

  const img = document.getElementById('person-photo');
  const input = document.getElementById('photo');

  setImage(input, [img], '/img/users/user.png');

  const changeValueLg = (data) => {
    const username = data.get('username');
    const personalPhone = data.get('personalPhone');
    const familyPhone = data.get('familyPhone');
    data.set('username', numFaToEn(username));
    data.set('personalPhone', numFaToEn(personalPhone));
    data.set('familyPhone', numFaToEn(familyPhone));
  };

  [publicForm, privateForm].forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!createLoader(form)) return;
      let body = new FormData(form);
      let message = 'اطلاعات با موفقیت تغییر پیدا کرد.';
      if (form === privateForm) {
        body = {
          passwordCurrent: body.get('passwordCurrent'),
          password: body.get('password'),
          passwordConfirm: body.get('passwordConfirm'),
        };
        message = 'رمز با موفقیت تغییر پیدا کرد';
      } else {
        changeValueLg(body);
      }
      try {
        await axios({
          url: form.dataset.url,
          method: 'PUT',
          data: body,
        });
        successHandler(message, form, 1000, () => {
          location.reload();
        });
      } catch (err) {
        errorHandler(err, form);
      }
      removeLoader(form);
    });
  });
}
