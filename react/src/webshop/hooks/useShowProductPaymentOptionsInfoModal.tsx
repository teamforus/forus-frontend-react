import React, { useCallback, useMemo } from 'react';
import ModalNotification from '../components/modals/ModalNotification';
import useOpenModal from '../../dashboard/hooks/useOpenModal';
import useAssetUrl from './useAssetUrl';
import useTranslate from '../../dashboard/hooks/useTranslate';

export default function useShowProductPaymentOptionsInfoModal() {
    const assetUrl = useAssetUrl();
    const openModal = useOpenModal();
    const translate = useTranslate();

    const iconsBlock = useMemo(() => {
        return (
            <div className={'block block-products-payment-options-info'}>
                <div className="products-payment-option-info">
                    <div className="products-payment-option-icon">
                        <em className="mdi mdi-qrcode-scan" />
                    </div>
                    <div className="products-payment-option-content">
                        <div className="products-payment-option-title">
                            {translate('modal_product_payment_options_info.info_option_qr_title')}
                        </div>
                        <div className="products-payment-option-description">
                            {translate('modal_product_payment_options_info.info_option_qr_description')}
                        </div>
                    </div>
                </div>
                <div className="products-payment-option-info">
                    <div className="products-payment-option-icon">
                        <em className="mdi mdi-tag-multiple-outline" />
                    </div>
                    <div className="products-payment-option-content">
                        <div className="products-payment-option-title">
                            {translate('modal_product_payment_options_info.info_option_reservation_title')}
                        </div>
                        <div className="products-payment-option-description">
                            {translate('modal_product_payment_options_info.info_option_reservation_description')}
                        </div>
                    </div>
                </div>
                <div className="products-payment-option-info">
                    <div className="products-payment-option-icon">
                        <img src={assetUrl('/assets/img/icon-ideal.svg')} alt="" aria-hidden="true" />
                    </div>
                    <div className="products-payment-option-content">
                        <div className="products-payment-option-title">
                            {translate('modal_product_payment_options_info.info_option_extra_payment_ideal_title')}
                        </div>
                        <div className="products-payment-option-description">
                            {translate(
                                'modal_product_payment_options_info.info_option_extra_payment_ideal_description',
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }, [assetUrl, translate]);

    return useCallback(() => {
        openModal((modal) => (
            <ModalNotification
                modal={modal}
                title={translate('modal_product_payment_options_info.title')}
                header={translate('modal_product_payment_options_info.header')}
                description={translate('modal_product_payment_options_info.description')}
                mdiIconType={'default'}
                mdiIconClass={'information-outline'}
                type={'action-result'}
                confirmBtnText={translate('modal_product_payment_options_info.confirm')}
                appendElement={iconsBlock}
            />
        ));
    }, [openModal, iconsBlock, translate]);
}
