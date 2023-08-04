/* eslint-disable*/

export default (feature, hash) => {
  const checkRequest = (e) => {
    if (location.hash !== hash) return;
    const navEntries = window.performance?.getEntriesByType('navigation');
    if (navEntries.length > 0 && navEntries[0].type === 'back_forward')
      location.reload();
    feature.sendQuery();
  };

  window.addEventListener('hashchange', checkRequest);
  window.addEventListener('load', checkRequest);
};
