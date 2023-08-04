/* eslint-disable*/
function messageConvertor(message) {
  return message.replace(/\n/g, '<br>');
}

export default (message, place, time = 5000, callback) => {
  const makeup = `<div class="success-panel">
      <h3 class="success-message">${messageConvertor(message)}</h3>
    </div>
    `;
  place.insertAdjacentHTML('afterbegin', makeup);
  Array.from(place.querySelectorAll('.success-panel')).pop().scrollIntoView();
  setTimeout(() => {
    Array.from(place.querySelectorAll('.success-panel')).pop().remove();
    if (callback) callback();
  }, time);
};
