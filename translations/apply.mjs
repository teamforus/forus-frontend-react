import { readFileSync } from 'fs';
import {
    flattenObjectToArray,
    targetLanguages,
    unFlattenArray,
    addOrUpdate,
    cachePath,
    webshopPath,
} from './helpers.mjs';
import { existsSync, writeFileSync } from 'node:fs';

const cacheRemoved = JSON.parse(readFileSync(`${cachePath}/cache_removed.json`).toString());

// load new translation data
const newLangData = targetLanguages.reduce((obj, lang) => {
    return { ...obj, [lang]: JSON.parse(readFileSync(`${cachePath}/cache_translated_${lang}.json`).toString()) };
}, {});

// load old translation data
const oldLangData = targetLanguages.reduce((obj, lang) => {
    const langPath = `${webshopPath}/i18n/translated/${lang}.json`;

    return { ...obj, [lang]: existsSync(langPath) ? JSON.parse(readFileSync(langPath).toString()) : {} };
}, {});

// combine old and new translation data and remove deleted keys
for (let i = 0; i < targetLanguages.length; i++) {
    const lang = targetLanguages[i];
    const langNewData = newLangData[lang];

    oldLangData[lang] = flattenObjectToArray(oldLangData[lang]);

    cacheRemoved.forEach(([delete_key]) => {
        oldLangData[lang] = oldLangData[lang].filter(([row_key]) => row_key !== delete_key);
    });

    langNewData.forEach((row) => {
        oldLangData[lang] = addOrUpdate(oldLangData[lang], row[0], row[1]);
    });
}

for (let i = 0; i < targetLanguages.length; i++) {
    const _lang = targetLanguages[i];
    const _langPath = `${webshopPath}/i18n/translated/${_lang}.json`;

    writeFileSync(_langPath, JSON.stringify(unFlattenArray(oldLangData[_lang]), null, '    '));
}
