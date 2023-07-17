export const padStartFuncStr = `function padStart(str, length, chars) {
  let result = str;
  const len = str.length;
  if (len < length) {
    const addCount = length - len;
    for (let i = 0; i < addCount; i++) {
      result = '' + chars + result;
    }
    return result;
  }
  if (len > length) {
    const subCount = len - length;
    result = result.slice(subCount);
    return result;
  }
  return result;
}`;

export const hexStringToNumberFuncStr = `function hexStringToNumber(bits) {
  function partition(str, chunk) {
    const res = [];
    const len = str.length;
    for (let i = 0; i < len; i += chunk) {
      res.push(str.slice(i, i + chunk));
    }
    return res;
  }
  return partition(bits, 2).map(item => parseInt(item, 16));
}`;

export const chunkFuncStr = `function chunk(arr, num) {
  const result = [];
  let item = [];
  for (let i = 0; i < arr.length; i++) {
    if (i !== 0 && i % num === 0) {
      result.push(item.concat());
      item = [arr[i]];
    } else {
      item.push(arr[i]);
    }
  }
  result.push(item.concat());
  return result;
}`;

export const isNumberFuncStr = `function isNumber(value) {
  return typeof value === 'number';
}`;

export const highLowToIntFuncStr = `function highLowToInt(high, low) {
  return low + (high << 8);
}`;

export const dealPLFuncStr = `function dealPL(point) {
  const max = 16 ** 4;
  const min = max / 2;
  return point > min ? point - max : point;
}`;

export const shrinkValueFuncStr = `function shrinkValue(value) {
  function scaleNumber(scale, v) {
    return Number((v / 10 ** scale).toFixed(scale));
  }
  return scaleNumber(1, value);
}`;

export const colorDecodeFuncStr = `function colorDecode(color) {
  let rgb;
  if (/^rgb/.test(color)) {
    const matcher =
      color.match(
        /rgba?\\(\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*(?:,\\s*([\\.\\d]+))?\\)/
      ) || [];
    rgb = [matcher[1], matcher[2], matcher[3]].map(item => parseInt(item));
    let alpha = matcher[4];
    if (alpha !== undefined) {
      alpha = alpha > 1 ? 1 : alpha < 0 ? 0 : alpha;
      rgb.push(alpha);
    }
    return rgb;
  }
  color = color.replace(/^#/, '');
  const len = color.length;
  if (len !== 6 && len !== 3) {
    color = '000000';
  }
  if (len === 3) {
    rgb = color.split('').map(item => '' + item + item);
  } else {
    rgb = color.match(/[0-9a-f]{2}/gi) || [];
  }
  return rgb.map(i => {
    i = parseInt(i, 16);
    if (i < 0) i = 0;
    if (i > 255) i = 255;
    return i;
  });
}`;

export const convertColorToArgbHexFuncStr = `function convertColorToArgbHex(originColor) {
  if (!originColor) return '';
  let tmp = originColor;
  let tmpAlpha = 255;
  if (!originColor.match(/^#/) && originColor.length === 8) {
    const [rgb, a] = originColor
      .replace(/(\\w{6})(\\w{2})/, '#$1_$2')
      .split('_');
    tmp = rgb;
    tmpAlpha = parseInt(a, 16);
  }
  const [r, g, b, a] = colorDecode(tmp);
  if (typeof a !== 'undefined') {
    tmpAlpha = Math.floor(Number(a) * 255);
  }
  const [hexr, hexg, hexb, hexa] = [r, g, b, tmpAlpha].map(value =>
    padStart(value.toString(16), 2, '0')
  );
  return '#' + hexa + hexr + hexg + hexb;
}`;
