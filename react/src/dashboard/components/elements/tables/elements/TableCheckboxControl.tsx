import React from 'react';
import classNames from 'classnames';

export default function TableCheckboxControl({
    checked,
    onClick,
}: {
    checked: boolean;
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
}) {
    return (
        <label
            className={classNames('checkbox', 'checkbox-compact', 'checkbox-th', checked && 'checked')}
            onClick={onClick}
            style={{ cursor: 'pointer' }}>
            <div className="checkbox-box">
                <div className="mdi mdi-check" />
            </div>
        </label>
    );
}
