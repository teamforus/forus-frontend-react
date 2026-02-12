import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useParams } from 'react-router';
import SponsorProduct from '../../../props/models/Sponsor/SponsorProduct';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { currencyFormat, strLimit } from '../../../helpers/string';
import useUpdateProduct from '../fund-provider/hooks/useUpdateProduct';
import useSetProgress from '../../../hooks/useSetProgress';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import FundProvider from '../../../props/models/FundProvider';
import useTranslate from '../../../hooks/useTranslate';
import ProductDetailsBlock from '../products-view/elements/ProductDetailsBlock';
import usePushApiError from '../../../hooks/usePushApiError';
import classNames from 'classnames';
import useProductChat from '../fund-provider/hooks/useProductChat';
import FundProviderProductRowData from '../fund-provider/elements/FundProviderProductRowData';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import FormPane from '../../elements/forms/elements/FormPane';
import KeyValueItem from '../../elements/key-value/KeyValueItem';
import EmptyValue from '../../elements/empty-value/EmptyValue';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function FundProviderProductView() {
    const { id, fundId, fundProviderId } = useParams();

    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();

    const [fund, setFund] = useState<Fund>(null);
    const [product, setProduct] = useState<SponsorProduct>(null);
    const [fundProvider, setFundProvider] = useState<FundProvider>(null);

    const activeDeal = useMemo(() => {
        return product?.deals_history?.find((item) => item.active);
    }, [product?.deals_history]);

    const dealsHistory = product?.deals_history || [];

    const { disableProduct, editProduct, mapProduct, isProductConfigurable } = useUpdateProduct();
    const { openProductChat, makeProductChat } = useProductChat(fund, fundProvider, activeOrganization);

    const productAllowed = useMemo(() => {
        return fundProvider?.products?.includes(product?.id);
    }, [fundProvider?.products, product?.id]);

    const disableProviderProduct = useCallback(
        (product: SponsorProduct) => {
            disableProduct(fundProvider, product).then((res) => setFundProvider(res));
        },
        [disableProduct, fundProvider],
    );

    const fetchFund = useCallback(() => {
        setProgress(0);

        fundService
            .readPublic(parseInt(fundId))
            .then((res) => setFund(res.data.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [fundId, fundService, pushApiError, setProgress]);

    const fetchFundProvider = useCallback(() => {
        if (!fund) {
            return;
        }

        setProgress(0);

        fundService
            .readProvider(activeOrganization.id, fund.id, parseInt(fundProviderId))
            .then((res) => setFundProvider(res.data.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization.id, fund, fundProviderId, pushApiError]);

    const fetchProduct = useCallback(() => {
        if (!fund || !fundProvider) {
            return;
        }

        setProgress(0);

        fundService
            .getProviderProduct(activeOrganization.id, fund.id, fundProvider.id, parseInt(id))
            .then((res) => setProduct(mapProduct(fundProvider, res.data.data)))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization.id, fund, id, pushApiError, mapProduct, fundProvider]);

    useEffect(() => {
        fetchFund();
    }, [fetchFund]);

    useEffect(() => {
        fetchFundProvider();
    }, [fetchFundProvider]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    if (!product || !fund || !fundProvider) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={DashboardRoutes.SPONSOR_PROVIDER_ORGANIZATIONS}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {translate('page_state_titles.organization-providers')}
                </StateNavLink>
                <StateNavLink
                    name={DashboardRoutes.SPONSOR_PROVIDER_ORGANIZATION}
                    params={{
                        id: fundProvider.organization.id,
                        organizationId: activeOrganization.id,
                    }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {strLimit(fundProvider.organization.name, 40)}
                </StateNavLink>
                <StateNavLink
                    name={DashboardRoutes.FUND_PROVIDER}
                    params={{
                        id: fundProvider.id,
                        fundId: fund.id,
                        organizationId: activeOrganization.id,
                    }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {strLimit(fundProvider.fund.name, 40)}
                </StateNavLink>
                <div className="breadcrumb-item active">{strLimit(product.name, 40)}</div>
            </div>

            <div className="card">
                <div className="card-section form">
                    <ProductDetailsBlock viewType={'sponsor'} product={product}>
                        {activeDeal && (
                            <Fragment>
                                <FormPane title={'Verloopdatum en limieten'} large={true}>
                                    <div className="card-block card-block-keyvalue card-block-keyvalue-md card-block-keyvalue-text-sm">
                                        <KeyValueItem label={'Type aanbod'}>
                                            {activeDeal.payment_type_locale}
                                        </KeyValueItem>
                                        <KeyValueItem label={'Verloopdatum'}>
                                            {activeDeal?.expire_at_locale || fund?.end_date_locale}
                                        </KeyValueItem>
                                        <KeyValueItem label={'Totaal aantal'}>
                                            {activeDeal?.limit_total ? activeDeal.limit_total : <EmptyValue />}
                                        </KeyValueItem>
                                        <KeyValueItem label={'Aantal per aanvrager'}>
                                            {activeDeal?.limit_per_identity ? (
                                                activeDeal.limit_per_identity
                                            ) : (
                                                <EmptyValue />
                                            )}
                                        </KeyValueItem>
                                        <KeyValueItem label={'Toon QR-code op de webshop'}>
                                            {activeDeal?.allow_scanning ? 'Ja' : 'Nee'}
                                        </KeyValueItem>
                                    </div>
                                </FormPane>

                                {activeDeal?.payment_type === 'subsidy' && (
                                    <FormPane title={'Prijs details'} large={true}>
                                        <div className="card-block card-block-keyvalue card-block-keyvalue-md card-block-keyvalue-text-sm">
                                            <KeyValueItem label={'Totaalprijs'}>{product?.price_locale}</KeyValueItem>
                                            <KeyValueItem label={'Bijdrage vanuit sponsor'}>
                                                {activeDeal?.amount_locale}
                                            </KeyValueItem>
                                            <KeyValueItem label={'Prijs voor de klant'}>
                                                {currencyFormat(
                                                    Math.max(
                                                        parseFloat(product?.price || '0') -
                                                            parseFloat(activeDeal?.amount || '0'),
                                                        0,
                                                    ),
                                                )}
                                            </KeyValueItem>
                                        </div>
                                    </FormPane>
                                )}
                            </Fragment>
                        )}
                    </ProductDetailsBlock>
                </div>
                <div className="card-footer card-footer-primary flex flex-end">
                    {!product.fund_provider_product_chat ? (
                        <button
                            type="button"
                            className="button button-primary-light"
                            onClick={() => makeProductChat(product, fetchFundProvider)}>
                            <em className="mdi mdi-message-text-outline icon-start" />
                            Nieuw aanpassingsverzoek
                        </button>
                    ) : (
                        <div className={'button-group flex flex-gap'}>
                            <button
                                type="button"
                                className={classNames(
                                    'button',
                                    product.fund_provider_product_chat.sponsor_unseen_messages > 0
                                        ? 'button-primary-light'
                                        : 'button-default',
                                )}
                                onClick={() => openProductChat(product.fund_provider_product_chat, fetchFundProvider)}>
                                <em className="mdi mdi-message-text-outline icon-start" />
                                Bekijk gesprek
                                {product.fund_provider_product_chat.sponsor_unseen_messages > 0 && (
                                    <span className={'count'}>
                                        {product.fund_provider_product_chat.sponsor_unseen_messages > 9 && '+'}
                                        {Math.min(product.fund_provider_product_chat.sponsor_unseen_messages, 9)}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}

                    <div className="flex flex-grow" />

                    {product.sponsor_organization_id === activeOrganization.id && (
                        <StateNavLink
                            className="button button-primary"
                            name={DashboardRoutes.FUND_PROVIDER_PRODUCT_EDIT}
                            params={{
                                id: product.id,
                                fundId: fundProvider.fund_id,
                                fundProviderId: fundProvider.id,
                                organizationId: activeOrganization.id,
                            }}>
                            <em className="mdi mdi-pencil icon-start" />
                            Bewerken
                        </StateNavLink>
                    )}

                    {product.is_available && (
                        <Fragment>
                            {productAllowed || fundProvider.allow_products ? (
                                <Fragment>
                                    {productAllowed && !fundProvider.allow_products && (
                                        <a
                                            className="button button-default button-sm nowrap"
                                            onClick={(e) => {
                                                e?.preventDefault();
                                                disableProviderProduct(product);
                                            }}>
                                            <em className="mdi mdi-stop-circle-outline" />
                                            {translate('product.buttons.stop_product')}
                                        </a>
                                    )}
                                    {isProductConfigurable(fund) && (
                                        <a
                                            className="button button-primary button-sm nowrap"
                                            onClick={(e) => {
                                                e?.preventDefault();
                                                editProduct(fund, fundProvider, product).then(setFundProvider);
                                            }}>
                                            <em className="mdi mdi-cog-outline" />
                                            {translate('product.buttons.edit_product')}
                                        </a>
                                    )}
                                </Fragment>
                            ) : (
                                <button
                                    className="button button-primary button-sm nowrap"
                                    disabled={product.expired}
                                    onClick={() => editProduct(fund, fundProvider, product).then(setFundProvider)}>
                                    <em className="mdi mdi-play" />
                                    {translate('product.buttons.approve_product')}
                                </button>
                            )}
                        </Fragment>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title">Toon geschiedenis</div>
                </div>
                <LoaderTableCard
                    empty={dealsHistory.length === 0}
                    emptyTitle={'Toon geschiedenis'}
                    emptyDescription={'Er zijn momenteel geen beperkingen op het aanbod ingesteld.'}
                    columns={fundService.getProviderProductColumns(fund, product, true)}>
                    {dealsHistory.map((item) => (
                        <tr key={item.id}>
                            <td>{item.voucher_transactions_count}</td>
                            <td>{item.product_reservations_pending_count}</td>
                            <td>{product.price_locale}</td>
                            <FundProviderProductRowData
                                deal={item}
                                product={product}
                                history={true}
                                fund={fund}
                                organization={activeOrganization}
                                fundProvider={fundProvider}
                                onChange={fetchProduct}
                                onChangeProvider={setFundProvider}
                            />
                        </tr>
                    ))}
                </LoaderTableCard>
            </div>
        </Fragment>
    );
}
