export const BinaryClassStr = `
function Binary(length) {
  this.length = length === undefined ? 32 : length;
}

Binary.prototype.toFixed = function(d = '', length = 32, symbol = 0) {
  if (d.length < length) {
    return symbol + '0'.repeat(length - 1 - d.length) + d;
  }
  return d;
};

Binary.prototype.getBinary = function(d) {
  return Math.abs(d).toString(2);
};

Binary.prototype.trueForm = function(d) {
  const two = this.getBinary(d);
  if (d >= 0) {
    return this.toFixed(two, this.length, 0);
  }
  return this.toFixed(two, this.length, 1);
};

Binary.prototype.inverse = function(d) {
  const trueForm = this.trueForm(d);
  if (d >= 0) {
    return trueForm;
  }
  let data = '';
  for (let index = 0; index < this.length; index++) {
    const item = trueForm[index];
    if (index === 0) {
      data += item;
    } else {
      data += Math.abs(+item - 1);
    }
  }
  return data;
};

Binary.prototype.complement = function(d) {
  const trueForm = this.trueForm(d);
  const inverse = this.inverse(d);
  if (d >= 0) {
    return trueForm;
  }
  const valid = inverse.slice(1);
  const validTenComplete = parseInt(valid, 2) + 1;
  const validTwoComplete = this.toFixed(validTenComplete.toString(2), this.length, 1);
  return validTwoComplete;
};
`;
