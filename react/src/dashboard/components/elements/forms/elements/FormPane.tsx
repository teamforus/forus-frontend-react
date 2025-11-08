import React, { ReactNode } from 'react';
import classNames from 'classnames';

export default function FormPane({
    dusk = null,
    title,
    large = false,
    children,
}: {
    dusk?: string;
    title: string;
    large?: boolean;
    children: ReactNode | ReactNode[];
}) {
    return (
        <div className={classNames('form-pane', large && 'form-pane-lg')} data-dusk={dusk}>
            <div className="form-pane-title">{title}</div>
            <div className="form-pane-content">{children}</div>
        </div>
    );
}
