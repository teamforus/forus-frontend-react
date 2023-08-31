import React from 'react';

export default function Tooltip({ text }: { text: Array<string> | string }) {
    return (
        <div className="block block-form_tooltip">
            <div className="tooltip-icon">
                <em className="mdi mdi-information" />
            </div>
            <div className={'tooltip'}>
                {(Array.isArray(text) ? text : [text]).map((line, index) => (
                    <div key={index}>{line}</div>
                ))}
            </div>
        </div>
    );
}
