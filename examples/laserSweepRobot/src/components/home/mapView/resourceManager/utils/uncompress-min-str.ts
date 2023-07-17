import { BinaryClassStr } from './binary-min-str';

export const unCompressFuncStr = `
  ${BinaryClassStr}

  const binary = new Binary();
      
  function bindingsUncompress(input, output, sIdx, eIdx) {
    sIdx = sIdx || 0;
    eIdx = eIdx || input.length - sIdx;
    for (var i = sIdx, n = eIdx, j = 0; i < n; ) {
      const token = input[i++];
      let literals_length = token >> 4;
      if (literals_length > 0) {
        var l = literals_length + 240;
        while (l === 255) {
          l = input[i++];
          literals_length += l;
        }
        var end = i + literals_length;
        while (i < end) output[j++] = input[i++];
        if (i === n) return j;
      }
      const offset = input[i++] | (input[i++] << 8);
      if (offset === 0 || offset > j) return -(i - 2);
      let match_length = token & 0xf;
      var l = match_length + 240;
      while (l === 255) {
        l = input[i++];
        match_length += l;
      }
      let pos = j - offset;
      var end = j + match_length + 4;
      while (j < end) output[j++] = output[pos++];
    }
    return j;
  }

  function uncompress(bytes, size = 1024 * 1024) {
    const input = Buffer.from(bytes);
    const oneG = 1073741824;
    let finalSize = size;
    if (size > oneG) {
      finalSize = oneG;
      return [];
    }
    let uncompressed = Buffer.alloc(finalSize);
    const uncompressedSize = bindingsUncompress(input, uncompressed);
    uncompressed = uncompressed.slice(0, uncompressedSize);
    return uncompressed;
  }
`;
