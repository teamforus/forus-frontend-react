import React, { useState } from 'react';
import { strLimit } from '../../../helpers/string';
import ClickOutside from '../click-outside/ClickOutside';

export default function Tooltip({
    text,
    type = 'default',
}: {
    text: Array<string> | string;
    type?: 'default' | 'primary';
}) {
    const [showTooltip, setShowTooltip] = useState(false);

    if (type == 'primary') {
        return (
            <em
                onClick={(e) => {
                    e.stopPropagation();
                    setShowTooltip(!showTooltip);
                }}
                className={`td-icon mdi mdi-information block block-tooltip-details pull-left clickable ${
                    showTooltip ? 'active' : ''
                }`}>
                {showTooltip && (
                    <ClickOutside
                        className="tooltip-content"
                        onClick={(e) => e.stopPropagation()}
                        onClickOutside={() => setShowTooltip(false)}>
                        <div className="tooltip-text" title={[].concat(text)?.join(' ')}>
                            {strLimit([].concat(text)?.join(' ') || '-', 128)}
                        </div>
                    </ClickOutside>
                )}
            </em>
        );
    }

    return (
        <div className="block block-form_tooltip">
            <div className="tooltip-icon">
                <em className="mdi mdi-information" />
            </div>
            <div className={'tooltip'}>
                {[].concat(text).map((line, index) => (
                    <div key={index}>{line}</div>
                ))}
            </div>
        </div>
    );
}
