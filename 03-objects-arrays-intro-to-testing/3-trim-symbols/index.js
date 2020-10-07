/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size===undefined) return string;

  let curChar = null;
  let curCount = 0;
  let res = '';

  for (let i = 0; i < string.length; i++) {
    if (curChar !== string[i]) {
      curChar = string[i];
      curCount = 0;
    }

    if (curChar === string[i] && curCount < size) {
      res += string[i];
      curCount++;
    }
  }
  return res;
}
