import React from 'react';
import PayoutTransaction from '../../../../../dashboard/props/models/PayoutTransaction';
import classNames from 'classnames';

export default function PayoutCardDate({ payout, className }: { payout: PayoutTransaction; className?: string }) {
    return (
        payout.transfer_at_locale && (
            <div className={classNames('payout-date', className)}>
                <div className="payout-date-label">Uitbetaald op</div>
                <div className="payout-date-value">{payout.transfer_at_locale}</div>
            </div>
        )
    );
}
