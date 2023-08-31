import React, { useState } from 'react';

export default function FilterItemToggle({
    children,
    label,
    show = false,
}: {
    children: React.ReactElement | Array<React.ReactElement>;
    label: string;
    show?: boolean;
}) {
    const [visible, setVisible] = useState(show);

    return (
        <div className="form-group">
            <label
                htmlFor=""
                className={`form-label form-label-toggle ${visible ? 'active' : ''}`}
                onClick={() => setVisible(!visible)}>
                <span>{label}</span>
                <em className="mdi mdi-menu-right form-label-icon" />
                <em className="mdi mdi-menu-down form-label-icon-active" />
            </label>

            <div className="form-offset">{children}</div>
        </div>
    );
}
