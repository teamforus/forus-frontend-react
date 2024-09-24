import React from 'react';
import Transaction from '../../../props/models/Transaction';
import PayoutTransaction from '../../../props/models/PayoutTransaction';
import classNames from 'classnames';

export default function TransactionStateLabel({ transaction }: { transaction: Transaction | PayoutTransaction }) {
    return (
        <div className={classNames('label', transaction.state == 'success' ? 'label-success' : 'label-default')}>
            {transaction.state_locale}
        </div>
    );
}
