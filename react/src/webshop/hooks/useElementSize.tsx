import { RefObject, useLayoutEffect, useState } from 'react';

interface Size {
    width: number;
    height: number;
}

export function useElementSize<T extends HTMLElement>(ref: RefObject<T>): Size {
    const [size, setSize] = useState<Size>({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const node = ref.current;
        if (!node) {
            return;
        }

        const update = (): void => {
            const rect = node.getBoundingClientRect();
            setSize({ width: rect.width, height: rect.height });
        };

        update();
        const ro = new ResizeObserver(update);
        ro.observe(node);
        window.addEventListener('resize', update);

        return () => {
            ro.disconnect();
            window.removeEventListener('resize', update);
        };
    }, [ref]);

    return size;
}
