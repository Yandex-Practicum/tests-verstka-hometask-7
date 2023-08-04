export default {
  translation: {
    notColorScheme: 'Отсутствует <meta name="color-scheme" content="dark light" />.',
    switchButtonsChanged: 'Не меняйте разметку кнопок переключения цветовой схемы, которая была в стартовом коде.',
    notDarkColorScheme: 'Тёмная цветовая схема не соответствует макету.',
    semanticTagsMissing: 'Отсутствуют семантические теги: `{{ tagNames }}`.',
    fontsMissing: 'Отсутствуют шрифты: `{{ fontNames }}`.',
    variantFontFormatMissing: 'При подключении вариативного шрифта не указаны форматы: `{{ formats }}`.',
    variantFontWeightMissing: 'Вариативному шрифту не заданы при импорте (в файле fonts.css) все начертания. Укажите начертания: `{{ weights }}`.',
    varsNotDeclOrNotUsage: 'CSS-переменные не заданы или не используются.',
    fontVariationSettingsMissing: 'Отсутствуют настройки вариативных шрифтов. Укажите свойство `font-variation-settings`.',
    transition: 'Запрещено использовать значение `all` в свойствах `transition` и `transition-property`.',
    inlineSVG: 'Только SVG с сердцем внутри карточки вставлены инлайново (необходимо для анимации), остальные — через symbol + use.',
  },
};
