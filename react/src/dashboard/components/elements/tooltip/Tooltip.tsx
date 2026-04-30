import React, { ReactNode, useState } from 'react';
import classNames from 'classnames';
import { strLimit } from '../../../helpers/string';
import ClickOutside from '../click-outside/ClickOutside';

export default function Tooltip({
    text,
    type = 'default',
    position = 'right',
    size = 'md',
    maxLength = 128,
    children,
}: {
    text?: Array<string> | string | ReactNode;
    type?: 'default' | 'primary';
    position?: 'right' | 'bottom';
    size?: 'sm' | 'md';
    maxLength?: number;
    children?: ReactNode | Array<ReactNode>;
}) {
    const [showTooltip, setShowTooltip] = useState(false);

    if (type == 'primary') {
        return (
            <em
                onClick={(e) => {
                    e.stopPropagation();
                    setShowTooltip(!showTooltip);
                }}
                className={classNames(
                    'td-icon',
                    'mdi',
                    'mdi-information',
                    'block',
                    'block-tooltip-details',
                    'pull-left',
                    'clickable',
                    showTooltip && 'active',
                )}>
                {showTooltip && (
                    <ClickOutside
                        className={classNames('tooltip-content', position === 'bottom' && 'tooltip-content-bottom')}
                        attr={{ onClick: (e) => e.stopPropagation() }}
                        onClickOutside={() => setShowTooltip(false)}>
                        <div className="tooltip-text" title={[].concat(text)?.join(' ')}>
                            {strLimit([].concat(text)?.join(' ') || '-', maxLength)}
                            {children}
                        </div>
                    </ClickOutside>
                )}
            </em>
        );
    }

    return (
        <div className={classNames('block', 'block-form_tooltip', size === 'sm' && 'block-form_tooltip-sm')}>
            <div className="tooltip-icon">
                <em className="mdi mdi-information" />
            </div>
            <div className={'tooltip'}>
                {[].concat(text).map((line, index) => (
                    <div key={index}>{line}</div>
                ))}
                {children}
            </div>
        </div>
    );
}
