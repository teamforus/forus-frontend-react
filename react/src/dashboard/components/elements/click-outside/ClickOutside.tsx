import React, { MouseEventHandler, UIEventHandler } from 'react';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

export default function ClickOutside(props: {
    onClickOutside: MouseEventHandler;
    onClick?: MouseEventHandler;
    onContextMenu?: MouseEventHandler;
    onMouseEnter?: MouseEventHandler;
    onMouseLeave?: MouseEventHandler;
    onScroll?: UIEventHandler<HTMLElement>;
    className?: string;
    style?: object;
    onKeyDown?: () => void;
    children: ReactNode;
}) {
    const ref = useRef(null);
    const [body] = useState(document.querySelector('body'));

    const clickHandler = useCallback(
        (e) => {
            let targetElement = e.target;

            do {
                if (targetElement === ref.current) {
                    return;
                }

                targetElement = targetElement.parentNode;
            } while (targetElement);

            if (typeof props.onClickOutside === 'function') {
                props.onClickOutside(e);
            } else {
                console.error("Please provide a valid 'onClickOutside' prop to 'ClickOutside' component!");
            }
        },
        [ref, props],
    );

    useEffect(() => {
        body.addEventListener('click', clickHandler, false);

        return () => body.removeEventListener('click', clickHandler, false);
    }, [body, clickHandler]);

    return (
        <div
            className={props.className}
            onClick={props.onClick}
            onContextMenu={props.onContextMenu}
            ref={ref}
            style={props.style || {}}
            onKeyDown={props.onKeyDown}
            onScroll={props.onScroll}
            onMouseEnter={props.onMouseEnter}
            onMouseLeave={props.onMouseLeave}>
            {props.children}
        </div>
    );
}
