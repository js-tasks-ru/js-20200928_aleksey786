/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */

export function sortStrings(arr, param = 'asc') {
  switch (param) {
    case 'asc':  return sortStr(arr, 1);
    case 'desc': return sortStr(arr, -1);
    default:
      return [...arr];
  }
}

function sortStr(arr, direction) {
  const sortarr = [...arr];
  const LOCALES = ["ru", "en"];
  const COMPARE_OPT = {sensitivity: "case", caseFirst: "upper"};
  return sortarr.sort((a, b) => direction * a.localeCompare(b, LOCALES, COMPARE_OPT));;
}
