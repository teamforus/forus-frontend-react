import React, { ReactNode } from 'react';
import classNames from 'classnames';

export default function FormPane({
    title,
    children,
    large = false,
}: {
    title: string;
    children: ReactNode | ReactNode[];
    large?: boolean;
}) {
    return (
        <div className={classNames('form-pane', large && 'form-pane-lg')}>
            <div className="form-pane-title">{title}</div>
            <div className="form-pane-content">{children}</div>
        </div>
    );
}
