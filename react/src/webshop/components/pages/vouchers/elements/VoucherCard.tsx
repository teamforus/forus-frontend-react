import React, { Fragment, useCallback } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { useVoucherService } from '../../../../services/VoucherService';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import useOpenModal from '../../../../../dashboard/hooks/useOpenModal';
import ModalNotification from '../../../modals/ModalNotification';
import useVoucherData from '../../../../services/helpers/useVoucherData';
import useAssetUrl from '../../../../hooks/useAssetUrl';

export default function VoucherCard({
    type = 'voucher',
    voucher,
    onVoucherDestroyed,
}: {
    type?: 'voucher' | 'physical_card';
    voucher: Voucher;
    onVoucherDestroyed: () => void;
}) {
    const assetUrl = useAssetUrl();
    const openModal = useOpenModal();
    const translate = useTranslate();

    const voucherService = useVoucherService();

    const voucherCard = useVoucherData(voucher);

    const destroyVoucher = useCallback(
        (e: React.MouseEvent, voucher: Voucher) => {
            e.preventDefault();
            e.stopPropagation();

            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    type={'confirm'}
                    title={translate('voucher.delete_voucher.popup_form.title')}
                    mdiIconType={'warning'}
                    mdiIconClass="alert-outline"
                    description={translate('voucher.delete_voucher.popup_form.description')}
                    confirmBtnText={translate('voucher.delete_voucher.buttons.submit')}
                    cancelBtnText={translate('voucher.delete_voucher.buttons.close')}
                    onConfirm={() => {
                        voucherService.destroy(voucher.number).then(() => {
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
            params={{ number: voucher.number }}
            className="voucher-item"
            dataDusk={`listVouchersRow${voucher.id}`}
            dataAttributes={{ 'data-search-item': 1 }}>
            <div className="voucher-image">
                {type === 'voucher' ? (
                    <img src={voucherCard.thumbnail} alt="" />
                ) : (
                    <img
                        src={
                            voucherCard.physical_card?.photo?.sizes?.small ||
                            assetUrl('/assets/img/placeholders/physical-card-type.svg')
                        }
                        alt=""
                    />
                )}
            </div>
            <div className="voucher-details">
                <h2 className="voucher-name" data-dusk="voucherName">
                    <span className={'voucher-name-number'}>#{voucherCard.number}</span> {voucherCard.title}
                </h2>

                <div className="voucher-organization">
                    {voucherCard.records_title && (
                        <Fragment>
                            <span>{voucherCard.records_title}</span>
                            <span className="text-separator" />
                        </Fragment>
                    )}
                    <span>{type === 'voucher' ? voucherCard.subtitle : voucherCard.physical_card?.code_locale}</span>
                </div>

                {voucherCard.type === 'regular' && <div className="voucher-value">{voucherCard.amount_locale}</div>}

                {!voucher.deactivated && (
                    <div className="voucher-status-label">
                        {voucher.expired && (
                            <div className="label label-light">{translate('vouchers.card.expired')}</div>
                        )}

                        {voucherCard.type == 'product' && !voucher.expired && (
                            <div className={`label ${voucherCard.used ? 'label-warning' : 'label-success'}`}>
                                {!voucherCard.used
                                    ? translate('vouchers.card.unused')
                                    : translate('vouchers.card.used')}
                            </div>
                        )}
                    </div>
                )}

                {voucher.deactivated && (
                    <div className="voucher-status-label">
                        <div className="label label-danger">{translate('vouchers.card.deactivated')}</div>
                    </div>
                )}

                {voucher.expired && !voucherCard.used && voucherCard.type == 'product' && voucherCard.returnable && (
                    <div className="voucher-cancel-label">
                        <label onClick={(e) => destroyVoucher(e, voucher)}>{translate('vouchers.card.delete')}</label>
                    </div>
                )}
            </div>

            <div className="voucher-overview voucher-overview-stats">
                <div className="voucher-overview-items">
                    {voucherCard.number && (
                        <div className="voucher-overview-item">
                            <div className="voucher-overview-label">{translate('vouchers.card.number')}</div>
                            <div className="voucher-overview-value">#{voucherCard.number}</div>
                        </div>
                    )}

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
            </div>
        </StateNavLink>
    );
}
