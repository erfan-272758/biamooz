/*eslint-disable */

const close_site_new = document.querySelector('#close_site_new');
const container_site_new = document.querySelector('#site_new_container');

if (close_site_new) {
  close_site_new.addEventListener('click', (e) => {
    e.preventDefault();
    if (!container_site_new) return;
    // set opacity
    container_site_new.classList.add('invisible');
    setTimeout(() => {
      if (container_site_new) {
        container_site_new.classList.add('gone');
      }
    }, 500);
  });
}
