import React, { ReactNode } from 'react';
import classNames from 'classnames';

export default function InfoBox({
    type = 'default',
    borderType = 'dashed',
    children,
    iconColor = 'primary',
}: {
    type?: 'default' | 'primary' | 'warning';
    borderType?: 'dashed' | 'none';
    children: ReactNode;
    iconColor?: 'primary' | 'warning';
}) {
    return (
        <div
            className={classNames(
                'block block-info-box',
                type === 'default' && 'block-info-box-default',
                type === 'primary' && 'block-info-box-primary',
                type === 'warning' && 'block-info-box',
                borderType === 'none' && 'block-info-box-borderless',
                borderType === 'dashed' && 'block-info-box-dashed',
            )}>
            <em
                className={classNames(
                    'info-box-icon',
                    'mdi',
                    'mdi-information',
                    'flex-vertical',
                    'flex-start',
                    iconColor === 'primary' && 'text-primary',
                    iconColor === 'warning' && 'text-warning',
                )}
            />

            <div className="info-box-content">
                <div className="block block-markdown">{children}</div>
            </div>
        </div>
    );
}
