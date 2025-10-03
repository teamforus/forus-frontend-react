// useAutoScrollToBottom.ts
// Custom hook to automatically scroll a referenced element into view
// whenever one of the provided dependencies changes.

import { type RefObject, useEffect } from 'react';

/**
 * Scrolls the referenced element into view with smooth animation.
 * Typically used to keep chat scrolled to the latest message.
 *
 * @param ref - A RefObject pointing to the element to scroll into view
 * @param deps - Dependency array that triggers scrolling when changed
 */
export function useAutoScrollToBottom(ref: RefObject<HTMLDivElement>, deps: unknown[]) {
    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }, [deps]); // eslint-disable-line react-hooks/exhaustive-deps
}
