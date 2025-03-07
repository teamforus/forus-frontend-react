import React, { Fragment, ReactNode, useState } from 'react';
import FormError from '../errors/FormError';
import useCopyToClipboard from '../../../../hooks/useCopyToClipboard';
import classNames from 'classnames';

export default function FormGroupInfo({
    info,
    error,
    dashed = false,
    children,
    copyShow = false,
    copyValue = null,
    copyDisable = false,
}: {
    info?: ReactNode | ReactNode[];
    error?: string | Array<string>;
    dashed?: boolean;
    copyShow?: boolean;
    copyValue?: string;
    copyDisable?: boolean;
    children: React.ReactElement | Array<React.ReactElement>;
}) {
    const [showInfo, setShowInfo] = useState(false);
    const copyToClipboard = useCopyToClipboard();

    return (
        <Fragment>
            <div className="form-group-info">
                <div className="form-group-info-control">{children}</div>
                <div className={classNames('form-group-info-button', dashed && 'form-group-info-button-dashed')}>
                    {copyShow && (
                        <button
                            className={classNames(
                                'button button-default button-icon pull-left',
                                dashed && 'button-dashed',
                            )}
                            disabled={copyDisable}
                            onClick={() => copyToClipboard(copyValue)}>
                            <em className="mdi mdi-content-copy" />
                        </button>
                    )}
                    <div
                        onClick={() => setShowInfo(!showInfo)}
                        className={classNames(
                            'button button-default button-icon pull-left',
                            dashed && 'button-dashed',
                            showInfo && 'active',
                        )}>
                        <em className="mdi mdi-information" />
                    </div>
                </div>
            </div>

            <FormError error={error} />

            {showInfo && (
                <div className="block block-info-box block-info-box-primary">
                    <div className="info-box-icon mdi mdi-information" />
                    <div className="info-box-content">
                        <div className="block block-markdown">
                            {typeof info === 'string'
                                ? info.split('\n').map((line, index) => <div key={index}>{line}</div>)
                                : info}
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
