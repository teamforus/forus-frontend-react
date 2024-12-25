import React, { Fragment, useState } from 'react';
import classNames from 'classnames';
import EmptyValue from '../../../../webshop/components/elements/empty-value/EmptyValue';
import InfoBox from '../info-box/InfoBox';

export default function KeyValueItem({
    label,
    children,
    className,
    infoBlock,
}: {
    label: string;
    children: number | string | React.ReactElement | Array<React.ReactElement>;
    className?: string;
    infoBlock?: number | string | React.ReactElement | Array<React.ReactElement>;
}) {
    const [showInfoBlock, setShowInfoBlock] = useState(false);

    return (
        <div className="keyvalue-item">
            <div className="keyvalue-key">{label}</div>
            <div className={classNames('keyvalue-value', className)}>
                {infoBlock ? (
                    <div className="flex flex-vertical flex-gap">
                        <div className="flex flex-gap-sm">
                            {children || <EmptyValue />}
                            <div
                                className="keyvalue-value-info-block-toggle keyvalue-value-info-block-toggle-secondary"
                                onClick={() => setShowInfoBlock(!showInfoBlock)}>
                                <em className="mdi mdi-information" />
                            </div>
                        </div>

                        {showInfoBlock && (
                            <InfoBox dashed={true} iconPosition={'top'}>
                                {infoBlock}
                            </InfoBox>
                        )}
                    </div>
                ) : (
                    <Fragment>{children || <EmptyValue />}</Fragment>
                )}
            </div>
        </div>
    );
}
