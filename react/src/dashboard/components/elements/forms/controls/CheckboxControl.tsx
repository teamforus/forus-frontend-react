import React, { useMemo } from 'react';
import Tooltip from '../../tooltip/Tooltip';
import { uniqueId } from 'lodash';
import classNames from 'classnames';

export default function CheckboxControl({
    id,
    title,
    narrow = false,
    flat = false,
    checked = false,
    value = '',
    disabled = false,
    tooltip,
    onChange,
    className,
    children,
    dusk = null,
}: {
    id?: string;
    title?: string;
    tooltip?: string;
    narrow?: boolean;
    flat?: boolean;
    checked: boolean;
    value?: string;
    disabled?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>, checked?: boolean) => void;
    className?: string;
    customElement?: React.ReactElement;
    children?: string | React.ReactNode | Array<React.ReactNode>;
    dusk?: string;
}) {
    const formId = useMemo(() => (id ? id : `checkbox_control_${uniqueId()}`), [id]);

    return (
        <label
            htmlFor={formId}
            title={title}
            data-dusk={dusk}
            className={classNames(
                'checkbox',
                className,
                disabled && 'disabled',
                narrow && 'checkbox-narrow',
                flat && 'checkbox-flat',
            )}>
            <input
                type="checkbox"
                value={value}
                id={formId}
                checked={checked}
                onChange={(e) => onChange(e, e.target.checked)}
            />
            <span className="checkbox-label">
                <span className="checkbox-box">
                    <em className="mdi mdi-check" />
                </span>
                {children}
                {!children && title}
                {tooltip && <Tooltip text={tooltip} />}
            </span>
        </label>
    );
}
