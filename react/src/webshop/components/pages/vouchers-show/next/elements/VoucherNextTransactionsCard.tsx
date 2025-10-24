import React from 'react';
import Voucher from '../../../../../../dashboard/props/models/Voucher';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import TransactionIconBg from '../../../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/transaction-icon-bg.svg';
import useVoucherCard from '../hooks/useVoucherCard';
import classNames from 'classnames';

export default function VoucherNextTransactionsCard({ voucher }: { voucher: Voucher }) {
    const translate = useTranslate();
    const voucherCard = useVoucherCard(voucher);

    return (
        <div className="block block-transactions-next">
            <div className="transactions-list">
                {voucherCard.transactionsList?.map((transaction) => (
                    <div
                        key={transaction.unique_id}
                        className={classNames(`transactions-item`, transaction.incoming && 'transactions-item-out')}>
                        <div className="transactions-item-icon">
                            <TransactionIconBg aria-hidden="true" />

                            {transaction.incoming ? (
                                <em className="mdi mdi-arrow-down" aria-hidden="true" />
                            ) : (
                                <em className="mdi mdi-arrow-up" aria-hidden="true" />
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
                                <div className="transactions-item-counterpart">{transaction.product.name}</div>
                            )}

                            {transaction.type == 'transaction' && transaction.target == 'provider' && (
                                <div className="transactions-item-counterpart">{transaction.organization.name}</div>
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
                                    transaction.incoming ? 'voucher.transactions.add' : 'voucher.transactions.subtract',
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
