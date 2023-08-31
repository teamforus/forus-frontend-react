import React, { useMemo } from 'react';
import Tooltip from '../../tooltip/Tooltip';
import { uniqueId } from 'lodash';

interface CheckboxProps {
    id?: string;
    title?: string;
    tooltip?: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>, checked?: boolean) => void;
    className?: string;
    customElement?: React.ReactElement;
}

export default function CheckboxControl({
    id,
    title,
    checked,
    tooltip,
    onChange,
    className,
    customElement,
}: CheckboxProps) {
    const formId = useMemo(() => (id ? id : `checkbox_control_${uniqueId()}`), [id]);

    return (
        <label htmlFor={formId} title={title} className={`checkbox ${className}`}>
            <input type="checkbox" id={formId} checked={checked} onChange={(e) => onChange(e, e.target.checked)} />
            <span className="checkbox-label">
                <span className="checkbox-box">
                    <em className="mdi mdi-check" />
                </span>
                {customElement && customElement}
                {!customElement && title}
                {tooltip && <Tooltip text={tooltip} />}
            </span>
        </label>
    );
}
