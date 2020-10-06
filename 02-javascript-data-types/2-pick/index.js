/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
  const copy = {};
  // так как fields - часть полей объекта,
  // то быстрее пробежатся по ним, чем по всем полям объекта
  for (const item of fields) {
    copy[item] = obj[item];
  }
  return copy;
};
