import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FDItem, FDItemOffset, FDItemPosition, FDPosition } from '../context/FrameDirectorContext';
import useFrameDirector from './useFrameDirector';
import useSortRectByOverlapArea from './helpers/useSortRectByOverlapArea';
import useIsWithin from './helpers/useIsWithin';

export default function useFDOffsetMenu(item: FDItem) {
    const ref = useRef<HTMLDivElement>();
    const { updateElement } = useFrameDirector();

    const [elRect, setElRect] = useState<DOMRect>(null);
    const observedHeight = item.observedRect?.height || 0;

    const isWithin = useIsWithin();
    const sortRectByOverlapArea = useSortRectByOverlapArea();

    const getOffsets = useCallback(
        (position: FDItemPosition) => {
            const observerHeight = observedHeight;

            const calcYOffset = () => {
                if (position.position === 'top') {
                    return -elRect?.height;
                }

                if (position.position === 'bottom') {
                    return observerHeight;
                }

                return 0;
            };

            return {
                x: item?.observedRect?.x,
                y: item?.observedRect?.y + calcYOffset(),
                position: position.position,
                align: position.align,
            };
        },
        [observedHeight, elRect?.height, item?.observedRect?.x, item?.observedRect?.y],
    );

    const findOffset = useCallback((): (FDItemOffset & FDItemPosition) | null => {
        const rects: Array<FDItemOffset & FDItemPosition> = ['top', 'bottom'].reduce(
            (list, position: FDPosition) => [
                ...list,
                { ...getOffsets({ position, align: 'start' }), width: elRect?.width, height: elRect?.height },
            ],
            [],
        );

        const sortedRects = sortRectByOverlapArea(document.body.getBoundingClientRect(), rects) as Array<
            FDItemOffset & FDItemPosition
        >;

        return sortedRects?.[0];
    }, [getOffsets, elRect?.height, elRect?.width, sortRectByOverlapArea]);

    const getAvailableOffset = useCallback((): (FDItemOffset & FDItemPosition) | null => {
        const requestedOffset = getOffsets({
            align: item?.requestedPosition?.align,
            position: item?.requestedPosition?.position,
        });

        if (
            isWithin(document.body.getBoundingClientRect(), {
                ...requestedOffset,
                width: elRect?.width,
                height: elRect?.height,
            })
        ) {
            return requestedOffset;
        }

        return findOffset();
    }, [
        getOffsets,
        item?.requestedPosition?.align,
        item?.requestedPosition?.position,
        isWithin,
        elRect?.width,
        elRect?.height,
        findOffset,
    ]);

    const offset = useMemo(() => {
        return getAvailableOffset();
    }, [getAvailableOffset]);

    useEffect(() => {
        const observer = new ResizeObserver(() => setElRect(ref?.current?.getBoundingClientRect()));
        observer.observe(ref?.current);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const observer = new ResizeObserver(() => setElRect(ref?.current?.getBoundingClientRect()));
        observer.observe(document.querySelector('body'));

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (item?.key) {
            updateElement(item.key, { offset });
        }
    }, [item.key, offset, updateElement]);

    return useMemo(() => {
        return { ref, itemWidth: elRect?.width, itemHeight: elRect?.height, activePosition: offset };
    }, [offset, elRect?.height, elRect?.width]);
}
