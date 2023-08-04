/* eslint-disable */
'use strict';
import 'regenerator-runtime/runtime';
import 'core-js/stable';
import './overview';
import './login';
import './signup';
import './book';
import './rent';
import './user';
import './header';
import './forgotPassword';
import './resetPassword';
import './account/account';

window.addEventListener('load', () => {
  localStorage.setItem('lastSeen', Date.now());
});
