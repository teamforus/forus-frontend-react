import React, { useCallback, useEffect, useState } from 'react';

export default function useSelectControlKeyEventFDHandlers(
    selectorRef?: React.MutableRefObject<HTMLElement>,
    optionsRef?: React.MutableRefObject<HTMLElement>,
    placeholderRef?: React.MutableRefObject<HTMLElement>,
    showOptions?: boolean,
    setShowOptions?: React.Dispatch<React.SetStateAction<boolean>>,
) {
    const [focusableSelectors] = useState([
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
    ]);

    const isFocusable = useCallback(
        (element?: HTMLElement) => {
            if (!element || element.offsetParent === null) {
                return false;
            }

            return element.matches(focusableSelectors?.join(','));
        },
        [focusableSelectors],
    );

    const getFocusable = useCallback((): Array<HTMLElement> => {
        const focusable = [];

        if (selectorRef.current) {
            focusable.push(
                ...[...selectorRef.current.querySelectorAll(focusableSelectors.join(','))].filter(isFocusable),
            );
        }

        if (optionsRef.current) {
            focusable.push(
                ...[...optionsRef.current.querySelectorAll(focusableSelectors.join(','))].filter(isFocusable),
            );
        }

        return focusable as Array<HTMLElement>;
    }, [selectorRef, optionsRef, focusableSelectors, isFocusable]);

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const focusable = getFocusable();
            const index = [...focusable].indexOf(document.activeElement as Element & HTMLInputElement);
            const hasSelection = index !== -1;

            if (
                selectorRef?.current?.contains(e.currentTarget) &&
                (['Enter', ' '].includes(e.key) || (!showOptions && e.key === 'ArrowDown'))
            ) {
                e.preventDefault();
                window.setTimeout(() => selectorRef?.current?.focus(), 0);
                return placeholderRef?.current?.click();
            }

            if (e.key == 'Escape') {
                e.preventDefault();

                window.setTimeout(() => selectorRef?.current?.focus(), 0);
                return setShowOptions(false);
            }

            if (!hasSelection) {
                if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
                    e.preventDefault();
                    return window.setTimeout(() => focusable?.[0]?.focus(), 0);
                }
            } else {
                if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
                    e.preventDefault();
                    (focusable[index + 1] || focusable[0])?.focus();
                }

                if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
                    e.preventDefault();
                    (focusable[index - 1] || focusable[focusable.length - 1]).focus();
                }
            }
        },
        [getFocusable, showOptions, placeholderRef, setShowOptions, selectorRef],
    );

    const onBlur = useCallback(
        (e: React.FocusEvent) => {
            if (
                showOptions &&
                !(selectorRef?.current?.contains(e.relatedTarget) || optionsRef?.current?.contains(e.relatedTarget))
            ) {
                if (isFocusable(selectorRef?.current)) {
                    return selectorRef?.current?.focus();
                }

                const firstFocusable = getFocusable()[0];

                if (isFocusable(firstFocusable)) {
                    firstFocusable.focus();
                }
            }
        },
        [showOptions, selectorRef, optionsRef, isFocusable, getFocusable],
    );

    useEffect(() => {
        if (showOptions) {
            window.setTimeout(() => getFocusable()[0]?.focus(), 0);
        }
    }, [getFocusable, showOptions]);

    return { onBlur, onKeyDown };
}
