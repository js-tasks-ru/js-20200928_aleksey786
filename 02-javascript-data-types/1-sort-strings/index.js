/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */

export function sortStrings(arr, param = 'asc') {
  const sortarr = [...arr];
  const LOCALES = ["ru","en"];
  const COMPARE_OPT = {sensitivity: "case", caseFirst: "upper"};
  if (param === 'asc') {
    sortarr.sort((a, b) => a.localeCompare(b, LOCALES, COMPARE_OPT));
  } else {
    sortarr.sort((a, b) => b.localeCompare(a, LOCALES, COMPARE_OPT));
  }
  return sortarr;
}
