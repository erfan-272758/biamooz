/* eslint-disable*/
//۱٬۲۳۴٬۵۶۷٬۸۹۰
//۰۹۳۹۰۹۵۸۳۷۹
const faToEnMap = new Map([
  ['۱', 1],
  ['۲', 2],
  ['۳', 3],
  ['۴', 4],
  ['۵', 5],
  ['۶', 6],
  ['۷', 7],
  ['۸', 8],
  ['۹', 9],
  ['۰', 0],
  ['٬', ''],
]);

export const numFaToEn = (num) => {
  if (!num) return;
  return num.replace(/(۱|۲|۳|۴|۵|۶|۷|۸|۹|۰)/g, (match) => faToEnMap.get(match));
};
