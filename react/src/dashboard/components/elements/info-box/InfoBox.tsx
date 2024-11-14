import React, { ReactNode } from 'react';
import classNames from 'classnames';

export default function InfoBox({
    type = 'default',
    dashed = true,
    children,
    iconColor = 'light',
    iconPosition = 'center',
}: {
    type?: 'default' | 'primary';
    dashed?: boolean;
    children: ReactNode;
    iconColor?: 'light' | 'primary';
    iconPosition?: 'top' | 'center';
}) {
    return (
        <div
            className={classNames(
                'block block-info-box',
                type === 'default' ? 'block-info-box-default ' : 'block-info-box-primary',
                dashed && 'block-info-box-dashed',
            )}>
            <em
                className={classNames(
                    'info-box-icon',
                    'mdi',
                    'mdi-information',
                    'flex-vertical',
                    iconColor === 'light' ? 'text-primary-light' : 'text-primary',
                    iconPosition === 'center' ? 'flex-center' : 'flex-start',
                )}
            />

            <div className="info-box-content">
                <div className="block block-markdown">{children}</div>
            </div>
        </div>
    );
}
