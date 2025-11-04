import React, { useCallback, useEffect, useRef, useState, MouseEvent } from 'react';
import { PaginationData } from '../../../../props/ApiResponses';
import FundProvider from '../../../../props/models/FundProvider';
import Organization from '../../../../props/models/Organization';
import Paginator from '../../../../modules/paginator/components/Paginator';
import useSetProgress from '../../../../hooks/useSetProgress';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import { useFundService } from '../../../../services/FundService';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import EmptyCard from '../../../elements/empty-card/EmptyCard';
import SponsorProduct, { DealHistoryItem } from '../../../../props/models/Sponsor/SponsorProduct';
import usePushApiError from '../../../../hooks/usePushApiError';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import Fund from '../../../../props/models/Fund';
import useProductChat from '../hooks/useProductChat';
import FundProviderProductRowData from './FundProviderProductRowData';
import useUpdateProduct from '../hooks/useUpdateProduct';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';

type ProductLocal = SponsorProduct & {
    allowed?: boolean;
    active_deal?: DealHistoryItem;
};

export default function FundProviderProducts({
    fundProvider,
    organization,
    onChangeProvider,
    source,
    fund,
}: {
    fundProvider: FundProvider;
    organization: Organization;
    onChangeProvider: (data: FundProvider) => void;
    source: 'sponsor' | 'provider';
    fund: Fund;
}) {
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const { mapProduct } = useUpdateProduct();
    const { openProductChat, makeProductChat } = useProductChat(fund, fundProvider, organization);

    const [products, setProducts] = useState<PaginationData<ProductLocal>>(null);

    const tableRef = useRef<HTMLTableElement>(null);
    const fundService = useFundService();

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{
        q: string;
        type?: 'sponsor' | 'provider';
        per_page?: number;
    }>({
        q: '',
        type: source,
        per_page: 15,
    });

    const { headElement, configsElement } = useConfigurableTable(
        fundService.getProviderProductColumns(fund, null, false),
    );

    const fetchProducts = useCallback(() => {
        setProgress(0);

        fundService
            .listProviderProducts(
                fundProvider.fund.organization_id,
                fundProvider.fund.id,
                fundProvider.id,
                filterValuesActive,
            )
            .then((res) =>
                setProducts({
                    ...res.data,
                    data: res.data.data.map((product) => mapProduct(fundProvider, product)),
                }),
            )
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [setProgress, fundService, fundProvider, filterValuesActive, mapProduct, pushApiError]);

    const onStartChat = useCallback(
        (e: MouseEvent<HTMLAnchorElement>, product: SponsorProduct) => {
            e?.preventDefault();
            e?.stopPropagation();

            const onChange = () => {
                return fetchProducts();
            };

            if (!product.fund_provider_product_chat) {
                makeProductChat(product, onChange);
            } else {
                openProductChat(product.fund_provider_product_chat, onChange);
            }
        },
        [fetchProducts, makeProductChat, openProductChat],
    );

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts, source]);

    if (!products) {
        return <LoadingCard />;
    }

    return (
        <div className="card form">
            <div className="card-header">
                <div className="flex flex-grow card-title">Aanbod in beheer van {fundProvider.organization.name}</div>

                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        {source === 'sponsor' && (
                            <StateNavLink
                                name={DashboardRoutes.FUND_PROVIDER_PRODUCT_CREATE}
                                params={{
                                    fundId: fundProvider.fund_id,
                                    fundProviderId: fundProvider.id,
                                    organizationId: organization.id,
                                }}
                                className="button button-primary">
                                <em className="mdi mdi-plus-circle icon-start" />
                                Voeg een aanbod toe
                            </StateNavLink>
                        )}

                        <div className="form-group">
                            <input
                                className="form-control"
                                value={filterValues.q || ''}
                                onChange={(e) => filterUpdate({ q: e.target.value })}
                                placeholder="Zoeken"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {fundProvider.allow_products && products.meta.total > 0 && (
                <div className="card-section card-section-success card-section-narrow">
                    <em>
                        Een aanbod kan niet worden uitgeschakeld zolang de optie &apos;Accepteer aanbiedingen&apos; aan
                        staat. Zet deze optie eerst uit om het aanbod apart te kunnen beoordelen. Als de optie is
                        ingeschakeld, worden alle aanbiedingen automatisch goedgekeurd zonder limieten.
                    </em>
                </div>
            )}

            {products.meta.total > 0 ? (
                <div className="card-section card-section-padless">
                    {configsElement}

                    <TableTopScroller onScroll={() => tableRef.current?.click()}>
                        <table className="table">
                            {headElement}

                            <tbody>
                                {products.data.map((product) => (
                                    <StateNavLink
                                        customElement={'tr'}
                                        name={DashboardRoutes.FUND_PROVIDER_PRODUCT}
                                        className={'tr-clickable'}
                                        params={{
                                            id: product.id,
                                            fundId: fundProvider.fund_id,
                                            fundProviderId: fundProvider.id,
                                            organizationId: organization.id,
                                        }}
                                        key={product.id}>
                                        <FundProviderProductRowData
                                            deal={product?.active_deal}
                                            product={product}
                                            onStartChat={onStartChat}
                                            fund={fund}
                                            organization={organization}
                                            fundProvider={fundProvider}
                                            onChange={fetchProducts}
                                            onChangeProvider={onChangeProvider}
                                            history={false}
                                        />
                                    </StateNavLink>
                                ))}
                            </tbody>
                        </table>
                    </TableTopScroller>
                </div>
            ) : (
                <EmptyCard title={'Geen aanbiedingen'} type={'card-section'} />
            )}

            {products.meta && (
                <div className="card-section card-section-narrow" hidden={products?.meta?.total < 1}>
                    <Paginator meta={products.meta} filters={filterValues} updateFilters={filterUpdate} />
                </div>
            )}
        </div>
    );
}
