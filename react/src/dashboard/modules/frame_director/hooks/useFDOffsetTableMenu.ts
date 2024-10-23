import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    FDItem,
    FDItemOffset,
    FDItemPosition,
    FDPosition,
    frameDirectorContext,
} from '../context/FrameDirectorContext';
import useSortRectByOverlapArea from './helpers/useSortRectByOverlapArea';
import useIsWithin from './helpers/useIsWithin';

export default function useFDOffsetTableMenu(item: FDItem) {
    const ref = useRef<HTMLDivElement>();
    const { updateElement } = useContext(frameDirectorContext);

    const [elRect, setElRect] = useState<DOMRect>(null);
    const [bodyRect, setBodyRect] = useState<DOMRect>(document.body.getBoundingClientRect());

    const isWithin = useIsWithin();
    const sortRectByOverlapArea = useSortRectByOverlapArea();

    const requestedPositionAlign = item?.requestedPosition.align;
    const requestedPositionPosition = item?.requestedPosition.position;

    const getOffsets = useCallback(
        (position: FDItemPosition) => {
            const calcYOffset = () => {
                if (position.position === 'top') {
                    return -elRect?.height + Math.abs(bodyRect.top);
                }

                if (position.position === 'bottom') {
                    return (item.observedRect?.height || 0) + Math.abs(bodyRect.top);
                }

                return 0;
            };

            return {
                x: item?.observedRect?.x - (elRect?.width - item?.observedRect?.width),
                y: item?.observedRect?.y + calcYOffset(),
                position: position.position,
                align: position.align,
            };
        },
        [
            bodyRect.top,
            item?.observedRect?.x,
            item?.observedRect?.width,
            item?.observedRect?.height,
            item?.observedRect?.y,
            elRect?.width,
            elRect?.height,
        ],
    );

    const findOffset = useCallback((): (FDItemOffset & FDItemPosition) | null => {
        const rects: Array<FDItemOffset & FDItemPosition> = ['bottom', 'top'].reduce(
            (list, position: FDPosition) => [
                ...list,
                { ...getOffsets({ position, align: 'start' }), width: elRect?.width, height: elRect?.height },
            ],
            [],
        );

        const sortedRects = sortRectByOverlapArea(bodyRect, rects) as Array<FDItemOffset & FDItemPosition>;

        return sortedRects?.[0];
    }, [getOffsets, elRect?.height, elRect?.width, sortRectByOverlapArea, bodyRect]);

    const getAvailableOffset = useCallback((): FDItemOffset & FDItemPosition => {
        const requestedOffset = getOffsets({
            align: requestedPositionAlign,
            position: requestedPositionPosition,
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
        requestedPositionAlign,
        requestedPositionPosition,
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
        const observer = new ResizeObserver(() => setBodyRect(document.body?.getBoundingClientRect()));
        observer.observe(document.body);

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
