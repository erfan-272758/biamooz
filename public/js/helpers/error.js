/* eslint-disable*/
export default (err, place, time) => {
  console.error(err);
  const { response } = err;
  let status, message;
  if (response) {
    status = response.status;
    message = response.data.message;
  } else {
    message = err;
  }
  const makeup = `<div class="error-panel">
    ${status ? `<h1 class="error-code">${status}</h1>` : ''}
    <h3 class="error-message">${message}</h3>
  </div>
  `;
  time = time || response?.data?.message?.length * 80 || 5000;
  place.insertAdjacentHTML('afterbegin', makeup);
  Array.from(place.querySelectorAll('.error-panel')).pop().scrollIntoView();
  setTimeout(() => {
    Array.from(place.querySelectorAll('.error-panel')).pop().remove();
  }, time);
};
