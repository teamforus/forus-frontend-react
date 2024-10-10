import React from 'react';
import PayoutTransaction from '../../../../../dashboard/props/models/PayoutTransaction';
import EmptyValue from '../../../elements/empty-value/EmptyValue';

export default function PayoutCardDetails({ payoutTransaction }: { payoutTransaction: PayoutTransaction }) {
    if (!payoutTransaction) {
        return null;
    }

    return (
        <div className="payout-details-extra">
            <div className="block block-key-value-list block-key-value-list-pane">
                <div className="block-key-value-list-item">
                    <div className="key-value-list-item-label">IBAN (van)</div>
                    <div className="key-value-list-item-value">{payoutTransaction.iban_from || <EmptyValue />}</div>
                </div>
                <div className="block-key-value-list-item">
                    <div className="key-value-list-item-label">IBAN (naar)</div>
                    <div className="key-value-list-item-value">{payoutTransaction.iban_to || <EmptyValue />}</div>
                </div>
                <div className="block-key-value-list-item">
                    <div className="key-value-list-item-label">IBAN naam (naar)</div>
                    <div className="key-value-list-item-value">{payoutTransaction.iban_to_name || <EmptyValue />}</div>
                </div>
            </div>
        </div>
    );
}
