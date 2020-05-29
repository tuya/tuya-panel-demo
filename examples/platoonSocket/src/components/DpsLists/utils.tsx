/* eslint-disable */
/**
 * lodash get polyfill
 * https://gist.github.com/dfkaye/59263b51cf1e0b633181c5f44ae2066a
 */
var at = function get(object: any, pathString: any, defaultValue: any) {
  // Coerce pathString to a string (even it turns into "[object Object]").
  var parts = (pathString + '').split('.');
  var length = parts.length;
  var i = 0;

  // In case object isn't a real object, set it to undefined.
  var value = object === Object(object) ? object : undefined;

  while (value != null && i < length) {
    value = value[parts[i++]];
  }

  /**
   * lodash.get() returns the resolved value if
   * 1. iteration happened (i > 0)
   * 2. iteration completed (i === length)
   * 3. the value at the path is found in the data structure (not undefined). Note that if the path is found but the
   *    value is null, then null is returned.
   * If any of those checks fails, return the defaultValue param, if provided.
   */
  return i && i === length && value !== undefined ? value : defaultValue;
};

export const get = at;

export const arrayToObject = (arr: any) => {
  if (!arr || arr.length === 0) return {};
  return Object.assign({}, ...arr);
};
