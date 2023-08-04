/* eslint-disable*/

const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

class Watcher {
  static watch(header, el, className, threshold, cb, root = null) {
    const w = new Watcher(header, el, className, threshold, cb, root);
    w._setObserver();
    w._setScroller();
    return w;
  }

  constructor(header, el, className, threshold, cb, root = null) {
    this.el = el;
    this.className = className;
    this.op = { root, threshold };
    this.cb = cb;
    this.header = header;
  }

  observe() {
    this.ob.observe(this.el);
  }
  unobserve() {
    this.ob.unobserve(this.el);
  }

  _setObserver() {
    const _observerCb = ([entry], ob) => {
      if (
        (this.cb && !this.cb(entry)) ||
        isInViewport(this.header) ||
        entry.isIntersecting
      )
        return;
      this.el.classList.add(this.className);
      this.elTop =
        this.el.getBoundingClientRect().top +
        window.scrollY +
        this.el.offsetHeight / 2;
    };
    this.ob = new IntersectionObserver(_observerCb, this.op);
    this.ob.observe(this.el);
  }

  _setScroller() {
    let oldScroll;
    window.addEventListener('scroll', () => {
      if (
        !this.elTop ||
        window.scrollY >= this.elTop ||
        window.scrollY - oldScroll > 0
      ) {
        oldScroll = window.scrollY;
        return;
      }
      oldScroll = window.scrollY;
      this.el.classList.remove(this.className);
    });
  }
}

export default Watcher;
