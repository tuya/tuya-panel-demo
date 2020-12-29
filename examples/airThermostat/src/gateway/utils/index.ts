export const hasProp = (target: any, prop: string): boolean => {
  if (typeof target === 'object') {
    // eslint-disable-next-line no-prototype-builtins
    return target.hasOwnProperty(prop) && target[prop] !== undefined;
  }
  return false;
};

export const getValue = (target: any, prop: string): any => {
  if (typeof target === 'object') {
    return target[prop];
  }
  return undefined;
};
