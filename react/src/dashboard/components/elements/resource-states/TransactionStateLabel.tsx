import React from 'react';
import Transaction from '../../../props/models/Transaction';
import PayoutTransaction from '../../../props/models/PayoutTransaction';
import Label from '../image_cropper/Label';

export default function TransactionStateLabel({ transaction }: { transaction: Transaction | PayoutTransaction }) {
    return <Label type={transaction.state == 'success' ? 'success' : 'default'}>{transaction.state_locale}</Label>;
}
