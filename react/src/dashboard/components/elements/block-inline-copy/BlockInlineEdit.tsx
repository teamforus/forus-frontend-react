import React, { MouseEventHandler, ReactNode } from 'react';
import classNames from 'classnames';

export default function BlockInlineEdit({
    children,
    className,
    onClick,
    editDusk = null,
}: {
    children: ReactNode | ReactNode[];
    className?: string;
    onClick?: MouseEventHandler<HTMLDivElement>;
    editDusk?: string;
}) {
    return (
        <div className={classNames('block block-inline-edit', className)} onClick={onClick}>
            {children}
            <em className="mdi mdi-pencil inline-edit-icon" data-dusk={editDusk} />
        </div>
    );
}
