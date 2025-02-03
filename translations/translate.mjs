import { readFileSync, writeFileSync } from 'fs';
import {
    removeKeepTags,
    translateBatch,
    wrapVariablesWithTags,
    showProgressBar,
    sourceLanguage,
    targetLanguages,
    sortFlattenObjectByKey,
    cachePath,
} from './helpers.mjs';

const cacheAdded = JSON.parse(readFileSync(`${cachePath}/cache_added.json`).toString());
const translated = targetLanguages.reduce((obj, lang) => ({ ...obj, [lang]: [] }), {});

// Calculate total characters for translation preview
const totalLength = cacheAdded.reduce((sum, entry) => {
    return sum + (entry[1] ? entry[1].length : 0);
}, 0);

console.log(`Total characters to be translated: ${totalLength}`);

const BATCH_SIZE = 500;

for (let i = 0; i < targetLanguages.length; i++) {
    const lang = targetLanguages[i];

    console.log(`Processing: ${lang}`);

    for (let j = 0; j < cacheAdded.length; j += BATCH_SIZE) {
        const batch = cacheAdded.slice(j, j + BATCH_SIZE).map(([key, value]) => ({
            key,
            text: value ? wrapVariablesWithTags(value) : '',
        }));

        let translatedBatch = await translateBatch(batch, sourceLanguage, lang);

        for (let k = 0; k < batch.length; k++) {
            translated[lang].push([batch[k].key, removeKeepTags(translatedBatch[k] || '')]);
        }

        showProgressBar(Math.min(j + BATCH_SIZE, cacheAdded.length), cacheAdded.length);
    }
}

for (let i = 0; i < targetLanguages.length; i++) {
    const lang = targetLanguages[i];
    const langPath = `${cachePath}/cache_translated_${lang}.json`;

    writeFileSync(langPath, JSON.stringify(sortFlattenObjectByKey(translated[lang]), null, '    '));
}
