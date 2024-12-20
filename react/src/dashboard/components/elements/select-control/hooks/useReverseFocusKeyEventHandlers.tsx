import React, { useCallback, useMemo, useRef } from 'react';

type HtmlEl = Element & HTMLInputElement;

export default function useReverseFocusKeyEventHandlers(selectorRef?: React.MutableRefObject<HTMLElement>) {
    const isFocusInside = useRef(false);

    const focusableSelectors = useMemo(
        () => [
            'a[href]',
            'area[href]',
            'button:not([disabled])',
            'details',
            'iframe',
            'object',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[contentEditable="true"]',
            '[tabindex]:not([tabindex^="-"])',
        ],
        [],
    );

    const getFocusable = useCallback((): Array<HTMLElement> => {
        return [...selectorRef.current.querySelectorAll(focusableSelectors.join(','))] as Array<HTMLElement>;
    }, [selectorRef, focusableSelectors]);

    const onFocus = () => {
        if (!isFocusInside.current) {
            isFocusInside.current = true;

            const focusable = getFocusable();
            const index = [...focusable].reverse().indexOf(document.activeElement as HtmlEl);

            focusable[index]?.focus();
        }
    };

    const onBlur = (e: React.FocusEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            isFocusInside.current = false;
        }
    };

    const focusNextElement = useCallback(() => {
        const elements = [...document.querySelectorAll(focusableSelectors.join(','))] as Array<HtmlEl>;
        const focusableElements = elements.filter((el: HtmlEl) => el.offsetParent !== null);

        const activeElement = document.activeElement as HtmlEl;
        const currentIndex = focusableElements.indexOf(activeElement);
        const nextIndex = (currentIndex + 1) % focusableElements.length;

        focusableElements[nextIndex]?.focus();

        if (selectorRef.current.contains(focusableElements[nextIndex])) {
            focusNextElement();
        }
    }, [focusableSelectors, selectorRef]);

    const focusPreviousElement = useCallback(() => {
        const elements = [...document.querySelectorAll(focusableSelectors.join(','))] as Array<HtmlEl>;
        const focusableElements = elements.filter((el: HtmlEl) => el.offsetParent !== null);

        const activeElement = document.activeElement as HtmlEl;
        const currentIndex = focusableElements.indexOf(activeElement);
        const previousIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;

        focusableElements[previousIndex]?.focus();

        if (selectorRef.current.contains(focusableElements[previousIndex])) {
            focusPreviousElement();
        }
    }, [focusableSelectors, selectorRef]);

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Tab') {
                e.preventDefault();

                const focusable = getFocusable();
                const reversedElements = [...focusable].reverse();
                const index = reversedElements.indexOf(document.activeElement as HtmlEl);
                let nextIndex = 0;

                if (!e.shiftKey) {
                    if (index === reversedElements.length - 1) {
                        return focusNextElement();
                    }

                    nextIndex = index === reversedElements.length - 1 ? 0 : index + 1;
                } else {
                    // Reverse (Shift+Tab)
                    if (index === 0) {
                        return focusPreviousElement();
                    }

                    nextIndex = index === 0 ? reversedElements.length - 1 : index - 1;
                }

                reversedElements[nextIndex]?.focus();
            }
        },
        [getFocusable, focusNextElement, focusPreviousElement],
    );

    return { onKeyDown, onFocus, onBlur };
}
