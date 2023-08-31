import { truncate } from 'lodash';

export const strLimit = (str: string, length: number) => {
    if (typeof str !== 'string') {
        return;
    }

    return truncate(str, { length });
};
