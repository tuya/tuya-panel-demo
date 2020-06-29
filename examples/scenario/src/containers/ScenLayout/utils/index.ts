import gbk from './gbk';

export const bytesToHex = bytes => {
  const hex = [];
  for (let i = 0; i < bytes.length; i++) {
    // eslint-disable-next-line
    // eslint-disable-next-line
    let d = bytes[i].toString(16);
    if (i >= 3) {
      (d = gbk.UrlEncode(bytes[i])), (d = d.replace('%', ''));
      d = d.replace('%', '');
    }

    if (i < 3) {
      while (d.length < 8) {
        d = `0${d}`;
      }
    }
    hex.push(d);
  }
  let strHex = hex.join('');
  while (strHex.length < 34) {
    strHex += '0';
  }
  return strHex;
};

export const renderText = (label: any, index: number) => {
  if (index < label.length) {
    return label[index];
  }
  return '';
};
