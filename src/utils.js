import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const sortColors = (colors) => colors.sort((color1, color2) => (
  color1.reduce((acc, channel, index) => acc || channel - color2[index], 0)
));

const compareColors = (color1, color2, tolerance = 10) => (
  color1.every((channel, index) => Math.abs(channel - color2[index]) <= tolerance)
);

const getStyleCode = (source) => {
  const files = glob.sync('**/*.css', { cwd: source, ignore: ['**/node_modules/**'] });
  return files.reduce((acc, filepath) => {
    const code = fs.readFileSync(path.join(source, filepath), 'utf-8');
    return `${acc} \n ${code}`;
  }, '');
};

export {
  sortColors,
  compareColors,
  getStyleCode,
};
