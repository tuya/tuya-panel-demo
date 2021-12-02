const bindings = require('./binding');

module.exports.decodeBlock = bindings.uncompress;

module.exports.encodeBound = bindings.compressBound;
module.exports.encodeBlock = bindings.compress;
module.exports.encodeBlockHC = bindings.compressHC;

const { Buffer } = require('buffer');

function uncompress(bytes, size = 1024 * 1024) {
  const input = Buffer.from(bytes);
  const oneG = 1073741824 // 最大分配1G内存
  let finalSize = size
  if (size > oneG) {
    finalSize = oneG
    console.warn('uncompress所需空间过大，强制设定为1G', size)
  }
  let uncompressed = Buffer.alloc(finalSize);
  const uncompressedSize = bindings.uncompress(input, uncompressed);
  uncompressed = uncompressed.slice(0, uncompressedSize);
  return uncompressed;
}

module.exports.uncompress = uncompress;

// const data = `46 00 00 07 ff 01 00 29 f4 00 01 00 19 04 0e 00 03 02 00 16 01 2f 00 23 ff fd 14 00 03 02 00 13 01 08 00 0a 02 00 17 7f 31 00 16 40 1b 00 50 00 00 00 00 40`
//   .split(' ')
//   .map(d => parseInt(d, 16));

// const res = uncompress(data);

// debugger;

export default {
  uncompress,
};
