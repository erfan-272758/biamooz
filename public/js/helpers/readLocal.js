/* eslint-disable*/
export default (form, text, cb) => {
  const lastSeen = localStorage.getItem('lastSeen') ?? Date.now();
  if (+lastSeen < Date.now() - 10 * 60 * 1000) {
    localStorage.clear();
  }
  if (cb && !cb()) return;
  form.dataset.query = localStorage.getItem(`${form.id}__params`) ?? '';
  text.dataset.numOfPages =
    localStorage.getItem(`${form.id}__num`) || text.dataset.numOfPages;
};
