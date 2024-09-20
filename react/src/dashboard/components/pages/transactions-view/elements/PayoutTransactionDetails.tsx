import React from 'react';
import Tooltip from '../../../elements/tooltip/Tooltip';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import useTranslate from '../../../../hooks/useTranslate';
import TransactionLabel from '../../transactions/elements/TransactionLabel';
import TableDateOnly from '../../../elements/tables/elements/TableDateOnly';
import PayoutTransaction from '../../../../props/models/PayoutTransaction';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';

export default function PayoutTransactionDetails({ transaction }: { transaction: PayoutTransaction }) {
    const translate = useTranslate();

    if (!transaction) {
        return <LoadingCard />;
    }

    return (
        <div className="block block-transaction-details">
            <div className="card card-wrapped">
                <div className="card-header">
                    <div className="flex">
                        <div className="flex flex-grow">
                            <div className="card-title">{translate('payouts.labels.details')}</div>
                        </div>
                    </div>
                </div>
                <div className="card-section">
                    <div className="flex">
                        <div className="flex">
                            <div className="card-block card-block-keyvalue">
                                <div className="keyvalue-item">
                                    <div className="keyvalue-key">{translate('payouts.labels.id')}</div>
                                    <div className="keyvalue-value">{transaction.id}</div>
                                </div>
                                <div className="keyvalue-item">
                                    <div className="keyvalue-key">Status</div>
                                    <div className="keyvalue-value">
                                        <TransactionLabel transaction={transaction} />
                                        {transaction.transfer_in > 0 && transaction.state == 'pending' && (
                                            <div className="text-sm text-muted-dark">
                                                <em className="mdi mdi-clock-outline"> </em>
                                                {transaction.transfer_in} dagen resterend
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="keyvalue-item">
                                    <div className="keyvalue-key">{translate('payouts.labels.fund')}</div>
                                    <div className="keyvalue-value">{transaction.fund.name}</div>
                                </div>
                                <div className="keyvalue-item">
                                    <div className="keyvalue-key">{translate('payouts.labels.amount')}</div>
                                    <div className="keyvalue-value">{transaction.amount_locale}</div>
                                </div>
                                <div className="keyvalue-item">
                                    <div className="keyvalue-key">{translate('payouts.labels.created_at')}</div>
                                    <div className="keyvalue-value">
                                        <TableDateOnly value={transaction.created_at_locale} />
                                    </div>
                                </div>
                                <div className="keyvalue-item">
                                    <div className="keyvalue-key">{translate('payouts.labels.transfer_at')}</div>
                                    <div className="keyvalue-value">
                                        <TableDateOnly value={transaction.transfer_at_locale} />
                                    </div>
                                </div>
                                <div className="keyvalue-item">
                                    <div className="keyvalue-key">{translate('payouts.labels.payment_type')}</div>
                                    {transaction.payment_type_locale?.title}
                                </div>
                                <div className="keyvalue-item">
                                    <div className="keyvalue-key">{translate('payouts.labels.created_by')}</div>
                                    {transaction.employee?.email}
                                </div>

                                {transaction.iban_from && (
                                    <div className="keyvalue-item">
                                        <div className="keyvalue-key">IBAN (van)</div>
                                        <div className="keyvalue-value">
                                            <span className={transaction.iban_final ? '' : 'text-muted-dark'}>
                                                {transaction.iban_from}
                                            </span>
                                            {!transaction.iban_final && (
                                                <Tooltip text={translate('payouts.tooltips.pending_iban_from')} />
                                            )}
                                        </div>
                                    </div>
                                )}

                                {transaction.iban_to && (
                                    <div className="keyvalue-item">
                                        <div className="keyvalue-key">IBAN (naar)</div>
                                        <div className="keyvalue-value">
                                            <span
                                                className={
                                                    !transaction.iban_final && transaction.target != 'iban'
                                                        ? 'text-muted-dark'
                                                        : ''
                                                }>
                                                {transaction.iban_to}
                                            </span>

                                            {!transaction.iban_final && transaction.target != 'iban' && (
                                                <Tooltip text={translate('payouts.tooltips.pending_iban_to')} />
                                            )}
                                        </div>
                                    </div>
                                )}

                                {transaction.iban_to_name && (
                                    <div className="keyvalue-item">
                                        <div className="keyvalue-key">IBAN naam (naar)</div>
                                        <div className="keyvalue-value">
                                            <span
                                                className={
                                                    !transaction.iban_final && transaction.target != 'iban'
                                                        ? 'text-muted-dark'
                                                        : ''
                                                }>
                                                {transaction.iban_to_name}
                                            </span>
                                            {!transaction.iban_final && transaction.target != 'iban' && (
                                                <Tooltip text={translate('payouts.tooltips.pending_iban_to')} />
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="keyvalue-item">
                                    <div className="keyvalue-key">{translate('payouts.labels.description')}</div>
                                    <div className="keyvalue-value">
                                        {transaction.description || <TableEmptyValue />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
