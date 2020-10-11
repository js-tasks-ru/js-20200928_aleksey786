/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const props = path.split('.');

  return function (obj) {
    if (Object.keys(obj).length == 0) return;

    return props.reduce(function (object, key) {
      return object[key];
    }, obj);
  }
}
