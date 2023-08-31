import { camelCase } from 'lodash';

export const parseStyle = (style: string) => {
    const styleObj = {};

    style
        .split(';')
        .map((item) => item.trim())
        .filter((item) => item)
        .map((item) => item.split(':').map((item) => item.trim()))
        .map((item) => [camelCase(item[0]), item[1]])
        .forEach((item) => (styleObj[item[0]] = item[1]));

    return styleObj;
};
