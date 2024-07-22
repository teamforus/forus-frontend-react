import React, { useEffect, useRef } from 'react';

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

    useEffect(() => {
        const tables = ref.current?.querySelectorAll('table');

        try {
            tables.forEach((table) => {
                const head = table.querySelector('tHead tr');
                const headers = [...table.querySelectorAll('tHead tr th')];
                const emptyHeaders = headers.filter((th) => th['innerText'] == '');
                const firstRow = table.querySelector('tBody tr:first-child');

                if (emptyHeaders.length > 0 && emptyHeaders.length == headers.length) {
                    [...firstRow.querySelectorAll('td')].forEach((td) => {
                        const th = document.createElement('th');
                        th.textContent = td.textContent;
                        td.replaceWith(th);
                    });
                    head.replaceWith(firstRow);
                }

                if (table.previousElementSibling?.nodeName?.toLowerCase() == 'h4') {
                    const caption = document.createElement('caption');
                    caption.textContent = table.previousElementSibling.textContent;

                    table.previousElementSibling.remove();
                    table.insertBefore(caption, table.firstElementChild);
                }
            });
        } catch (e) {
            /* empty */
        }
    }, [content]);

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
