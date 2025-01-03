import { readFileSync } from 'fs';
import { addOrUpdate, cachePath, sortFlattenObjectByKey } from './helpers.mjs';
import { existsSync, writeFileSync } from 'fs';

let cache = existsSync(`${cachePath}/cache.json`) ? JSON.parse(readFileSync(`${cachePath}/cache.json`).toString()) : [];

const cache_added = JSON.parse(readFileSync(`${cachePath}/cache_added.json`).toString());
const cache_removed = JSON.parse(readFileSync(`${cachePath}/cache_removed.json`).toString());

// delete removed rows
for (const [key] of cache_removed) {
    cache = cache.filter(([row_key]) => row_key !== key);
}

// add or update rows
for (const [key, value] of cache_added) {
    cache = addOrUpdate(cache, key, value);
}

writeFileSync(`${cachePath}/cache.json`, JSON.stringify(sortFlattenObjectByKey(cache), null, '    '));
