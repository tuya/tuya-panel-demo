/* eslint-disable no-restricted-syntax */

const parseJson = str => {
  let result;
  if (str && typeof str === 'string') {
    // as jsonstring
    try {
      result = JSON.parse(str);
    } catch (parseError) {
      // error! use eval
      try {
        // eslint-disable-next-line
        result = eval(`(${str})`);
      } catch (evalError) {
        // normal string
        result = str;
      }
    }
  } else {
    result = str || {};
  }
  return result;
};

export const camelize = str => {
  if (typeof str === 'number') {
    return `${str}`;
  }
  const ret = str.replace(/[-_\s]+(.)?/g, (match, chr) => (chr ? chr.toUpperCase() : ''));
  // Ensure 1st char is always lowercase
  return ret.substr(0, 1).toLowerCase() + ret.substr(1);
};

export const formatUiConfig = devInfo => {
  const uiConfig = devInfo.uiConfig ? { ...devInfo.uiConfig } : {};

  Object.keys(devInfo.schema).forEach(itKey => {
    const dps = devInfo.schema[itKey];
    const strKey = `dp_${dps.code}`;
    const key = camelize(strKey);
    uiConfig[key] = {
      key,
      strKey: strKey.toLowerCase(),
      code: dps.code,
      attr: {},
      attri: {},
    };

    switch (dps.type) {
      case 'enum':
        dps.range.forEach(it => {
          const k = `${strKey}_${it}`.toLowerCase();
          uiConfig[key].attr[it] = k;
          uiConfig[key].attri[k] = it;
        });
        break;
      case 'bool':
        {
          const on = `${strKey}_on`.toLowerCase();
          const off = `${strKey}_off`.toLowerCase();
          uiConfig[key].attr = {
            false: off,
            true: on,
          };
          uiConfig[key].attri = {
            [`${strKey}_off`.toLowerCase()]: false,
            [`${strKey}_on`.toLowerCase()]: true,
          };
        }
        break;
      case 'bitmap':
        for (const v of dps.label) {
          const k = `${strKey}_${v}`.toLowerCase();
          uiConfig[key].attr[v] = k;
          uiConfig[key].attri[k] = v;
        }
        break;

      default:
        break;
    }
  });

  if (!devInfo.panelConfig || !devInfo.panelConfig.bic) return uiConfig;

  const { bic } = devInfo.panelConfig;

  for (const i in bic) {
    if (Object.prototype.hasOwnProperty.call(bic, i)) {
      const key = camelize(`panel_${bic[i].code}`);
      if (bic[i].selected === true) {
        uiConfig[key] = bic[i].value ? parseJson(bic[i].value) : true;
      } else {
        uiConfig[key] = false;
      }
    }
  }
  return uiConfig;
};
