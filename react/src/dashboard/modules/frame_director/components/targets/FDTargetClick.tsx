import React, { ReactElement, useCallback, useRef, useState } from 'react';
import FrameDirectorObserver from '../FrameDirectorObserver';
import { FDAlign, FDItem, FDPosition } from '../../context/FrameDirectorContext';
import ClickOutside from '../../../../components/elements/click-outside/ClickOutside';

export interface FDTargetContainerProps {
    item: FDItem;
    position: FDPosition;
    align: FDAlign;
    content?: ((props: FDTargetContainerProps) => ReactElement | ReactElement[]) | ReactElement | ReactElement[];
    icon?: string;
    title?: string;
    close?: () => void;
}

export default function FDTargetClick({
    icon,
    title,
    content,
    align = 'center',
    position = 'bottom',
    children,
    contentContainer: FdTargetContainer,
    syncType = 'observer',
    showExternal = false,
    show,
    setShow,
    className,
    observerClassName,
}: {
    icon?: string;
    title?: string;
    content?: ((props: FDTargetContainerProps) => ReactElement | ReactElement[]) | ReactElement | ReactElement[];
    align?: FDAlign;
    position?: FDPosition;
    children?: ReactElement | ReactElement[];
    contentContainer?: (props: FDTargetContainerProps) => ReactElement;
    syncType?: 'observer' | 'requestAnimationFrame';
    showExternal?: boolean;
    show?: boolean;
    setShow?: React.Dispatch<React.SetStateAction<boolean>>;
    className?: string;
    observerClassName?: string;
}) {
    const [internalShow, setInternalShow] = useState(false);
    const elRef = useRef<HTMLDivElement>(null);

    const setShowValue = useCallback(
        (value: boolean) => {
            return showExternal ? setShow(value) : setInternalShow(value);
        },
        [setShow, showExternal],
    );

    return (
        <ClickOutside
            elRef={elRef}
            attr={{
                className,
                onClick: (e) => {
                    e.stopPropagation();
                    setShowValue(!internalShow);
                },
            }}
            onClickOutside={() => setShowValue(false)}>
            {(showExternal ? show : internalShow) ? (
                <FrameDirectorObserver
                    position={position}
                    align={align}
                    classNames={observerClassName}
                    fallbackPositions={true}
                    close={() => setShowValue(false)}
                    syncType={syncType}
                    element={(item) => (
                        <FdTargetContainer
                            icon={icon}
                            title={title}
                            content={content}
                            position={position}
                            align={align}
                            close={() => setShowValue(false)}
                            item={item}
                        />
                    )}>
                    {children}
                </FrameDirectorObserver>
            ) : (
                children
            )}
        </ClickOutside>
    );
}
