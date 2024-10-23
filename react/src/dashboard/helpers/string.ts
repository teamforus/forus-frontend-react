import { truncate } from 'lodash';
import { parsePhoneNumber } from 'libphonenumber-js';

export const strLimit = (str: string, length = 25) => {
    if (typeof str !== 'string') {
        return;
    }

    return truncate(str, { length });
};

export const currencyFormat = (value: number, currency = '€ ') => {
    const string = value
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$&.')
        .replace(/.([^.]*)$/, ',$1');

    return currency + (value % 1 == 0 ? string.slice(0, -2) + '-' : string);
};

export const fileSize = (size: number): string => {
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const val = size / Math.pow(1024, i);

    if (isNaN(val)) {
        return '0 kb';
    }

    return parseFloat(val.toFixed(2)) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
};

export const phoneNumberFormat = (phoneNumber = '') => {
    try {
        if (typeof phoneNumber != 'string' || phoneNumber.length < 3) {
            return phoneNumber;
        }

        const parser = parsePhoneNumber(phoneNumber);
        let number = '';

        for (let i = 0; i < phoneNumber.length / 3; i++) {
            number += ' ' + phoneNumber.slice(i * 3, i * 3 + 3);
        }

        return parser.isValid() ? parser.formatInternational() : number;
    } catch {
        return phoneNumber;
    }
};
