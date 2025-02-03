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

// Calculate total characters for translation preview
const totalLength = cacheAdded.reduce((sum, entry) => {
    return sum + (entry[1] ? entry[1].length : 0);
}, 0);

console.log(`Total characters to be translated: ${totalLength}`);

for (let i = 0; i < targetLanguages.length; i++) {
    const lang = targetLanguages[i];

    console.log(`Processing: ${lang}`);

    for (let j = 0; j < cacheAdded.length; j++) {
        let _line = '';
        let attempts = 0;

        while (attempts < 10) {
            try {
                _line = cacheAdded[j][1]
                    ? removeKeepTags(
                          await translateValue(wrapVariablesWithTags(cacheAdded[j][1]), sourceLanguage, lang),
                      )
                    : '';
                break; // Exit retry loop on success
            } catch (error) {
                attempts++;
                console.error(`Error translating (${lang}) [Attempt ${attempts}]:`, error);

                if (attempts < 10) {
                    await delay(1000); // Wait 1 sec before retrying
                }
            }
        }

        translated[lang].push([cacheAdded[j][0], _line]);

        showProgressBar(j, cacheAdded.length);
    }
}

for (let i = 0; i < targetLanguages.length; i++) {
    const lang = targetLanguages[i];
    const langPath = `${cachePath}/cache_translated_${lang}.json`;

    writeFileSync(langPath, JSON.stringify(sortFlattenObjectByKey(translated[lang]), null, '    '));
}
