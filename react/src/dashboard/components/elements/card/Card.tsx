import React, { ReactNode } from 'react';
import { Button, ButtonType } from '../button/Button';

export default function Card({
    title,
    section = true,
    buttons,
    filters,
    children,
    footer,
    footerHidden = false,
    dusk = null,
}: {
    title: string;
    section?: boolean;
    buttons?: Array<ButtonType>;
    filters?: ReactNode | ReactNode[];
    children: ReactNode | ReactNode[];
    footer?: ReactNode | ReactNode[];
    footerHidden?: boolean;
    dusk?: string;
}) {
    return (
        <div className={'card'} data-dusk={dusk}>
            <div className="card-header">
                <div className="card-title flex flex-grow">{title}</div>
                <div className="card-header-actions">
                    {buttons && (
                        <div className="button-group">
                            {buttons
                                ?.filter((button) => button)
                                ?.map((button, index) => <Button key={index} {...button} size={'sm'} />)}
                        </div>
                    )}
                </div>
                <div className="block block-inline-filters">{filters}</div>
            </div>

            <div className="card-body">{section ? <div className={'card-section'}>{children}</div> : children}</div>

            {footer && (
                <div className="card-footer" hidden={footerHidden}>
                    {footer}
                </div>
            )}
        </div>
    );
}
