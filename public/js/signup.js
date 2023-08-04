/* eslint-disable*/
import axios from 'axios';
import errorHandler from './helpers/error';
import successHandler from './helpers/success';
import { createLoader, removeLoader } from './helpers/loadingMaker';
import { numFaToEn } from './helpers/lgConvertor';

const signupSection = document.getElementById('signup--section');
if (signupSection) {
  const form = document.getElementById('signup--form');
  const rulesSection = document.getElementById('signup--rules');
  const rulesContent = rulesSection.querySelector('div');
  const rulesClose = document.getElementById('close--rules');
  const rulesLabel = document.querySelector('#label-rules span');

  rulesLabel.addEventListener('click', () => {
    rulesSection.classList.remove('none');
    rulesContent.scrollIntoView();
  });

  rulesClose.addEventListener('click', () => {
    rulesSection.classList.add('none');
    rulesLabel.scrollIntoView();
  });

  form.addEventListener('input', (e) => {
    const input = e.target;
    const label = e.target.parentElement.querySelector('label');
    if (!input || !label || label.id === 'label-rules') return;
    if (input.value.length === 0) label.classList.remove('label-fixed');
    else label.classList.add('label-fixed');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!createLoader(form)) return;
    const fd = new FormData(form);

    const firstName = fd.get('firstName');
    const lastName = fd.get('lastName');
    const email = fd.get('email');
    const username = numFaToEn(fd.get('username'));
    const personalPhone = numFaToEn(fd.get('personalPhone'));
    const familyPhone = numFaToEn(fd.get('familyPhone'));
    const parentName = fd.get('parentName');
    const password = fd.get('password');
    const passwordConfirm = fd.get('passwordConfirm');
    const schoolName = fd.get('schoolName');
    const address = fd.get('address');

    try {
      await axios({
        method: 'POST',
        url: '/api/v1/users/signup',
        data: {
          firstName,
          lastName,
          email,
          password,
          passwordConfirm,
          username,
          personalPhone,
          familyPhone,
          parentName,
          schoolName,
          address,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      successHandler('با موفقیت نام نویسی شدید', signupSection, 1500, () => {
        location.assign('/my');
      });
    } catch (err) {
      errorHandler(err, signupSection);
    }
    removeLoader(form);
  });
}
