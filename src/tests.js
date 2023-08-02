import fs from 'fs';
import * as csstree from 'css-tree';
import palette from 'image-palette';
import pixels from 'image-pixels';
import {
  launchBrowser,
  hasElementBySelectors,
  getStyle,
} from 'lib-verstka-tests';
import {
  sortColors,
  compareColors,
} from './utils.js';

const colorScheme = async (page) => {
  const isFound = await hasElementBySelectors(page, 'meta[name=color-scheme]:is([content~="dark"]):is([content~="light"])');

  if (!isFound) {
    return {
      id: 'notColorScheme',
    };
  }

  return false;
};

const switchScheme = async (url) => {
  const launchOptions = { args: ['--no-sandbox', '--disable-setuid-sandbox'] };
  const viewport = { width: 1440, height: 1080 };
  const { browser, page } = await launchBrowser(url, { launchOptions, viewport });
  const buttonSelector = '.theme-list__item:first-child .theme-list__button';
  const hasButton = await hasElementBySelectors(page, buttonSelector);

  if (!hasButton) {
    return {
      id: 'switchButtonsChanged',
    };
  }

  await page.click(buttonSelector);
  await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    imgs.forEach((img) => img.remove());
  });
  await page.screenshot({ path: 'layout-dark.jpg', fullPage: true });
  const { colors: canonicalColors } = palette(await pixels('./layout-canonical-dark.jpg'), 4);
  const { colors: studentColors } = palette(await pixels('./layout-dark.jpg'), 4);
  const canonicalColorsSorted = sortColors(canonicalColors);
  const studentColorsSorted = sortColors(studentColors);
  const isSame = canonicalColorsSorted
    .every((color, index) => compareColors(color, studentColorsSorted[index], 20));

  await browser.close();

  if (!isSame) {
    return {
      id: 'notDarkColorScheme',
    };
  }

  return false;
};

const semanticTags = async (page, tags) => {
  const tagsAfterSearch = await Promise.all(tags.map(async (tagName) => {
    const isFound = await hasElementBySelectors(page, tagName);

    return {
      tagName,
      isMissing: !isFound,
    };
  }));
  const missingTags = tagsAfterSearch.filter(({ isMissing }) => isMissing);
  const missingTagNames = missingTags.map(({ tagName }) => tagName);

  if (missingTagNames.length) {
    return {
      id: 'semanticTagsMissing',
      values: {
        tagNames: missingTagNames.join(', '),
      },
    };
  }

  return false;
};

const fonts = (cssPath, fontList) => {
  const cssCode = fs.readFileSync(cssPath, 'utf-8');
  const ast = csstree.parse(cssCode);
  const fontNodes = csstree.findAll(ast, (node) => node.type === 'Atrule' && node.name === 'font-face');
  const fontCodeList = fontNodes.map((node) => csstree.generate(node.block));
  const missingFonts = fontList.filter((font) => !fontCodeList.some((code) => code.includes(font)));

  if (missingFonts.length !== 0) {
    return {
      id: 'fontsMissing',
      values: {
        fontNames: missingFonts.join(', '),
      },
    };
  }

  return false;
};

const variantFontFormats = (cssPath, font) => {
  const cssCode = fs.readFileSync(cssPath, 'utf-8');
  const ast = csstree.parse(cssCode);
  const fontNodes = csstree.findAll(ast, (node) => node.type === 'Atrule' && node.name === 'font-face');
  const fontCodeList = fontNodes.map((node) => csstree.generate(node.block));
  const fontCode = fontCodeList.find((code) => code.includes(font)) ?? '';

  const formats = ['woff2 supports variations', 'woff2-variations'];
  const missingFontFormats = formats.filter((format) => !fontCode.includes(format));
  if (!missingFontFormats.length !== 0) {
    return {
      id: 'variantFontFormatMissing',
      values: {
        formats: missingFontFormats.join(', '),
      },
    };
  }

  return false;
};

const transition = (styleCode) => {
  const ast = csstree.parse(styleCode);

  const transitionDeclarations = csstree.findAll(ast, (node) => node.type === 'Declaration' && (node.property === 'transition' || node.property === 'transition-property'));
  const transitionProperties = transitionDeclarations.map((decl) => csstree.generate(decl));
  const values = transitionProperties
    .map((prop) => prop.split(':')[1])
    .map((value) => value.split(','))
    .flat()
    .map((value) => value.split(' '))
    .flat();

  if (values.some((value) => value === 'all')) {
    return { id: 'transition' };
  }

  return false;
};

export {
  colorScheme,
  switchScheme,
  semanticTags,
  fonts,
  variantFontFormats,
  transition,
};
