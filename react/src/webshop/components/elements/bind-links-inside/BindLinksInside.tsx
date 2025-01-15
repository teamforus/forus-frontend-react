import React, { useEffect, ReactNode, useRef } from 'react';

export default function BindLinksInside({
    children,
    onKeyDown,
    onClick,
    onMouseEnter,
    onMouseLeave,
}: {
    children: ReactNode;
    onKeyDown?: (e: KeyboardEvent) => void;
    onClick?: (e: MouseEvent) => void;
    onMouseEnter?: (e: MouseEvent) => void;
    onMouseLeave?: (e: MouseEvent) => void;
}) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) return;

        const links = container.querySelectorAll('a');

        links.forEach((link) => {
            if (onKeyDown) link.addEventListener('keydown', onKeyDown as EventListener);
            if (onClick) link.addEventListener('click', onClick as EventListener);
            if (onMouseEnter) link.addEventListener('mouseenter', onMouseEnter as EventListener);
            if (onMouseLeave) link.addEventListener('mouseleave', onMouseLeave as EventListener);
        });

        return () => {
            links.forEach((link) => {
                if (onKeyDown) link.removeEventListener('keydown', onKeyDown as EventListener);
                if (onClick) link.removeEventListener('click', onClick as EventListener);
                if (onMouseEnter) link.removeEventListener('mouseenter', onMouseEnter as EventListener);
                if (onMouseLeave) link.removeEventListener('mouseleave', onMouseLeave as EventListener);
            });
        };
    }, [onKeyDown, onClick, onMouseEnter, onMouseLeave]);

    return <div ref={containerRef}>{children}</div>;
}
