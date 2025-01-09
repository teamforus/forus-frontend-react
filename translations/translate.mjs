import { readFileSync } from 'fs';
import {
    removeKeepTags,
    translateValue,
    wrapVariablesWithTags,
    showProgressBar,
    sourceLanguage,
    targetLanguages,
    sortFlattenObjectByKey,
    cachePath,
} from './helpers.mjs';
import { writeFileSync } from 'node:fs';

const cacheAdded = JSON.parse(readFileSync(`${cachePath}/cache_added.json`).toString());
const translated = targetLanguages.reduce((obj, lang) => ({ ...obj, [lang]: [] }), {});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

for (let i = 0; i < targetLanguages.length; i++) {
    const lang = targetLanguages[i];

    console.log(`Processing: ${lang}`);

    for (let j = 0; j < cacheAdded.length; j++) {
        const _line = cacheAdded[j][1]
            ? removeKeepTags(await translateValue(wrapVariablesWithTags(cacheAdded[j][1]), sourceLanguage, lang))
            : '';

        await delay(100);
        translated[lang].push([cacheAdded[j][0], _line]);

        showProgressBar(j, cacheAdded.length);
    }
}

for (let i = 0; i < targetLanguages.length; i++) {
    const lang = targetLanguages[i];
    const langPath = `${cachePath}/cache_translated_${lang}.json`;

    writeFileSync(langPath, JSON.stringify(sortFlattenObjectByKey(translated[lang]), null, '    '));
}
