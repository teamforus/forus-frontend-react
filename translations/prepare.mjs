import { readFileSync } from 'fs';
import originalText from '../react/src/webshop/i18n/i18n-nl.mjs';
import { existsSync, writeFileSync } from 'fs';
import { flattenObjectToArray, sortFlattenObjectByKey, cachePath } from './helpers.mjs';

const sourceData = sortFlattenObjectByKey(flattenObjectToArray(originalText));
const cacheData = existsSync(`${cachePath}/cache.json`)
    ? JSON.parse(readFileSync(`${cachePath}/cache.json`).toString())
    : [];

const source = sourceData.map((item) => item.join(' ####### '));
const cache = cacheData.map((item) => item.join(' ####### '));

const removed = sortFlattenObjectByKey(cacheData.filter((item) => !source.includes(item.join(' ####### '))));
const added = sortFlattenObjectByKey(sourceData.filter((item) => !cache.includes(item.join(' ####### '))));

writeFileSync(`${cachePath}/cache_removed.json`, JSON.stringify(removed, null, '    '));
writeFileSync(`${cachePath}/cache_added.json`, JSON.stringify(added, null, '    '));
