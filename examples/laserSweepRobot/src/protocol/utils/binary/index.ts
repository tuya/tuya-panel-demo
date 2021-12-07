function toFixed(d = '', length = 32, symbol = 0) {
  if (d.length < length) {
    return symbol + '0'.repeat(length - 1 - d.length) + d;
  }
  return d;
}

class Binary {
  length: number;

  constructor({ length = 32 } = {}) {
    this.length = length;
  }

  getBinary(d: number) {
    return Math.abs(d).toString(2);
  }

  // 原码
  trueForm(d: number) {
    const two = this.getBinary(d);

    if (d >= 0) {
      return toFixed(two, this.length, 0);
    }
    return toFixed(two, this.length, 1);
  }

  // 反码
  inverse(d: number) {
    const trueForm = this.trueForm(d);
    if (d >= 0) {
      return trueForm;
    }
    let data = '';
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < this.length; index++) {
      const item = trueForm[index];
      if (index === 0) {
        data += item;
      } else {
        data += Math.abs(+item - 1);
      }
    }
    return data;
  }

  // 补码
  complement(d: number) {
    const trueForm = this.trueForm(d);
    const inverse = this.inverse(d);
    if (d >= 0) {
      return trueForm;
    }
    const valid = inverse.slice(1);
    const validTenComplete = parseInt(valid, 2) + 1;
    const validTwoComplete = toFixed(validTenComplete.toString(2), this.length, 1);
    return validTwoComplete;
  }
}

export default new Binary();
