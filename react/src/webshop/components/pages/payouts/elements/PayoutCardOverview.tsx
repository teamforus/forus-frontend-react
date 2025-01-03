import React, { useState } from 'react';
import PayoutTransaction from '../../../../../dashboard/props/models/PayoutTransaction';
import EmptyValue from '../../../elements/empty-value/EmptyValue';
import classNames from 'classnames';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';

export default function PayoutCardOverview({ payout, className }: { payout: PayoutTransaction; className: string }) {
    const translate = useTranslate();

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
                {showMore ? translate('payouts.buttons.show_less') : translate('payouts.buttons.show_more')}
                <em className={`mdi ${showMore ? 'mdi-chevron-up' : 'mdi-chevron-down'} icon-right`} />
            </button>

            {showMore && (
                <div className="payout-details-extra">
                    <div className="block block-key-value-list block-key-value-list-pane">
                        <div className="block-key-value-list-item">
                            <div className="key-value-list-item-label">{translate('payouts.labels.iban_from')}</div>
                            <div className="key-value-list-item-value">{payout.iban_from || <EmptyValue />}</div>
                        </div>
                        <div className="block-key-value-list-item">
                            <div className="key-value-list-item-label">{translate('payouts.labels.iban_to')}</div>
                            <div className="key-value-list-item-value">{payout.iban_to || <EmptyValue />}</div>
                        </div>
                        <div className="block-key-value-list-item">
                            <div className="key-value-list-item-label">{translate('payouts.labels.iban_to_name')}</div>
                            <div className="key-value-list-item-value">{payout.iban_to_name || <EmptyValue />}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
