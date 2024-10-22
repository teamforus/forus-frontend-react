import React from 'react';
import classNames from 'classnames';

export default function FormLabel({
    htmlFor,
    children,
    info = {},
}: {
    htmlFor?: string;
    children?: React.ReactNode;
    info: { type?: 'required' | 'optional'; start?: boolean };
}) {
    return (
        <label className="form-label" htmlFor={htmlFor}>
            {children}
            <div
                className={classNames(
                    'form-label-info',
                    info?.start && 'form-label-info-start',
                    info?.type === 'optional' && 'form-label-info-optional',
                    info?.type === 'required' && 'form-label-info-required',
                )}>
                {info?.type === 'required' ? 'Verplicht' : info?.type === 'optional' ? 'Optioneel' : ''}
            </div>
        </label>
    );
}
