import React, { Fragment, useCallback, useMemo } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { useVoucherService } from '../../../../services/VoucherService';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import useOpenModal from '../../../../../dashboard/hooks/useOpenModal';
import ModalNotification from '../../../modals/ModalNotification';
import useComposeVoucherCardData from '../../../../services/helpers/useComposeVoucherCardData';

export default function VoucherCard({
    voucher,
    onVoucherDestroyed,
}: {
    voucher: Voucher;
    onVoucherDestroyed: () => void;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const composeVoucherCardData = useComposeVoucherCardData();

    const voucherService = useVoucherService();

    const voucherCard = useMemo(() => {
        return composeVoucherCardData(voucher);
    }, [voucher, composeVoucherCardData]);

    const destroyVoucher = useCallback(
        (e: React.MouseEvent, voucher: Voucher) => {
            e.preventDefault();
            e.stopPropagation();

            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    type={'confirm'}
                    title={'Annuleer reservering'}
                    mdiIconType={'warning'}
                    mdiIconClass="alert-outline"
                    description={translate('voucher.delete_voucher.popup_form.description')}
                    confirmBtnText={translate('voucher.delete_voucher.buttons.submit')}
                    cancelBtnText={translate('voucher.delete_voucher.buttons.close')}
                    onConfirm={() => {
                        voucherService.destroy(voucher.address).then(() => {
                            modal?.close();
                            onVoucherDestroyed?.();
                        });
                    }}
                />
            ));
        },
        [onVoucherDestroyed, openModal, translate, voucherService],
    );

    return (
        <StateNavLink
            name={'voucher'}
            params={{ address: voucher.address }}
            className="voucher-item"
            dataDusk="voucherItem">
            <div className="voucher-image">
                <img src={voucherCard.thumbnail} alt="" />
            </div>
            <div className="voucher-details">
                <h2 className="voucher-name" data-dusk="voucherName">
                    {voucherCard.title}
                </h2>

                <div className="voucher-organization">
                    {voucherCard.records_title && (
                        <Fragment>
                            <span>{voucherCard.records_title}</span>
                            <span className="text-separator" />
                        </Fragment>
                    )}
                    <span>{voucherCard.subtitle}</span>
                </div>

                {!voucherCard.is_external && voucherCard.fund.type == 'budget' && voucherCard.type == 'regular' && (
                    <div className="voucher-value">{voucherCard.amount_locale}</div>
                )}

                {!voucher.deactivated && (
                    <div className="voucher-status-label">
                        {voucher.expired && (
                            <div className="label label-light">{translate('voucher.voucher_card.expired')}</div>
                        )}

                        {voucherCard.type == 'product' && !voucher.expired && (
                            <div className={`label ${voucherCard.used ? 'label-warning' : 'label-success'}`}>
                                {!voucherCard.used ? 'Ongebruikt' : 'Gebruikt'}
                            </div>
                        )}
                    </div>
                )}

                {voucher.deactivated && (
                    <div className="voucher-status-label">
                        <div className="label label-danger">Gedeactiveerd</div>
                    </div>
                )}

                {voucher.expired && !voucherCard.used && voucherCard.type == 'product' && voucherCard.returnable && (
                    <div className="voucher-cancel-label">
                        <label onClick={(e) => destroyVoucher(e, voucher)}>
                            {translate('voucher.voucher_card.delete')}
                        </label>
                    </div>
                )}
            </div>

            <div className="voucher-overview voucher-overview-stats">
                {!voucherCard.used && (
                    <div className="voucher-overview-item">
                        {voucher.expired ? (
                            <div className="voucher-overview-label">{translate('vouchers.labels.expired_on')}</div>
                        ) : (
                            <div className="voucher-overview-label">{translate('vouchers.labels.expire')}</div>
                        )}

                        <div className="voucher-overview-value">{voucherCard.last_active_day_locale}</div>
                    </div>
                )}

                {voucherCard.used && voucherCard.type == 'product' && (
                    <div className="voucher-overview-item">
                        <div className="voucher-overview-label">{translate('vouchers.labels.used_on')}</div>
                        <div className="voucher-overview-value">{voucherCard.last_transaction_at_locale}</div>
                    </div>
                )}
            </div>
        </StateNavLink>
    );
}
