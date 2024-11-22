import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useParams } from 'react-router-dom';
import SponsorProduct, { DealHistory } from '../../../props/models/Sponsor/SponsorProduct';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { ResponseError } from '../../../props/ApiResponses';
import { useNavigateState } from '../../../modules/state_router/Router';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import { currencyFormat, strLimit } from '../../../helpers/string';
import Tooltip from '../../elements/tooltip/Tooltip';
import useSetProgress from '../../../hooks/useSetProgress';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import FundProvider from '../../../props/models/FundProvider';
import { NumberParam, useQueryParam } from 'use-query-params';
import FundProviderProductEditor from '../fund-provider-product-view/elements/FundProviderProductEditor';
import useTranslate from '../../../hooks/useTranslate';

export default function FundProviderProductSubsidyEdit() {
    const { id, fundId, fundProviderId } = useParams();
    const activeOrganization = useActiveOrganization();

    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const fundService = useFundService();

    const [deal, setDeal] = useState<DealHistory>(null);
    const [values, setValues] = useState(null);
    const [readOnly, setReadOnly] = useState(false);
    const [fund, setFund] = useState<Fund>(null);
    const [product, setProduct] = useState<SponsorProduct>(null);
    const [fundProvider, setFundProvider] = useState<FundProvider>(null);

    const [dealId] = useQueryParam('deal_id', NumberParam);

    const fetchProduct = useCallback(() => {
        setProgress(0);

        fundService
            .getProviderProduct(activeOrganization.id, parseInt(fundId), parseInt(fundProviderId), parseInt(id))
            .then((res) => setProduct(res.data.data))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
            .finally(() => setProgress(100));
    }, [fundService, activeOrganization.id, fundId, fundProviderId, id, pushDanger, setProgress]);

    const onCancel = useCallback(() => {
        navigateState('fund-provider-product', {
            id: product.id,
            fundId: fund.id,
            fundProviderId: fundProvider.id,
            organizationId: activeOrganization.id,
        });
    }, [navigateState, activeOrganization.id, fund?.id, fundProvider?.id, product?.id]);

    const onUpdate = useCallback(
        (fundProvider: FundProvider) => {
            pushSuccess('Het aanbod is goedgekeurd.');

            navigateState('fund-provider-product', {
                id: product.id,
                fundId: fund.id,
                fundProviderId: fundProvider.id,
                organizationId: activeOrganization.id,
            });
        },
        [activeOrganization.id, fund?.id, navigateState, product?.id, pushSuccess],
    );

    const fetchFundProvider = useCallback(() => {
        setProgress(0);

        fundService
            .readProvider(activeOrganization.id, parseInt(fundId), parseInt(fundProviderId))
            .then((res) => setFundProvider(res.data.data))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization.id, fundId, fundProviderId, pushDanger]);

    const fetchFund = useCallback(() => {
        setProgress(0);

        fundService
            .readPublic(parseInt(fundId))
            .then((res) => setFund(res.data.data))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data?.message))
            .finally(() => setProgress(100));
    }, [fundId, fundService, pushDanger, setProgress]);

    useEffect(() => {
        fetchFund();
    }, [fetchFund]);

    useEffect(() => {
        fetchFundProvider();
    }, [fetchFundProvider]);

    useEffect(() => {
        if (fundProvider) {
            fetchProduct();
        }
    }, [fetchProduct, fundProvider]);

    useEffect(() => {
        if (product && fund) {
            const deal = product.deals_history.find((deal) => (dealId ? deal.id == dealId : deal.active)) || null;

            if ((dealId && !deal) || fund.type !== 'subsidies') {
                return navigateState('fund-provider', {
                    id: fundProvider.id,
                    fundId: fund.id,
                    organizationId: activeOrganization.id,
                });
            }

            setDeal(deal);
            setReadOnly(!!dealId || fundProvider.products.includes(product.id));
        }
    }, [activeOrganization.id, dealId, fund, fundProvider?.id, fundProvider?.products, navigateState, product]);

    if (!product || !fund || !fundProvider) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'sponsor-provider-organizations'}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {translate('page_state_titles.organization-providers')}
                </StateNavLink>
                <StateNavLink
                    name={'sponsor-provider-organization'}
                    params={{ organizationId: activeOrganization.id, id: fundProvider.organization.id }}
                    className="breadcrumb-item">
                    {strLimit(fundProvider.organization.name, 40)}
                </StateNavLink>
                <StateNavLink
                    name={'fund-provider'}
                    params={{ organizationId: activeOrganization.id, id: fundProvider.id, fundId: fund.id }}
                    className="breadcrumb-item"
                    activeExact={true}>
                    {strLimit(fundProvider.fund.name, 40)}
                </StateNavLink>
                <StateNavLink
                    name={'fund-provider-product'}
                    params={{
                        id: product.id,
                        fundId: fund.id,
                        fundProviderId: fundProvider.id,
                        organizationId: activeOrganization.id,
                    }}
                    className="breadcrumb-item"
                    activeExact={true}>
                    {strLimit(product.name, 40)}
                </StateNavLink>
                <div className="breadcrumb-item active">Subsidie starten</div>
            </div>

            <div className="block block-subsidy-product-overview">
                <div className="subsidy-product-media">
                    {product.photo?.sizes?.small ? (
                        <div
                            className="subsidy-media"
                            style={{ backgroundImage: 'url(' + product.photo.sizes.small + ')' }}
                        />
                    ) : (
                        <div
                            className="subsidy-media"
                            style={{ backgroundImage: 'url(./assets/img/placeholders/product-thumbnail.png)' }}
                        />
                    )}
                </div>
                <div className="subsidy-product-content">
                    <div className="subsidy-product-overview">
                        <div className="subsidy-title">Organisatie</div>
                        <div className="subsidy-provider">{product.organization.name}</div>
                        <div className="subsidy-title">{product.name}</div>
                        <div className="subsidy-properties">
                            <div className="subsidy-property">
                                <div className="subsidy-property-label">Vervaldatum van aanbod:</div>
                                <div className="subsidy-property-value">
                                    {product.expire_at ? product.expire_at_locale : 'Onbeperkt'}
                                </div>
                            </div>
                            <div className="subsidy-property">
                                <div className="subsidy-property-label">Beschikbaar:</div>
                                <div className="subsidy-property-value">
                                    {product.unlimited_stock ? 'Ongelimiteerd' : product.stock_amount}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="subsidy-product-overview text-right">
                        <div className="subsidy-title">Transactie details</div>
                        {(product.price_type === 'free' || product.price_type === 'regular') && (
                            <div className="subsidy-property subsidy-property-monetary">
                                <div className="subsidy-property-label">Totaalprijs</div>
                                <div className="subsidy-property-value text-left">{product.price_locale}</div>
                            </div>
                        )}

                        {(product.price_type === 'discount_fixed' || product.price_type === 'discount_percentage') && (
                            <div className="subsidy-property subsidy-property-monetary">
                                <div className="subsidy-property-label">Korting</div>
                                {product.price_type === 'discount_fixed' && (
                                    <div className="subsidy-property-value text-left">
                                        {currencyFormat(parseFloat(product.price_discount))}
                                    </div>
                                )}

                                {product.price_type === 'discount_percentage' && (
                                    <div className="subsidy-property-value text-left">
                                        {product.price_discount + '%'}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="subsidy-property subsidy-property-monetary">
                            <div className="subsidy-property-label">{fund.organization.name + ' betaalt'}</div>
                            <div className="subsidy-property-value text-left">
                                {currencyFormat(
                                    parseFloat(values?.gratis ? product.price : values?.amount || deal?.amount || 0),
                                )}
                            </div>
                        </div>

                        {product.price_type === 'regular' && (
                            <div className="subsidy-property subsidy-property-monetary">
                                <div className="subsidy-property-label">Prijs voor de klant</div>
                                <div className="subsidy-property-value text-left">
                                    {currencyFormat(
                                        Math.max(
                                            0,
                                            values?.gratis
                                                ? 0
                                                : parseFloat(product.price) -
                                                      parseFloat(values?.amount || deal?.amount || 0),
                                        ),
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {readOnly ? (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Subsidie starten</div>
                    </div>
                    <div className="card-section card-section-primary form">
                        <div className="row">
                            <div className="col col-lg-4 col-xs-12">
                                <div className="subsidy-form-content">
                                    <div className="form">
                                        <div className="form-group form-group-inline">
                                            <div className="form-label">
                                                Totaal aantal
                                                <Tooltip
                                                    text={`Totaal aantal aanbiedingen dat vanuit ${fund.name} gebruikt mag worden.`}
                                                />
                                            </div>
                                            <div className="form-offset">
                                                <div className="col col-lg-12">
                                                    <div className="form-value-placeholder text-right">
                                                        {deal.limit_total_unlimited ? 'Onbeperkt' : deal.limit_total}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group form-group-inline">
                                            <div className="form-label">
                                                Limiet per aanvrager
                                                <Tooltip text="Hoevaak mag er per inwoner gebruik gemaakt worden van deze aanbieding." />
                                            </div>
                                            <div className="form-offset">
                                                <div className="col col-lg-12">
                                                    <div className="form-value-placeholder text-right">
                                                        {deal.limit_per_identity}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group form-group-inline">
                                            <div className="form-label">
                                                Bijdrage
                                                <Tooltip text="Volledige bijdrage vanuit de sponsor" />
                                            </div>
                                            <div className="form-offset">
                                                <div className="col col-lg-12">
                                                    <div className="form-value-placeholder text-right">
                                                        {currencyFormat(parseFloat(deal.amount))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group form-group-inline">
                                            <div className="form-label">
                                                Gebruikt
                                                <Tooltip text="Hoeveel tegoed (tot zijn limiet) heeft de aanvrager gebruikt." />
                                            </div>
                                            <div className="form-offset">
                                                <div className="col col-lg-12">
                                                    <div className="form-value-placeholder text-right">
                                                        {deal.voucher_transactions_count}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <FundProviderProductEditor
                    fundProvider={fundProvider}
                    product={product}
                    fund={fund}
                    deal={deal}
                    onCancel={() => onCancel()}
                    onUpdate={(data) => onUpdate(data)}
                    onValuesChange={(values) => setValues(values)}
                />
            )}
        </Fragment>
    );
}
