import React from 'react';
import PayoutTransaction from '../../../../../dashboard/props/models/PayoutTransaction';
import classNames from 'classnames';
import Label from '../../../elements/label/Label';

export default function PayoutCardLabel({ payout, className }: { payout: PayoutTransaction; className?: string }) {
    return (
        <div className={classNames('payout-status-label', className)}>
            {payout.state === 'pending' && <Label type="warning">{payout.state_locale}</Label>}
            {payout.state === 'success' && <Label type="success">{payout.state_locale}</Label>}
            {payout.state === 'canceled' && <Label type="default">{payout.state_locale}</Label>}
        </div>
    );
}
