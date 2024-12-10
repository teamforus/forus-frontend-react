import React, { ReactNode } from 'react';
import { Button, ButtonType } from '../button/Button';

export default function Card({
    title,
    section = true,
    buttons,
    children,
    footer,
    footerHidden = false,
}: {
    title: string;
    section?: boolean;
    buttons?: Array<ButtonType>;
    children: ReactNode | ReactNode[];
    footer?: ReactNode | ReactNode[];
    footerHidden?: boolean;
}) {
    return (
        <div className={'card'}>
            <div className="card-header card-header-next">
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
