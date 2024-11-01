import React, { useMemo } from 'react';
import Tooltip from '../../tooltip/Tooltip';
import { uniqueId } from 'lodash';
import classNames from 'classnames';

export default function ToggleControl({
    id,
    title,
    checked = false,
    value = '',
    disabled = false,
    tooltip,
    onChange,
    className,
    customElement,
    labelRight = true,
}: {
    id?: string;
    title?: string;
    tooltip?: string;
    checked: boolean;
    value?: string;
    disabled?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>, checked?: boolean) => void;
    className?: string;
    customElement?: React.ReactElement;
    labelRight?: boolean;
}) {
    const formId = useMemo(() => (id ? id : uniqueId('toggle_control_')), [id]);

    return (
        <label
            htmlFor={formId}
            title={title}
            className={classNames('form-toggle', className, disabled && 'form-toggle-disabled')}>
            <input
                type="checkbox"
                value={value}
                id={formId}
                checked={checked}
                onChange={(e) => onChange(e, e.target.checked)}
            />
            <div className="form-toggle-inner flex-end">
                {labelRight && (
                    <div className="toggle-input">
                        <div className="toggle-input-dot" />
                    </div>
                )}

                {(title || customElement || tooltip) && (
                    <div className="toggle-label">
                        {customElement && customElement}
                        <div>{!customElement && title}</div>
                        {tooltip && <Tooltip text={tooltip} />}
                    </div>
                )}

                {!labelRight && (
                    <div className="toggle-input">
                        <div className="toggle-input-dot" />
                    </div>
                )}
            </div>
        </label>
    );
}
