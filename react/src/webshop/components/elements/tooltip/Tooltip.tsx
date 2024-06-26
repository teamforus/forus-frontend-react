import React from 'react';
import useTranslate from '../../../../dashboard/hooks/useTranslate';

export default function Tooltip({ text, className }: { text: string; className?: string }) {
    const translate = useTranslate();

    return (
        <div className="tooltip-block" aria-label={translate(text)} title={translate(text)}>
            <div className="tooltip-icon">
                <em className="mdi mdi-information-variant-circle" />
            </div>
            <div className={`tooltip ${className}`}>{translate(text)}</div>
        </div>
    );
}
