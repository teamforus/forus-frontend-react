import React, { ReactNode, Ref, useId, useState } from 'react';
import useTranslate from '../../../../dashboard/hooks/useTranslate';

type PaneGroupIcon =
    | 'clipboard-text-outline'
    | 'ticket-confirmation-outline'
    | 'store-outline'
    | 'store-marker-outline';

export default function PaneGroup({
    elRef,
    icon,
    title,
    children,
    openByDefault = true,
}: {
    elRef?: Ref<HTMLDivElement>;
    icon?: PaneGroupIcon;
    title: string;
    children: ReactNode | ReactNode[];
    openByDefault?: boolean;
}) {
    const id = useId();
    const [isOpen, setIsOpen] = useState(openByDefault);
    const translate = useTranslate();
    const titleId = `panel-title-${id}`;
    const buttonId = `panel-toggle-${id}`;
    const bodyId = `panel-body-${id}`;

    return (
        <div className="panel" ref={elRef}>
            <button
                id={buttonId}
                type="button"
                className="panel-header"
                aria-expanded={isOpen}
                aria-controls={bodyId}
                aria-labelledby={`${titleId} ${buttonId}`}
                onClick={() => setIsOpen(!isOpen)}>
                {icon && (
                    <div className="panel-header-icon" aria-hidden="true">
                        {icon === 'clipboard-text-outline' && <em className="mdi mdi-clipboard-text-outline" />}
                        {icon === 'ticket-confirmation-outline' && (
                            <em className="mdi mdi-ticket-confirmation-outline" />
                        )}
                        {icon === 'store-outline' && <em className="mdi mdi-store-outline" />}
                        {icon === 'store-marker-outline' && <em className="mdi mdi-store-marker-outline" />}
                    </div>
                )}
                <h3 className="panel-header-title" id={titleId}>
                    {title}
                </h3>
                <em className={`mdi ${isOpen ? 'mdi-chevron-down' : 'mdi-chevron-right'}`} aria-hidden="true" />
                <span className="sr-only">
                    {isOpen ? translate('product.labels.collapse_section') : translate('product.labels.expand_section')}
                </span>
            </button>
            <div className="panel-body" id={bodyId} hidden={!isOpen}>
                {children}
            </div>
        </div>
    );
}
