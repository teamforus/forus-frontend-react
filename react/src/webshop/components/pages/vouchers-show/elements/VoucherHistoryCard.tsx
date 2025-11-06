import React from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import TransactionIconBg from '../../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/transaction-icon-bg.svg';
import useVoucherCard from '../hooks/useVoucherCard';

export default function VoucherHistoryCard({ voucher }: { voucher: Voucher }) {
    const voucherCard = useVoucherCard(voucher);

    return (
        <div className="block block-transactions">
            <div className="transactions-list">
                {voucherCard.history?.map((log) => (
                    <div key={log.id} className="transactions-item transactions-item-out">
                        {log.event.startsWith('created') && (
                            <div className="transactions-item-icon text-primary">
                                <TransactionIconBg aria-hidden="true" />
                                <em className="mdi mdi-ticket-confirmation" aria-hidden="true" />
                            </div>
                        )}
                        {log.event.startsWith('expired') && (
                            <div className="transactions-item-icon text-danger">
                                <TransactionIconBg aria-hidden="true" />
                                <em className="mdi mdi-close-octagon-outline" aria-hidden="true" />
                            </div>
                        )}
                        {log.event == 'activated' && (
                            <div className="transactions-item-icon text-primary">
                                <TransactionIconBg aria-hidden="true" />
                                <em className="mdi mdi-ticket" aria-hidden="true" />
                            </div>
                        )}
                        {log.event == 'deactivated' && (
                            <div className="transactions-item-icon text-danger">
                                <TransactionIconBg aria-hidden="true" />
                                <em className="mdi mdi-close-octagon-outline" aria-hidden="true" />
                            </div>
                        )}
                        <div className="transactions-item-details">
                            <div className="transactions-item-counterpart">{log.event_locale}</div>
                            <div className="transactions-item-date">{log.created_at_locale}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
