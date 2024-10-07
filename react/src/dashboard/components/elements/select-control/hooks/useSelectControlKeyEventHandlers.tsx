import React, { useCallback, useEffect } from 'react';

export default function useSelectControlKeyEventHandlers(
    selectorRef?: React.MutableRefObject<HTMLElement>,
    placeholderRef?: React.MutableRefObject<HTMLElement>,
    showOptions?: boolean,
    setShowOptions?: React.Dispatch<React.SetStateAction<boolean>>,
) {
    const getFocusable = useCallback((): Array<HTMLElement> => {
        return [...selectorRef.current.querySelectorAll('[tabindex]:not([tabindex="-1"])')] as Array<HTMLElement>;
    }, [selectorRef]);

    useEffect(() => {
        if (showOptions) {
            window.setTimeout(() => getFocusable()[0]?.focus(), 0);
        }
    }, [getFocusable, showOptions]);

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const focusable = getFocusable();
            const index = [...focusable].indexOf(document.activeElement as Element & HTMLInputElement);

            if (['Enter', ' '].includes(e.key) || (!showOptions && e.key === 'ArrowDown')) {
                e.preventDefault();
                window.setTimeout(() => selectorRef?.current?.focus(), 0);
                return placeholderRef?.current?.click();
            }

            if (e.key == 'Escape') {
                e.preventDefault();

                window.setTimeout(() => selectorRef?.current?.focus(), 0);
                return setShowOptions(false);
            }

            if (['ArrowDown', 'ArrowUp'].includes(e.key) && index === -1) {
                e.preventDefault();
                return window.setTimeout(() => focusable?.[0]?.focus(), 0);
            }

            if (e.key === 'ArrowDown' && index !== -1) {
                e.preventDefault();
                (focusable[index + 1] || focusable[0])?.focus();
            }

            if (e.key === 'ArrowUp' && index !== -1) {
                e.preventDefault();
                (focusable[index - 1] || focusable[focusable.length - 1]).focus();
            }
        },
        [getFocusable, showOptions, placeholderRef, setShowOptions, selectorRef],
    );

    const onBlur = useCallback(
        (e: React.FocusEvent) => {
            if (showOptions && !e.currentTarget.contains(e.relatedTarget)) {
                selectorRef?.current?.focus();
            }
        },
        [selectorRef, showOptions],
    );

    return { onBlur, onKeyDown };
}
