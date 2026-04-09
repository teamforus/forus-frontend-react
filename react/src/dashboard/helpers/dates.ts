import { parse, format, isValid } from 'date-fns';

// safe date
export function dateParse(value?: string, dateFormat = 'yyyy-MM-dd') {
    if (!value) {
        return null;
    }

    const parsedDate = parse(value, dateFormat, new Date());
    return isValid(parsedDate) ? parsedDate : null;
}

// safe date
export function dateFormat(value?: Date, dateFormat = 'yyyy-MM-dd') {
    return value ? format(value, dateFormat) : null;
}
