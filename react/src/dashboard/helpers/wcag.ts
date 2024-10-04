import React from 'react';

export function clickOnKeyEnter(e: React.KeyboardEvent<HTMLElement>) {
    return e.key == 'Enter' ? e.currentTarget.click() : null;
}

export function clickOnKeyEnterOrSpace(e: React.KeyboardEvent<HTMLElement>) {
    return ['Enter', ' '].includes(e.key) ? e.currentTarget.click() : null;
}
