export default class ProgressStorage {
    constructor(protected namespace: string, protected storage = localStorage) {}

    set(key: string, value: string) {
        this.storage.setItem(this.makeKey(key), value);
    }

    has(key: string) {
        // eslint-disable-next-line no-prototype-builtins
        return this.storage.hasOwnProperty(this.makeKey(key));
    }

    delete(key: string) {
        this.storage.removeItem(this.makeKey(key));
    }

    get(key, _default = null) {
        return this.has(key) ? this.storage.getItem(this.makeKey(key)) : _default;
    }

    clear() {
        for (const key in this.storage) {
            // eslint-disable-next-line no-prototype-builtins
            if (!this.storage.hasOwnProperty(key)) {
                continue;
            }

            if (key.startsWith(this.namespace + '.')) {
                this.storage.removeItem(key);
            }
        }
    }

    makeKey(key: string) {
        return this.namespace + '.' + key;
    }

    keys(key: string) {
        return this.namespace + '.' + key;
    }
}
