import React, { ReactNode } from 'react';
import useCopyToClipboard from '../../../hooks/useCopyToClipboard';
import classNames from 'classnames';

export default function BlockInlineCopy({
    children,
    className,
    value,
}: {
    children: ReactNode | ReactNode[];
    className?: string;
    value?: string;
}) {
    const copyToClipboard = useCopyToClipboard();

    return (
        <div
            className={classNames('block block-inline-copy', className)}
            onClick={(e) => {
                e?.preventDefault();
                e?.stopPropagation();

                copyToClipboard(value);
            }}>
            {children}
            <em className="mdi mdi-content-copy inline-copy-icon" />
        </div>
    );
}
