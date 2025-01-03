import React from 'react';
import PayoutTransaction from '../../../../../dashboard/props/models/PayoutTransaction';
import classNames from 'classnames';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';

export default function PayoutCardDate({ payout, className }: { payout: PayoutTransaction; className?: string }) {
    const translate = useTranslate();

    return (
        payout.transfer_at_locale && (
            <div className={classNames('payout-date', className)}>
                <div className="payout-date-label">{translate('payouts.labels.created_at')}</div>
                <div className="payout-date-value">{payout.transfer_at_locale}</div>
            </div>
        )
    );
}
