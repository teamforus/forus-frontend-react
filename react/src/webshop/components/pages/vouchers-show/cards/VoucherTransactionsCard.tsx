import React, { Fragment } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import useVoucherData from '../../../../services/helpers/useVoucherData';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import StateNavLink from '../../../../modules/state_router/StateNavLink';

export default function VoucherTransactionsCard({ voucher }: { voucher: Voucher }) {
    const translate = useTranslate();
    const voucherCard = useVoucherData(voucher);

    return (
        <Fragment>
            {!voucherCard.product && (voucherCard.transactionsList.length > 0 || voucher.expired) && (
                <div className="block block-transactions">
                    <div className="transactions-header">
                        <h2 className="transactions-title">
                            {translate('voucher.transactions.title')}
                            {voucher.expired && (
                                <span className="text-strong-half">
                                    {translate('voucher.transactions.expired_on', {
                                        date: voucherCard.last_active_day_locale,
                                    })}
                                </span>
                            )}
                        </h2>
                    </div>

                    {voucher.expired && voucherCard.transactionsList?.length == 0 && (
                        <div className="transactions-body">
                            <div className="transactions-list">
                                <div className="transactions-item">
                                    <div className="transactions-item-details">
                                        <div className="transactions-item-empty">
                                            {translate('voucher.transactions.no_spending')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="transactions-body">
                        <div className="transactions-list">
                            {voucherCard.transactionsList?.map((transaction) => (
                                <div
                                    key={transaction.unique_id}
                                    className={`transactions-item ${transaction.incoming ? '' : 'transactions-item-out'}`}>
                                    <div className="transactions-item-icon">
                                        {transaction.incoming ? (
                                            <em className="mdi mdi-arrow-down" />
                                        ) : (
                                            <em className="mdi mdi-arrow-up" />
                                        )}
                                    </div>

                                    <div className="transactions-item-details">
                                        {transaction.type == 'product_voucher' && transaction.product_reservation && (
                                            <div className="transactions-item-counterpart">
                                                {translate('voucher.transactions.reservation') + ' '}
                                                <StateNavLink
                                                    name={'reservation-show'}
                                                    params={{
                                                        id: transaction.product_reservation.id,
                                                    }}>
                                                    #{transaction.product_reservation.code}
                                                </StateNavLink>
                                            </div>
                                        )}

                                        {transaction.type == 'product_voucher' && !transaction.product_reservation && (
                                            <div className="transactions-item-counterpart">
                                                {transaction.product.name}
                                            </div>
                                        )}

                                        {transaction.type == 'transaction' && transaction.target == 'provider' && (
                                            <div className="transactions-item-counterpart">
                                                {transaction.organization.name}
                                            </div>
                                        )}

                                        {transaction.type == 'transaction' && transaction.target == 'iban' && (
                                            <div className="transactions-item-counterpart">
                                                {translate('voucher.transactions.bank_transfer')}
                                            </div>
                                        )}

                                        {transaction.type == 'transaction' && transaction.target == 'top_up' && (
                                            <div className="transactions-item-counterpart">
                                                {translate('voucher.transactions.top_up')}
                                            </div>
                                        )}

                                        <div className="transactions-item-date">{transaction.created_at_locale}</div>
                                    </div>

                                    <div className="transactions-item-amount">
                                        <div className="transactions-item-value">
                                            {(transaction.incoming ? '' : '-') + ' ' + transaction.amount_locale}
                                        </div>
                                        <div className="transactions-item-type">
                                            {translate(
                                                transaction.incoming
                                                    ? 'voucher.transactions.add'
                                                    : 'voucher.transactions.subtract',
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
