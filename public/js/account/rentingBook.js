/* eslint-disable*/

const profile = document.getElementsByClassName('profile')[0];
const container = document.querySelector('#b-renting-book');
if (profile && container) {
  const tbody = container.querySelector('table tbody');
  if (tbody) {
    tbody.addEventListener('click', function (e) {
      const tr = e.target.closest('tr');
      if (!tr) return;
      location.assign(`/books/${tr.dataset.id}`);
      e.stopPropagation();
    });
  }
}
