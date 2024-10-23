import React from 'react';
import PayoutTransaction from '../../../../../dashboard/props/models/PayoutTransaction';
import classNames from 'classnames';

export default function PayoutCardLabel({ payout, className }: { payout: PayoutTransaction; className?: string }) {
    return (
        <div className={classNames('payout-status-label', className)}>
            {payout.state === 'pending' && <div className="label label-warning">{payout.state_locale}</div>}
            {payout.state === 'success' && <div className="label label-success">{payout.state_locale}</div>}
            {payout.state === 'canceled' && <div className="label label-default">{payout.state_locale}</div>}
        </div>
    );
}
