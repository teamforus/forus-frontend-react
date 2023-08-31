import { useState } from 'react';

export default class HelperService {
    public recursiveLeach(request: CallableFunction, concurrency = 1, page = 1, last_page = null, data = []) {
        return new Promise((resolve, reject) => {
            const requests = [];
            const _concurrency = last_page === null ? 1 : Math.min(concurrency, Math.max(last_page - page + 1, 1));

            for (let requestIndex = 0; requestIndex < _concurrency; requestIndex++) {
                requests.push(request(page + requestIndex, last_page, _concurrency));
            }

            return Promise.all(requests).then((res) => {
                const _data = data.concat(res.reduce((arr, __data) => arr.concat(__data.data.data), []));

                if (res[0].data.meta.last_page === last_page && page + (_concurrency - 1) >= last_page) {
                    resolve(_data);
                } else {
                    this.recursiveLeach(
                        request,
                        concurrency,
                        page + _concurrency,
                        res[0].data.meta.last_page,
                        _data,
                    ).then(resolve);
                }
            }, reject);
        });
    }

    public openInNewTab(url?: string) {
        return url ? window.open(url, '_blank').focus() : null;
    }

    public getEmailServiceProviderUrl(email?: string) {
        const host = email ? email.split('@').splice(-1)[0] : '';
        const provider = typeof host === 'string' ? host.toLocaleLowerCase().trim() : null;

        const providersList = [
            'aol.com',
            'fastmail.com',
            'googlemail.com',
            'gmail.com',
            'gmx.net',
            'gmx.de',
            'hotmail.com',
            'icloud.com',
            'inbox.com',
            'mail.com',
            'mail.ru',
            'me.com',
            'outlook.com',
            'protonmail.com',
            'yahoo.com',
            'yandex.ru',
        ];

        return provider && providersList.includes(provider) ? 'https://' + provider : null;
    }
}

export function useHelperService(): HelperService {
    const [service] = useState(new HelperService());

    return service;
}
