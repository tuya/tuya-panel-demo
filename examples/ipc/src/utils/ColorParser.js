class Parser {
  format(value, len = 2) {
    let v = `${value}`;
    if (v.length < len) {
      v = '0'.repeat(len - v.length) + v;
    } else {
      v = v.slice(0, len);
    }
    return v;
  }

  /**
   * @desc 将10进制的hsv转换成16进制的hhsssvvvv
   * 范围为h(0-360) s(0-1000) v(0-1000)
   * @param {Array} hsvArr - [h, s, v]
   *
   * @return {String} 'hhhhssssvvvv'
   *
   */
  encodeColorData(h, s, v) {
    let hue = h % 360;
    hue = hue > 0 ? hue : h;
    hue = hue < 0 ? 360 + hue : hue;

    return [hue, s, v].reduce((curr, next) => {
      let hex = parseInt(next, 10).toString(16);
      hex = this.format(hex, 4);
      return curr + hex;
    }, '');
  }

  // t: time; f: frequence; m: sceneMode=[0,1,2];
  // h: hue; s: saturation; v: lightValue; b: whiteBright; k: kelvin
  encodeSceneData(scenes, sceneNum) {
    const scenesValue = scenes.reduce((sum, seconde) => {
      const { t, f, m, h = 0, s = 0, v = 0, b = 0, k = 0 } = seconde;
      const tfm = [t, f, m].reduce((total, next) => {
        let cur = parseInt(next, 10).toString(16);
        cur = this.format(cur, 2);
        return total + cur;
      }, '');
      const hsvbk = [h, s, v, b, k].reduce((total, next) => {
        let cur = parseInt(next, 10).toString(16);
        cur = this.format(cur, 4);
        return total + cur;
      }, '');
      return sum + tfm + hsvbk;
    }, '');
    return this.format(sceneNum, 2) + scenesValue;
  }

  // m: mode; h: hue; s: saturation; v: lightValue; b: whiteBright; k: kelvin;
  // mode: 0 - 跳变; 1 - 呼吸;
  encodeControlData(m, h, s, v, b, k) {
    const hsvbk = [h, s, v, b, k].reduce((total, next) => {
      let cur = parseInt(next, 10).toString(16);
      cur = this.format(cur, 4);
      return total + cur;
    }, '');
    return m + hsvbk;
  }

  /**
   * @desc 将16进制的hhsssvvv转换成10进制的hsv
   * 范围为h(0-360) s(0-1000) v(0-1000)
   * @param {String} hsvStr - encoded hsvStr (hhhhssssvvvv)
   *
   * @return {Array} [h, s, v]
   *
   */
  decodeColorData(byte) {
    if (!byte) {
      return [0, 1000, 1000];
    }
    const b = byte.match(/[a-z\d]{4}/gi) || [];
    return b.reduce((curr, hex) => {
      curr.push(parseInt(hex, 16));
      return curr;
    }, []);
  }

  decodeSceneData(byte) {
    const sceneNum = byte.slice(0, 2);
    const sceneValueArr = byte.slice(2).match(/[a-z\d]{26}/gi) || [];
    const scenes = sceneValueArr.map(item => {
      const tfm = item.slice(0, 6);
      const [t, f, m] = (tfm.match(/[a-z\d]{2}/gi) || []).map(v => parseInt(v, 16));
      const hsvbk = item.slice(6);
      const [h, s, v, b, k] = (hsvbk.match(/[a-z\d]{4}/gi) || []).map(d => parseInt(d, 16));
      return { t, f, m, h, s, v, b, k };
    });
    return {
      sceneNum: parseInt(sceneNum, 16),
      scenes,
    };
  }
}

export const ColorParser = new Parser();

export const calcPercent = (start, end, pos, min = 0) => {
  const distance = end - start;
  const diff = pos - start;
  return (diff / distance) * (1 - min) + min;
};

export const calcPosition = (start, end, percent) => {
  const distance = end - start;
  return percent * distance + start;
};

export const randomHsb = () => {
  const random = (min, max) => {
    let x = max;
    let y = min;
    if (x < y) {
      x = min;
      y = max;
    }
    return Math.random() * (x - y) + y;
  };
  return [random(0, 360), 100, 100];
};

export const arrayToObject = arr => {
  if (arr.length === 0) {
    return {};
  }
  return Object.assign(...arr);
};
