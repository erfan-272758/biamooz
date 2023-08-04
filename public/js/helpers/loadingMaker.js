/* eslint-disable*/

const createLoader = (place) => {
  const loading = place.querySelector('.circles');
  const temp = place.querySelector('.temp-circles');
  if (loading) return false;
  temp?.remove();
  const makeUp = `   
    <div class="circles">
        <div>
        </div>
        <div>
        </div>
        <div>
        </div>
        <div>
        </div>
        <div>
        </div>
        <div>
        </div>
        <div>
        </div>
        <div>
        </div>
    </div>
`;
  place.insertAdjacentHTML('beforeend', makeUp);
  return true;
};

const removeLoader = (place = document) => {
  const loading = place.querySelector('.circles');
  const temp = place.querySelector('.temp-circles');
  if (loading) loading.remove();
  if (!temp) {
    const makeUp = `<div class="temp-circles"></div>`;
    place.insertAdjacentHTML('beforeend', makeUp);
  }
};

export { createLoader, removeLoader };
