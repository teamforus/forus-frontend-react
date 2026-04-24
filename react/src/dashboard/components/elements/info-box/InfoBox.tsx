import React, { ReactNode } from 'react';
import classNames from 'classnames';

export default function InfoBox({
    type = 'default',
    borderType = 'dashed',
    children,
    iconType = 'info',
    iconColor = 'primary',
    dusk = null,
}: {
    type?: 'default' | 'primary' | 'warning' | 'danger';
    borderType?: 'dashed' | 'none';
    children: ReactNode | ReactNode[];
    iconType?: 'info' | 'warning';
    iconColor?: 'default' | 'primary' | 'warning';
    dusk?: string;
}) {
    return (
        <div
            data-dusk={dusk}
            className={classNames(
                'block block-info-box',
                type === 'default' && 'block-info-box-default',
                type === 'primary' && 'block-info-box-primary',
                type === 'warning' && 'block-info-box',
                type === 'danger' && 'block-info-box-danger',
                borderType === 'none' && 'block-info-box-borderless',
                borderType === 'dashed' && 'block-info-box-dashed',
            )}>
            <em
                className={classNames(
                    'info-box-icon',
                    'mdi',
                    'flex-vertical',
                    'flex-start',
                    iconType === 'info' && 'mdi-information',
                    iconType === 'warning' && 'mdi-alert-outline',
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
