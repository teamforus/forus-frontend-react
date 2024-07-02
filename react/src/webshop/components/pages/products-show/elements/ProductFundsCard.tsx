import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import Fund from '../../../../props/models/Fund';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import Product from '../../../../props/models/Product';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useEnvData from '../../../../hooks/useEnvData';
import useShowTakenByPartnerModal from '../../../../services/helpers/useShowTakenByPartnerModal';
import useAppConfigs from '../../../../hooks/useAppConfigs';
import useAuthIdentity from '../../../../hooks/useAuthIdentity';
import { useFundService } from '../../../../services/FundService';
import { useNavigateState } from '../../../../modules/state_router/Router';
import { useProductService } from '../../../../services/ProductService';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import useOpenModal from '../../../../../dashboard/hooks/useOpenModal';
import ModalProductReserve from '../../../modals/modal-product-reserve/ModalProductReserve';
import Tooltip from '../../../elements/tooltip/Tooltip';
import useFetchAuthIdentity from '../../../../hooks/useFetchAuthIdentity';

export default function ProductFundsCard({ product, vouchers = [] }: { product: Product; vouchers: Array<Voucher> }) {
    const envData = useEnvData();
    const appConfigs = useAppConfigs();

    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const openModal = useOpenModal();
    const navigateState = useNavigateState();
    const fetchAuthIdentity = useFetchAuthIdentity();

    const authIdentity = useAuthIdentity();
    const showTakenByPartnerModal = useShowTakenByPartnerModal();

    const [funds, setFunds] = useState<Array<Fund>>(null);

    const fundService = useFundService();
    const productService = useProductService();

    const onlyAvailableFunds = useMemo(() => envData?.config?.flags?.productDetailsOnlyAvailableFunds, [envData]);

    const productMeta = useMemo(() => {
        if (!product || !funds || !vouchers) {
            return null;
        }

        const meta = productService.checkEligibility(product, vouchers);

        return {
            ...meta,
            funds: meta.funds.map((productFund) => ({
                ...productFund,
                ...fundService.mapFund(
                    { ...funds.find((fund) => fund.id == productFund.id), ...productFund },
                    vouchers,
                    appConfigs,
                ),
            })),
        };
    }, [product, funds, productService, vouchers, fundService, appConfigs]);

    const listFunds = useMemo(() => {
        return productMeta?.funds.filter((fund) => !onlyAvailableFunds || fund.meta.isReservationAvailable);
    }, [onlyAvailableFunds, productMeta?.funds]);

    const requestFund = useCallback(
        (fund: Fund) => {
            fundService.read(fund.id).then((res) => {
                const fund = res.data.data;
                const fund_id = fund.id;

                if (fund.taken_by_partner) {
                    return showTakenByPartnerModal();
                }

                navigateState('fund-activate', { fund_id });
            });
        },
        [fundService, navigateState, showTakenByPartnerModal],
    );

    const reserveProduct = useCallback(
        (fund) => {
            fetchAuthIdentity().then(() => {
                openModal((modal) => (
                    <ModalProductReserve
                        fund={fund}
                        modal={modal}
                        product={product}
                        vouchers={fund.meta.reservableVouchers}
                    />
                ));
            });
        },
        [fetchAuthIdentity, openModal, product],
    );

    const fetchFunds = useCallback(() => {
        if (!product?.funds.length) {
            return;
        }

        fundService
            .list({ per_page: 100, check_criteria: 1, fund_ids: product?.funds.map((fund) => fund.id) })
            .then((res) => setFunds(res.data.data));
    }, [fundService, product?.funds]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    return (
        <Fragment>
            {productMeta?.funds?.length > 0 && (!onlyAvailableFunds || productMeta?.hasReservableFunds) && (
                <div className="block block-pane">
                    <div className="pane-head">
                        <StateNavLink className="pane-head-title" name="vouchers" customElement={'h2'}>
                            {translate('product.headers.funds')}
                        </StateNavLink>
                    </div>

                    <div className="pane-section pane-section-collapsed">
                        <div className="product-funds-list">
                            {listFunds.map((fund) => (
                                <div key={fund.id} className="fund-item" data-dusk="fundItem">
                                    <div className="fund-item-section fund-item-section-details text-left">
                                        <div className="fund-item-media">
                                            <img
                                                className="fund-item-media-img"
                                                src={
                                                    fund.logo?.sizes?.thumbnail ||
                                                    assetUrl('/assets/img/placeholders/fund-thumbnail.png')
                                                }
                                                alt=""
                                            />
                                        </div>
                                        <div className="fund-item-content">
                                            <div className="fund-item-section-label flex-start">Tegoed:</div>
                                            <div
                                                className="fund-item-section-value fund-item-section-value-sm"
                                                data-dusk="fundName">
                                                {fund.name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="fund-item-section">
                                        <div className="fund-item-section-label">
                                            {translate('product.labels.expire')}
                                        </div>
                                        <div className="fund-item-section-value fund-item-section-value-sm">
                                            {translate('product.labels.expire_prefix')}
                                            {fund.meta.shownExpireDate.locale}
                                        </div>
                                    </div>
                                    {(fund.meta.applicableVouchers.length
                                        ? fund.limit_available
                                        : fund.limit_per_identity) != null && (
                                        <div className="fund-item-section text-right">
                                            {authIdentity && (
                                                <div className="fund-item-section-label tooltip-block">
                                                    {translate('product.labels.limit')}
                                                    {authIdentity && (
                                                        <Fragment>
                                                            &nbsp;
                                                            <Tooltip
                                                                text={translate('product.tooltip')}
                                                                ng-if="$root.auth_user"
                                                            />
                                                        </Fragment>
                                                    )}
                                                </div>
                                            )}
                                            {authIdentity && (
                                                <div className="fund-item-section-value">
                                                    {fund.meta.applicableVouchers.length
                                                        ? fund.limit_available
                                                        : fund.limit_per_identity}
                                                </div>
                                            )}
                                            {!authIdentity && (
                                                <div className="fund-item-section-label">
                                                    {translate('product.labels.max_limit')}
                                                </div>
                                            )}
                                            {!authIdentity && (
                                                <div className="fund-item-section-value">{fund.limit_per_identity}</div>
                                            )}
                                        </div>
                                    )}
                                    <div className="fund-item-section fund-item-price text-right">
                                        {(product.price_type === 'free' || product.price_type === 'regular') && (
                                            <div className="fund-item-section-label">
                                                {translate('product.labels.price')}
                                            </div>
                                        )}

                                        {(product.price_type === 'discount_fixed' ||
                                            product.price_type === 'discount_percentage') && (
                                            <div className="fund-item-section-label">
                                                {translate('product.labels.discount')}
                                            </div>
                                        )}

                                        {fund.type == 'subsidies' &&
                                            (product.price_type === 'free' ||
                                                (product.price_type === 'regular' && fund.price == '0.00')) && (
                                                <div className="fund-item-section-value">
                                                    {translate('product.status.free')}
                                                </div>
                                            )}

                                        {fund.type == 'subsidies' &&
                                            product.price_type === 'regular' &&
                                            fund.price != '0.00' && (
                                                <div className="fund-item-section-value">{fund.price_locale}</div>
                                            )}

                                        {fund.type == 'budget' &&
                                            (product.price_type === 'regular' || product.price_type === 'free') && (
                                                <div className="fund-item-section-value">{product.price_locale}</div>
                                            )}

                                        {(product.price_type === 'discount_fixed' ||
                                            product.price_type === 'discount_percentage') && (
                                            <div className="fund-item-section-value">
                                                {product.price_discount_locale}
                                            </div>
                                        )}
                                    </div>

                                    {fund.meta.isReservationAvailable && (
                                        <div className="fund-item-section">
                                            <button
                                                type={'button'}
                                                className="button button-dark button-flat"
                                                onClick={() => reserveProduct(fund)}
                                                data-dusk="reserveProduct">
                                                {translate('product.buttons.buy')}
                                            </button>
                                        </div>
                                    )}
                                    {fund.external_link_text && fund.external_link_url && (
                                        <div className="fund-item-section">
                                            <a
                                                className={`button ${
                                                    fund.linkPrimaryButton ? 'button-primary' : 'button-primary-outline'
                                                }`}
                                                target="_blank"
                                                href={fund.external_link_url}
                                                rel="noreferrer">
                                                {fund.external_link_text}
                                                <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                            </a>
                                        </div>
                                    )}
                                    {fund.showRequestButton && (
                                        <div className="fund-item-section">
                                            <StateNavLink
                                                name={'fund-activate'}
                                                params={{ id: fund.id }}
                                                className="button button-primary">
                                                {fund.request_btn_text}
                                                <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                            </StateNavLink>
                                        </div>
                                    )}
                                    {fund.showPendingButton && (
                                        <div className="fund-item-section">
                                            <StateNavLink
                                                name={'fund-requests'}
                                                params={{ id: fund.id }}
                                                className="button button-primary-outline">
                                                {translate('funds.buttons.is_pending')}
                                            </StateNavLink>
                                        </div>
                                    )}
                                    {fund.showActivateButton && (
                                        <div className="fund-item-section">
                                            <button
                                                type="button"
                                                className="button button-primary"
                                                onClick={() => requestFund(fund)}>
                                                {translate('funds.buttons.is_applicable')}
                                                <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                            </button>
                                        </div>
                                    )}
                                    {fund.alreadyReceived && !fund.meta.isReservationAvailable && (
                                        <div className="fund-item-section">
                                            <StateNavLink
                                                name="voucher"
                                                params={{
                                                    address: fund.vouchers[0].address,
                                                }}
                                                className="button button-primary">
                                                {translate(
                                                    `funds.buttons.${fund.key}.already_received`,
                                                    {},
                                                    'funds.buttons.already_received',
                                                )}

                                                <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                            </StateNavLink>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {(!authIdentity || (onlyAvailableFunds && !productMeta?.hasReservableFunds)) && (
                <div className="block block-action-card block-action-card-compact">
                    <div className="block-card-logo" aria-hidden="true" />
                    <div className="block-card-details">
                        <h3 className="block-card-title">{translate('product.labels.funds_card_title')}</h3>
                        <div className="block-card-description">
                            {translate('product.labels.funds_card_description')}
                        </div>
                    </div>
                    <div className="block-card-actions">
                        <StateNavLink className="button button-primary" name="funds">
                            {translate('product.labels.funds_card_btn_text')}
                            <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                        </StateNavLink>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
