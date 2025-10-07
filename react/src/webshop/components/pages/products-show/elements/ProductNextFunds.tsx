import React, { Fragment, useCallback, useMemo } from 'react';
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
import useFetchAuthIdentity from '../../../../hooks/useFetchAuthIdentity';
import useFundMetaBuilder from '../../../../hooks/meta/useFundMetaBuilder';
import PayoutTransaction from '../../../../../dashboard/props/models/PayoutTransaction';
import classNames from 'classnames';

export default function ProductNextFunds({
    product,
    funds,
    payouts = [],
    vouchers = [],
}: {
    funds: Array<Fund>;
    product: Product;
    payouts: Array<PayoutTransaction>;
    vouchers: Array<Voucher>;
}) {
    const envData = useEnvData();
    const appConfigs = useAppConfigs();

    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const openModal = useOpenModal();
    const navigateState = useNavigateState();
    const fetchAuthIdentity = useFetchAuthIdentity();

    const authIdentity = useAuthIdentity();
    const showTakenByPartnerModal = useShowTakenByPartnerModal();

    const fundService = useFundService();
    const productService = useProductService();

    const onlyAvailableFunds = useMemo(() => envData?.config?.flags?.productDetailsOnlyAvailableFunds, [envData]);
    const fundMetaBuilder = useFundMetaBuilder();

    const productMeta = useMemo(() => {
        if (!product || !funds || !vouchers) {
            return null;
        }

        const meta = productService.checkEligibility(product, vouchers);

        return {
            ...meta,
            funds: meta.funds.map((productFund) => ({
                ...productFund,
                ...fundMetaBuilder(
                    { ...funds.find((fund) => fund.id == productFund.id), ...productFund },
                    payouts,
                    vouchers,
                    appConfigs,
                ),
            })),
        };
    }, [product, funds, vouchers, productService, fundMetaBuilder, payouts, appConfigs]);

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

                navigateState('fund-activate', { id: fund_id });
            });
        },
        [fundService, navigateState, showTakenByPartnerModal],
    );

    const reserveProduct = useCallback(
        (fund: Fund & { meta: { reservableVouchers: Voucher[] } }) => {
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

    if (productMeta?.funds?.length === 0) {
        return null;
    }

    if (onlyAvailableFunds && !productMeta?.hasReservableFunds) {
        return null;
    }

    return (
        <div className="product-funds-list">
            {listFunds.map((fund) => (
                <div key={fund.id} className="product-funds-item" data-dusk={`listFundsRow${fund.id}`}>
                    <div className="product-funds-item-media">
                        <img
                            className="product-funds-item-media-img"
                            src={fund.logo?.sizes?.thumbnail || assetUrl('/assets/img/placeholders/fund-thumbnail.png')}
                            alt=""
                        />
                    </div>
                    <div className="product-funds-item-content">
                        <div className="product-funds-item-details">
                            <div className="product-funds-item-details-name" data-dusk="fundName">
                                {fund.name}
                            </div>
                            <div className="product-funds-item-details-props">
                                {/* Price */}
                                {product.price_type !== 'informational' && (
                                    <Fragment>
                                        <div className="product-funds-item-details-prop product-funds-item-details-prop-price">
                                            {(product.price_type === 'regular' || product.price_type === 'free') && (
                                                <div className="product-funds-item-details-prop-value">
                                                    {fund.user_price === '0.00'
                                                        ? translate('product.status.free')
                                                        : fund.user_price_locale}
                                                </div>
                                            )}

                                            {(product.price_type === 'discount_fixed' ||
                                                product.price_type === 'discount_percentage') && (
                                                <div className="product-funds-item-details-prop-value">
                                                    {product.price_discount_locale}
                                                </div>
                                            )}
                                        </div>
                                        <div className="product-funds-item-details-prop-separator" />
                                    </Fragment>
                                )}

                                {/* Quantity limit */}
                                {(fund.meta.applicableVouchers?.length > 0
                                    ? fund.limit_available
                                    : fund.limit_per_identity) != null && (
                                    <Fragment>
                                        <div className="product-funds-item-details-prop">
                                            <em className="mdi mdi-account-multiple" />

                                            {authIdentity
                                                ? translate('product.labels.quantity_limit', {
                                                      limit: fund.meta.applicableVouchers.length
                                                          ? fund.limit_available
                                                          : fund.limit_per_identity,
                                                  })
                                                : translate('product.labels.quantity_limit', {
                                                      limit: fund.limit_per_identity,
                                                  })}
                                        </div>
                                        <div className="product-funds-item-details-prop-separator" />
                                    </Fragment>
                                )}

                                {/* Expiration date */}
                                <div className="product-funds-item-details-prop">
                                    <em className="mdi mdi-calendar" />
                                    {translate('product.labels.expire_by_date', {
                                        date: fund.meta.shownExpireDate.locale,
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="product-funds-item-actions">
                            {fund.meta.isReservationAvailable && (
                                <button
                                    type={'button'}
                                    className="button button-dark button-sm button-flat"
                                    onClick={() => reserveProduct(fund)}
                                    aria-label={translate('product.buttons.buy_label')}
                                    aria-haspopup="dialog"
                                    data-dusk="reserveProduct">
                                    {translate('product.buttons.buy')}
                                </button>
                            )}
                            {fund.external_link_text && fund.external_link_url && (
                                <a
                                    className={classNames(
                                        'button',
                                        fund.linkPrimaryButton ? 'button-primary' : 'button-primary-outline',
                                        'button-sm',
                                    )}
                                    target="_blank"
                                    href={fund.external_link_url}
                                    data-dusk="externalLink"
                                    rel="noreferrer">
                                    {fund.external_link_text}
                                    <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                </a>
                            )}
                            {fund.showRequestButton && (
                                <StateNavLink
                                    name={'fund-activate'}
                                    params={{ id: fund.id }}
                                    className="button button-primary button-sm"
                                    dataDusk="fundRequest">
                                    {fund.request_btn_text}
                                    <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                </StateNavLink>
                            )}
                            {fund.showPendingButton && (
                                <StateNavLink
                                    name={'fund-requests'}
                                    params={{ id: fund.id }}
                                    className="button button-primary-outline button-sm"
                                    dataDusk="fundRequests">
                                    {translate('funds.buttons.is_pending')}
                                </StateNavLink>
                            )}
                            {fund.showActivateButton && (
                                <button
                                    type="button"
                                    className="button button-primary button-sm"
                                    onClick={() => requestFund(fund)}
                                    data-dusk="fundActivate">
                                    {translate('funds.buttons.is_applicable')}
                                    <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                </button>
                            )}
                            {fund.alreadyReceived && !fund.meta.isReservationAvailable && (
                                <Fragment>
                                    {fund.hasVouchers ? (
                                        <StateNavLink
                                            name="voucher"
                                            params={{ number: fund.vouchers[0].number }}
                                            dataDusk="voucherButton"
                                            className="button button-primary button-sm">
                                            {translate(
                                                `funds.buttons.${fund.key}.already_received`,
                                                {},
                                                'funds.buttons.already_received',
                                            )}

                                            <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                        </StateNavLink>
                                    ) : (
                                        <Fragment>
                                            <div className="product-funds-item-details-prop-label">
                                                {translate('product.funds.not_available_label')}
                                            </div>
                                            <div
                                                className="product-funds-item-details-prop-value"
                                                data-dusk="notAvailable">
                                                {translate('product.funds.not_available_value')}
                                            </div>
                                        </Fragment>
                                    )}
                                </Fragment>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
