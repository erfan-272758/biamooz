/* eslint-disable*/
import './personalInfo';
import './insertBook';
import './rentingBook';
import './listOfUsers';
import './listOfOthersRequests';
import './listOfMineRequests';
import './notification';
import './message';

const profile = document.getElementsByClassName('profile')[0];
const menuBtn = document.getElementsByClassName('menu-btn')[0];
// if (!profile) return;
if (profile) {
  if (!location.hash) location.hash = '#b-personal-info';
  const visibleSection = (oldHash = '', newHash) => {
    const oldMenu = oldHash.replace('b', 'm');
    const newMenu = newHash.replace('b', 'm');

    document.getElementById(oldHash)?.classList.add('none');
    document.getElementById(newHash)?.classList.remove('none');

    document
      .getElementById(oldMenu)
      ?.closest('li')
      .classList.remove('selected-li');
    document
      .getElementById(newMenu)
      ?.closest('li')
      .classList.add('selected-li');
  };
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('close-btn');
  });
  window.addEventListener('hashchange', (e) => {
    const newHash = window.location.hash.replace('#', '');
    const oldHash = e.oldURL.split('#')[1];
    visibleSection(oldHash, newHash);
    menuBtn.classList.remove('close-btn');
  });

  window.addEventListener('click', (e) => {
    if (e.target.closest('.profile--menu')) return;
    menuBtn.classList.remove('close-btn');
  });

  visibleSection('b-personal-info', location.hash.replace('#', ''));
}
