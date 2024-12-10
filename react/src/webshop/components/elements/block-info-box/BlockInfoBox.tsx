import React, { ReactNode } from 'react';
import classNames from 'classnames';

export default function BlockInfoBox({
    className = '',
    icon = 'info',
    children,
}: {
    className?: string;
    icon?: 'info';
    children: ReactNode;
}) {
    return (
        <div className={classNames('block block-info-box', className)}>
            {icon === 'info' && <div className="info-box-icon mdi mdi-information-outline" />}
            <div className="info-box-content">{children}</div>
        </div>
    );
}
