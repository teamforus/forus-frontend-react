import React from 'react';
import classNames from 'classnames';
import useTranslate from '../../../../dashboard/hooks/useTranslate';

export default function FormLabel({
    htmlFor,
    children,
    info = {},
}: {
    htmlFor?: string;
    children?: React.ReactNode;
    info: { type?: 'required' | 'optional'; start?: boolean };
}) {
    const translate = useTranslate();

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
                {info?.type === 'required'
                    ? translate('form.required')
                    : info?.type === 'optional'
                      ? translate('form.optional')
                      : ''}
            </div>
        </label>
    );
}
