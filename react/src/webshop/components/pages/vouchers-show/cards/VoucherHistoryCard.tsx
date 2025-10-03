import React, { Fragment, useMemo } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import useVoucherData from '../../../../services/helpers/useVoucherData';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';

export default function VoucherHistoryCard({ voucher }: { voucher: Voucher }) {
    const translate = useTranslate();
    const voucherCard = useVoucherData(voucher);

    const showHistory = useMemo(
        () => voucher?.history.filter((history) => !history.event.startsWith('created_')).length > 0,
        [voucher?.history],
    );

    return (
        <Fragment>
            {showHistory && (
                <div className="block block-transactions">
                    <div className="transactions-header">
                        <h2 className="transactions-title">{translate('voucher.history.title')}</h2>
                        {voucher.expired ? (
                            <div className="label label-danger">{translate('voucher.history.status.expired')}</div>
                        ) : (
                            <div className={`label ${voucherCard.deactivated ? 'label-light' : 'label-primary'}`}>
                                {voucherCard.state_locale}
                            </div>
                        )}
                    </div>

                    <div className="transactions-body">
                        <div className="transactions-list">
                            {voucherCard.history?.map((log) => (
                                <div key={log.id} className="transactions-item transactions-item-out">
                                    {log.event.startsWith('created') && (
                                        <div className="transactions-item-icon text-primary">
                                            <em className="mdi mdi-ticket-confirmation" />
                                        </div>
                                    )}
                                    {log.event.startsWith('expired') && (
                                        <div className="transactions-item-icon text-danger">
                                            <em className="mdi mdi-close-octagon-outline" />
                                        </div>
                                    )}
                                    {log.event == 'activated' && (
                                        <div className="transactions-item-icon text-primary">
                                            <em className="mdi mdi-ticket" />
                                        </div>
                                    )}
                                    {log.event == 'deactivated' && (
                                        <div className="transactions-item-icon text-danger">
                                            <em className="mdi mdi-close-octagon-outline" />
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
                </div>
            )}
        </Fragment>
    );
}
