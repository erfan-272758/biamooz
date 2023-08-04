/* eslint-disable*/

export default (watcher, hash) => {
  const checkRequest = () => {
    if (location.hash !== hash) {
      watcher.unobserve();
    } else {
      watcher.observe();
    }
  };

  window.addEventListener('hashchange', checkRequest);
  window.addEventListener('load', checkRequest);
};
