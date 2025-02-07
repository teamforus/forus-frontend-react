import lodash from 'lodash';
import deepl from 'deepl-node';
import deeplEnv from '../deepl.env.mjs';
const { forOwn, isObject, isEmpty } = lodash;
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const sourceLanguage = deeplEnv.sourceLanguage;
export const targetLanguages = deeplEnv.targetLanguages;

export const cachePath = `${__dirname}/cache`;
export const webshopPath = `${__dirname}/../react/src/webshop`;

const translator = new deepl.Translator(deeplEnv.accessKey);

export function wrapVariablesWithTags(str) {
    return str.replace(/(\{\{.*?}})/g, '<keep>$1</keep>');
}

export function removeKeepTags(str) {
    return str.replace(/<\/?keep>/g, '');
}

export function flattenObjectToArray(obj, parentKey = '', result = []) {
    forOwn(obj, (value, key) => {
        const newKey = parentKey ? `${parentKey}.${key}` : key;

        if (isObject(value) && !isEmpty(value)) {
            flattenObjectToArray(value, newKey, result);
        } else {
            result.push([newKey, value]);
        }
    });

    return result;
}

export function unFlattenArray(flattenedArray) {
    const result = {};

    for (const [key, value] of flattenedArray) {
        const keys = key.split('.'); // Split the key into parts
        let current = result;

        // Iterate through the parts to create nested objects
        for (let i = 0; i < keys.length; i++) {
            const part = keys[i];

            // If it's the last key, assign the value
            if (i === keys.length - 1) {
                current[part] = value;
            } else {
                // Create a new object if the key doesn't exist yet
                if (!current[part]) {
                    current[part] = {};
                }
                current = current[part];
            }
        }
    }

    return result;
}

export function sortFlattenObjectByKey(flattenedArray) {
    return flattenedArray.sort((a, b) => a[0].localeCompare(b[0]));
}

export function showProgressBar(current, total) {
    const percent = Math.floor((current / total) * 100);
    const progress = '='.repeat(Math.floor(percent / 2)) + ' '.repeat(50 - Math.floor(percent / 2));

    process.stdout.write(`\r[${progress}] ${percent}%`);
}

export function addOrUpdate(flattenedArray, key, value) {
    let keyFound = false;

    for (let i = 0; i < flattenedArray.length; i++) {
        if (flattenedArray[i][0] === key) {
            // Update the value if key already exists
            flattenedArray[i][1] = value;
            keyFound = true;
            break;
        }
    }

    if (!keyFound) {
        flattenedArray.push([key, value]);
    }

    return flattenedArray;
}

export async function translateBatch(entries, fromLang, toLang) {
    if (deeplEnv.testMode) {
        return entries.map(({ text }) => (typeof text === 'string' && text.trim() !== '' ? `${toLang}: ${text}` : ''));
    }

    const validEntries = [];
    const originalIndices = [];

    entries.forEach(({ text }, index) => {
        if (typeof text === 'string' && text.trim() !== '') {
            validEntries.push(text);
            originalIndices.push(index);
        }
    });

    if (validEntries.length === 0) {
        return entries.map(() => '');
    }

    const results = await translator.translateText(validEntries, fromLang, toLang, {
        ignoreTags: 'keep',
        tagHandling: 'xml',
    });

    if (!Array.isArray(results)) {
        throw new Error('DeepL response is not an array');
    }

    const translatedTexts = new Array(entries.length).fill('');

    originalIndices.forEach((originalIndex, resultIndex) => {
        translatedTexts[originalIndex] = results[resultIndex].text;
    });

    return translatedTexts;
}
