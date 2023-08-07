import path from 'path';
import {
  launchBrowser,
  compareLayout,
  runTests,
  mkdir,
  mkfile,
  structure,
  stylelint,
  w3c,
  orderStyles,
  lang,
  titleEmmet,
  horizontalScroll,
} from 'lib-verstka-tests';
import ru from './locales/ru.js';
import {
  colorScheme,
  switchScheme,
  semanticTags,
  fonts,
  variantFontFormats,
  variantFontWeight,
  varsDeclAndUsage,
  fontVariationSettings,
  transition,
  inlineSVG,
} from './tests.js';
import {
  getStyleCode,
} from './utils.js';

const [, , PROJECT_PATH, LANG = 'ru'] = process.argv;

const app = async (projectPath, lng) => {
  const options = {
    projectPath,
    lang: lng,
    resource: ru,
  };

  const check = async () => {
    const tree = mkdir('project', [
      mkfile('index.html'),
      mkdir('scripts', [
        mkfile('like.js'),
        mkfile('set-theme.js'),
      ]),
      mkdir('styles', [
        mkfile('globals.css'),
        mkfile('style.css'),
        mkfile('variables.css'),
        mkfile('animations.css'),
        mkfile('themes.css'),
      ]),
      mkdir('fonts', [
        mkfile('fonts.css'),
      ]),
      mkdir('images', []),
      mkdir('svg', []),
    ]);
    const structureErrors = structure(projectPath, tree);

    if (structureErrors.length) {
      return structureErrors;
    }

    const baseUrl = 'http://localhost:3000';
    const viewport = { width: 1440, height: 1080 };
    const launchOptions = { args: ['--no-sandbox', '--disable-setuid-sandbox'] };
    const { browser, page } = await launchBrowser(baseUrl, { launchOptions, viewport });
    const styleCode = getStyleCode(projectPath);
    const errors = (await Promise.all([
      w3c(projectPath, 'index.html'),
      stylelint(projectPath),
      orderStyles(page, ['fonts.css', 'globals.css']),
      lang(page, lng),
      titleEmmet(page),
      colorScheme(page),
      switchScheme(baseUrl),
      semanticTags(page, ['header', 'main', 'nav']),
      horizontalScroll(page),
      fonts(path.join(projectPath, 'fonts', 'fonts.css'), ['Inter', 'PressStart2P']),
      variantFontFormats(path.join(projectPath, 'fonts', 'fonts.css'), 'Inter'),
      variantFontWeight(path.join(projectPath, 'fonts', 'fonts.css'), 'Inter'),
      varsDeclAndUsage(styleCode),
      fontVariationSettings(styleCode),
      transition(styleCode),
      inlineSVG(page),
    ]))
      .filter(Boolean)
      .flat();

    await Promise.all([
      compareLayout(baseUrl, {
        canonicalImage: 'layout-canonical-1440.jpg',
        pageImage: 'layout-1440.jpg',
        outputImage: 'output-1440.jpg',
        browserOptions: { launchOptions, viewport: { width: 1440, height: 1080 } },
      }, {
        onBeforeScreenshot: async (p) => {
          try {
            await p.click('.theme-menu__item:last-child .theme-menu__button');
            await p.waitForTimeout(2000);
          } catch (e) { }
        },
      }),
      compareLayout(baseUrl, {
        canonicalImage: 'layout-canonical-375.jpg',
        pageImage: 'layout-375.jpg',
        outputImage: 'output-375.jpg',
        browserOptions: { launchOptions, viewport: { width: 375, height: 668 } },
      }, {
        onBeforeScreenshot: async (p) => {
          try {
            await p.click('.theme-menu__item:last-child .theme-menu__button');
            await p.waitForTimeout(2000);
          } catch (e) { }
        },
      }),
    ]);

    await browser.close();
    console.log('\x1b[1;33m%s\x1b[0m', 'Скриншоты имеют рекомендательный характер и не влияют на тесты.');

    return errors;
  };

  await runTests(options, check);
};

app(PROJECT_PATH, LANG);
