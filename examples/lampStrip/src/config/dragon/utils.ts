export const transform = function* transform(value) {
  let start = 0;
  let result = 0;
  let length;
  for (; true; ) {
    length = yield result;
    result = value.substr(start, length);
    if (start + length >= value.length) {
      break;
    }
    start += length;
  }
  return result;
};

export const generateStep =
  (generator, length = 4, type = 'number') =>
  () => {
    const { value } = generator.next(length);
    if (type === 'number') {
      return parseInt(value, 16);
    }
    return value;
  };
