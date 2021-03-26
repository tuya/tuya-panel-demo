const fs = require('fs');

const data = fs.readdirSync('./src/res');

const images = data.filter(file => /\.png$/.test(file));
const previous = images.map(file => file.replace(/(@\dx)?\.png/, ''));
const uniq = [...new Set(previous)];
const toCamelCase = uniq.map(file =>
  file.replace(/(?:[\W_]+)(\w)/g, (match, $1) => $1.toUpperCase())
);
const imp = uniq.reduce((pre, cur) => {
  const item = `const ${toCamelCase[idx]} = require('./${cur}.png');\n`;
  return pre + item;
}, '');

// const exp = uniq.reduce((pre, cur) => {
//     const item = `const ${cur} = require('./${cur}.png')\n`;
//     return pre + item;
//   }, '');

const exp = `\nexport default { ${toCamelCase.join(', ')} };`;

console.log(previous);
console.log(imp, exp);

fs.writeFileSync('./src/res/index.ts', imp + exp);
