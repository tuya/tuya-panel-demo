const fs = require('fs');

const data = fs.readdirSync('./src/res/lotties');

const images = data.filter(file => /\.json$/.test(file));
const previous = images.map(file => file.replace(/(@\dx)?\.json/, ''));
const uniq = [...new Set(previous)];
const toCamelCase = uniq.map(file =>
  file.replace(/(?:[\W_]+)(\w)/g, (match, $1) => $1.toUpperCase())
);
const imp = uniq.reduce((pre, cur, idx) => {
  // const item = `const ${toCamelCase[idx]} = require('./${cur}.json');\n`;
  const item = `const ${cur} = require('./${cur}.json');\n`;
  return pre + item;
}, '');

// const exp = uniq.reduce((pre, cur) => {
//     const item = `const ${cur} = require('./${cur}.json')\n`;
//     return pre + item;
//   }, '');

// const exp = `\nexport default { ${toCamelCase.join(', ')} };`;
const exp = `\nexport default { ${uniq.join(', ')} };`;

console.log(previous);
console.log(imp, exp);

fs.writeFileSync('./src/res/lotties/index.ts', imp + exp);
