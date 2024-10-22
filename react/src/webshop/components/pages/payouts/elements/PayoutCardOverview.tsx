import React, { useState } from 'react';
import PayoutTransaction from '../../../../../dashboard/props/models/PayoutTransaction';
import EmptyValue from '../../../elements/empty-value/EmptyValue';
import classNames from 'classnames';

export default function PayoutCardOverview({ payout, className }: { payout: PayoutTransaction; className: string }) {
    const [showMore, setShowMore] = useState(false);

    return (
        <div className={classNames('payout-overview', className)}>
            <button
                type={'button'}
                className="button button-text button-xs payout-read-more"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMore(!showMore);
                }}
                aria-expanded={showMore}
                aria-controls="payout-details-extra">
                {showMore ? 'Minder informatie' : 'Meer informatie'}
                <em className={`mdi ${showMore ? 'mdi-chevron-up' : 'mdi-chevron-down'} icon-right`} />
            </button>

            {showMore && (
                <div className="payout-details-extra">
                    <div className="block block-key-value-list block-key-value-list-pane">
                        <div className="block-key-value-list-item">
                            <div className="key-value-list-item-label">IBAN (van)</div>
                            <div className="key-value-list-item-value">{payout.iban_from || <EmptyValue />}</div>
                        </div>
                        <div className="block-key-value-list-item">
                            <div className="key-value-list-item-label">IBAN (naar)</div>
                            <div className="key-value-list-item-value">{payout.iban_to || <EmptyValue />}</div>
                        </div>
                        <div className="block-key-value-list-item">
                            <div className="key-value-list-item-label">IBAN naam (naar)</div>
                            <div className="key-value-list-item-value">{payout.iban_to_name || <EmptyValue />}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
