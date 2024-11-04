import React, { DOMAttributes, HTMLAttributes, MouseEventHandler } from 'react';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

export default function ClickOutside({
    onClickOutside,
    className,
    style,
    children,
    bindDelay = 50,
    elRef = null,
    disabled = false,
    attr = null,
    dataDusk = null,
}: {
    onClickOutside: MouseEventHandler;
    className?: string;
    style?: object;
    children: ReactNode;
    bindDelay?: number;
    elRef?: React.MutableRefObject<HTMLDivElement> | undefined;
    disabled?: boolean;
    attr?: DOMAttributes<HTMLDivElement> | HTMLAttributes<HTMLDivElement>;
    dataDusk?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [body] = useState(document.querySelector('body'));
    const [bindDelayValue] = useState(bindDelay);

    const clickHandler = useCallback(
        (e) => {
            let targetElement = e.target;

            do {
                if (targetElement === (elRef || ref).current) {
                    return;
                }

                targetElement = targetElement.parentNode;
            } while (targetElement);

            if (typeof onClickOutside === 'function') {
                onClickOutside(e);
            } else {
                console.error("Please provide a valid 'onClickOutside' prop to 'ClickOutside' component!");
            }
        },
        [elRef, ref, onClickOutside],
    );

    useEffect(() => {
        if (disabled) {
            return;
        }

        let destroyed = false;

        if (bindDelayValue) {
            window.setTimeout(() => {
                if (!destroyed) {
                    body.addEventListener('click', clickHandler, false);
                }
            }, bindDelayValue);
        } else {
            body.addEventListener('click', clickHandler, false);
        }

        return () => {
            destroyed = true;
            body.removeEventListener('click', clickHandler, false);
        };
    }, [body, clickHandler, bindDelayValue, disabled, onClickOutside, elRef]);

    return (
        <div className={className} data-dusk={dataDusk} style={style || {}} {...attr} ref={elRef || ref}>
            {children}
        </div>
    );
}
