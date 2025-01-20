import React from 'react';

export function clickOnKeyEnter(
    e: React.KeyboardEvent<HTMLElement>,
    preventDefaultAndPropagationOnMatch: boolean = false,
) {
    if (e.key == 'Enter') {
        if (preventDefaultAndPropagationOnMatch) {
            e?.preventDefault();
            e?.stopPropagation();
        }

        e?.currentTarget.click();
    }

    return null;
}

export function clickOnKeyEnterOrSpace(e: React.KeyboardEvent<HTMLElement>) {
    return ['Enter', ' '].includes(e.key) ? e.currentTarget.click() : null;
}
