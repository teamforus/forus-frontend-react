import React, { useCallback, useMemo } from 'react';
import ModalNotification from '../components/modals/ModalNotification';
import useOpenModal from '../../dashboard/hooks/useOpenModal';
import useTranslate from '../../dashboard/hooks/useTranslate';
import useAppConfigs from './useAppConfigs';

export default function useShowProductPriceTypeOptionsInfoModal() {
    const appConfig = useAppConfigs();

    const openModal = useOpenModal();
    const translate = useTranslate();

    const iconsBlock = useMemo(() => {
        return (
            <div className={'block block-products-payment-options-info'}>
                <div className="products-payment-option-info">
                    <div className="products-payment-option-icon">
                        <em className="mdi mdi-cash" />
                    </div>
                    <div className="products-payment-option-content">
                        <div className="products-payment-option-title">
                            {translate('modal_product_price_type_options_info.info_option_regular_title')}
                        </div>
                        <div className="products-payment-option-description">
                            {translate('modal_product_price_type_options_info.info_option_regular_description')}
                        </div>
                    </div>
                </div>
                <div className="products-payment-option-info">
                    <div className="products-payment-option-icon">
                        <em className="mdi mdi-currency-eur" />
                    </div>
                    <div className="products-payment-option-content">
                        <div className="products-payment-option-title">
                            {translate('modal_product_price_type_options_info.info_option_discount_fixed_title')}
                        </div>
                        <div className="products-payment-option-description">
                            {translate('modal_product_price_type_options_info.info_option_discount_fixed_description')}
                        </div>
                    </div>
                </div>
                <div className="products-payment-option-info">
                    <div className="products-payment-option-icon">
                        <em className="mdi mdi-percent-circle-outline" />
                    </div>
                    <div className="products-payment-option-content">
                        <div className="products-payment-option-title">
                            {translate('modal_product_price_type_options_info.info_option_discount_percentage_title')}
                        </div>
                        <div className="products-payment-option-description">
                            {translate(
                                'modal_product_price_type_options_info.info_option_discount_percentage_description',
                            )}
                        </div>
                    </div>
                </div>
                <div className="products-payment-option-info">
                    <div className="products-payment-option-icon">
                        <em className="mdi mdi-gift-outline" />
                    </div>
                    <div className="products-payment-option-content">
                        <div className="products-payment-option-title">
                            {translate('modal_product_price_type_options_info.info_option_free_title')}
                        </div>
                        <div className="products-payment-option-description">
                            {translate('modal_product_price_type_options_info.info_option_free_description')}
                        </div>
                    </div>
                </div>
                <div className="products-payment-option-info">
                    <div className="products-payment-option-icon">
                        <em className="mdi mdi-storefront-outline" />
                    </div>
                    <div className="products-payment-option-content">
                        <div className="products-payment-option-title">
                            {translate('modal_product_price_type_options_info.info_option_informational_title')}
                        </div>
                        <div className="products-payment-option-description">
                            {translate('modal_product_price_type_options_info.info_option_informational_description')}
                        </div>
                    </div>
                </div>

                {appConfig?.implementation?.voucher_payout_informational_product_id && (
                    <div className="products-payment-option-info">
                        <div className="products-payment-option-icon">
                            <em className="mdi mdi-bank" />
                        </div>
                        <div className="products-payment-option-content">
                            <div className="products-payment-option-title">
                                {translate('modal_product_price_type_options_info.info_option_payout_title')}
                            </div>
                            <div className="products-payment-option-description">
                                {translate('modal_product_price_type_options_info.info_option_payout_description')}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }, [appConfig?.implementation?.voucher_payout_informational_product_id, translate]);

    return useCallback(() => {
        openModal((modal) => (
            <ModalNotification
                modal={modal}
                title={translate('modal_product_price_type_options_info.title')}
                header={translate('modal_product_price_type_options_info.header')}
                description={translate('modal_product_price_type_options_info.description')}
                mdiIconType={'default'}
                mdiIconClass={'information-outline'}
                type={'action-result'}
                confirmBtnText={translate('modal_product_price_type_options_info.confirm')}
                appendElement={iconsBlock}
            />
        ));
    }, [openModal, iconsBlock, translate]);
}
