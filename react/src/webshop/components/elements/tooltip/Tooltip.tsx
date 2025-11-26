import React from 'react';
import useTranslate from '../../../../dashboard/hooks/useTranslate';

export default function Tooltip({ text, className }: { text: string; className?: string }) {
    const translate = useTranslate();

    return (
        <div className="tooltip-block" title={translate(text)}>
            <div className="tooltip-icon" aria-label={translate(text)} role="button" tabIndex={0}>
                <em className="mdi mdi-information-variant-circle" />
            </div>
            <div className={`tooltip ${className}`}>{translate(text)}</div>
        </div>
    );
}
