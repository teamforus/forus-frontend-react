import React, { useEffect, useMemo, useRef } from 'react';

export default function Markdown({
    align,
    content,
    className = '',
    ariaLevel = null,
    fontSize = undefined,
    role = null,
}: {
    content: string;
    align?: 'left' | 'center' | 'right';
    className?: string;
    ariaLevel?: number;
    fontSize?: number;
    role?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const observer = useMemo(
        () =>
            new MutationObserver(function (mutationsList) {
                const tables = [...mutationsList].reduce((list, mutation) => {
                    if (mutation.type == 'childList') {
                        return [...list, ...[...mutation.addedNodes].filter((node) => node.nodeName == 'TABLE')];
                    }

                    return list;
                }, []);

                tables.forEach((table) => {
                    const head = table.querySelector('tHead tr');
                    const headers = [...table.querySelectorAll('tHead tr th')];
                    const emptyHeaders = headers.filter((th) => th.innerText == '');
                    const firstRow = table.querySelector('tBody tr:first-child');

                    if (emptyHeaders.length > 0 && emptyHeaders.length == headers.length) {
                        [...firstRow.querySelectorAll('td')].forEach((td) => {
                            const th = document.createElement('th');
                            th.innerHTML = td.innerHTML;
                            td.replaceWith(th);
                        });
                        head.replaceWith(firstRow);
                    }
                });
            }),
        [],
    );

    useEffect(() => {
        observer.observe(ref.current, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
        };
    }, [observer]);

    return (
        <div
            ref={ref}
            role={role}
            aria-level={ariaLevel}
            style={{ fontSize: fontSize ? `${fontSize}px` : undefined }}
            className={`block block-markdown ${align ? 'block-markdown-' + align : ''} ${className}`}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
}
