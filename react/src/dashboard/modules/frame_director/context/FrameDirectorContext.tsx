import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { createContext } from 'react';

export type FDAlign = 'start' | 'center' | 'end';
export type FDPosition = 'top' | 'right' | 'bottom' | 'left';

export interface FDItem {
    key: string;
    offset?: FDItemOffset & FDItemPosition;
    close?: () => void;
    element: (e: FDItem) => ReactElement;
    observedRect?: FDObserverRect;
    requestedPosition?: FDItemPosition;
}

export interface FDItemPosition {
    position: FDPosition;
    align: FDAlign;
}

export interface FDItemOffset {
    x: number;
    y: number;
}

export type FDObserverRect = {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
};

interface FDProps {
    elements: Array<FDItem>;
    pushElement: (item: FDItem) => string;
    deleteElement: (id: string) => void;
    updateElement: (id: string, config: Partial<FDItem>) => void;
    updateObservedPosition: (id: string, observerRect: FDObserverRect) => void;
}

const frameDirectorContext = createContext<FDProps>(null);
const { Provider } = frameDirectorContext;

const FrameDirectorProvider = ({ children }: { children: React.JSX.Element }) => {
    const [elements, setElements] = useState<Array<FDItem>>([]);

    const pushElement = useCallback((item: FDItem) => {
        setElements((elements) => [item, ...elements]);

        return item.key;
    }, []);

    const updateElement = useCallback((id: string, item: Partial<FDItem>) => {
        setElements((elements) => [
            ...elements.map((el): FDItem => {
                return el.key !== id ? el : { ...el, ...item };
            }),
        ]);
    }, []);

    const updateObservedPosition = useCallback((id: string, observedRect: FDObserverRect) => {
        setElements((elements) => [
            ...elements.map((el): FDItem => {
                return el.key !== id ? el : { ...el, observedRect: observedRect };
            }),
        ]);
    }, []);

    const deleteElement = useCallback((id: string) => {
        setElements((elements) => elements.filter((el) => el.key !== id));
    }, []);

    useEffect(() => {
        const extraElements = elements.splice(1);
        extraElements.forEach((item) => item?.close?.());
    }, [elements]);

    return (
        <Provider value={{ elements, pushElement, updateElement, updateObservedPosition, deleteElement }}>
            {children}

            <div className={'frame-director'}>
                {elements.map((element) => (
                    <div
                        key={element.key}
                        className={'fd-content'}
                        style={{ left: `${element.offset?.x}px`, top: `${element.offset?.y}px` }}>
                        {element.element(element)}
                    </div>
                ))}
            </div>
        </Provider>
    );
};

export { FrameDirectorProvider, frameDirectorContext };
