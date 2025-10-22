import React, { Fragment, useState } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import useVoucherData from '../../../../services/helpers/useVoucherData';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import IconVoucherRecords from '../../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-voucher-records.svg';
import BlockVoucherRecords from '../../../elements/block-voucher-records/BlockVoucherRecords';

export default function VoucherRecordsCard({ voucher }: { voucher: Voucher }) {
    const translate = useTranslate();
    const voucherCard = useVoucherData(voucher);

    const [showRecords, setShowRecords] = useState<boolean>(null);

    return (
        <Fragment>
            {voucherCard.records?.length > 0 && (
                <div className="block block-action-card block-action-card-compact">
                    <div className="block-card-body">
                        <div className="block-card-section">
                            <div className="block-card-logo">
                                <IconVoucherRecords />
                            </div>
                            {voucherCard.records_title ? (
                                <div className="block-card-details">
                                    <h3 className="block-card-title block-card-title-sm text-muted-dim">
                                        {translate('voucher.physical_card.personal_date')}
                                    </h3>
                                    <h2 className="block-card-title block-card-title-lg">
                                        <strong>{voucherCard.records_title}</strong>
                                        {voucherCard.records_by_key.birth_date && (
                                            <Fragment>
                                                <span className="text-separator" />
                                                <span className="text-muted-dim">
                                                    {voucherCard.records_by_key.birth_date}
                                                </span>
                                            </Fragment>
                                        )}
                                    </h2>
                                </div>
                            ) : (
                                <div className="block-card-details">
                                    <h3 className="block-card-title">
                                        {translate('voucher.physical_card.personal_date')}
                                    </h3>
                                </div>
                            )}

                            <div className="block-card-actions">
                                <div
                                    className="button button-primary-outline button-sm"
                                    onClick={() => setShowRecords(!showRecords)}>
                                    {showRecords
                                        ? translate('voucher.physical_card.less_details')
                                        : translate('voucher.physical_card.more_details')}
                                    {showRecords ? (
                                        <em className="mdi mdi-chevron-up icon-right" />
                                    ) : (
                                        <em className="mdi mdi-chevron-right icon-right" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {showRecords && (
                            <div className="block-card-section">
                                <BlockVoucherRecords voucher={voucher} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Fragment>
    );
}
