import React, { useRef } from 'react';
import classNames from 'classnames';
import useRenderedMarkdownTables from './hooks/useRenderedMarkdownTables';

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
    const renderedContent = useRenderedMarkdownTables(content);

    return (
        <div
            ref={ref}
            role={role}
            aria-level={ariaLevel}
            style={{ fontSize: fontSize ? `${fontSize}px` : undefined }}
            className={classNames(
                'block',
                'block-markdown',
                align === 'left' && 'block-markdown-left',
                align === 'center' && 'block-markdown-center',
                align === 'right' && 'block-markdown-right',
                className,
            )}
            dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
    );
}
