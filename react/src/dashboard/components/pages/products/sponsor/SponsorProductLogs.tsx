import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import { PaginationData } from '../../../../props/ApiResponses';
import useSetProgress from '../../../../hooks/useSetProgress';
import useProductService from '../../../../services/ProductService';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import Product from '../../../../props/models/Product';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import { useFundService } from '../../../../services/FundService';
import FundProviderProduct from '../../../../props/models/FundProviderProduct';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { useParams } from 'react-router-dom';

export default function SponsorProductLogs() {
    const { id, fundId, fundProviderId } = useParams();
    const activeOrganization = useActiveOrganization();

    const assetUrl = useAssetUrl();
    const setProgress = useSetProgress();
    const translate = useTranslate();

    const fundService = useFundService();
    const productService = useProductService();

    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState<Product>(null);
    const [fundProviderProducts, setFundProviderProducts] = useState<PaginationData<FundProviderProduct>>(null);

    const fetchLogs = useCallback(() => {
        setProgress(0);
        setLoading(true);

        productService
            .sponsorFundProviderDigestProducts(activeOrganization.id, {
                product_id: id,
            })
            .then((res) => setFundProviderProducts(res.data))
            .finally(() => {
                setLoading(false);
                setProgress(100);
            });
    }, [activeOrganization.id, id, productService, setProgress]);

    const fetchProduct = useCallback(() => {
        setProgress(0);
        setLoading(true);

        fundService
            .getProviderProduct(activeOrganization.id, parseInt(fundId), parseInt(fundProviderId), parseInt(id))
            .then((res) => setProduct(res.data.data))
            .finally(() => {
                setLoading(false);
                setProgress(100);
            });
    }, [activeOrganization.id, fundId, fundProviderId, fundService, id, setProgress]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    if (!product || !fundProviderProducts) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'sponsor-products'}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    Aanbod
                </StateNavLink>
                <div className="breadcrumb-item active">Geschiedenis van wijzigingen</div>
            </div>

            <div className="card">
                <div className="card-section">
                    <div className="card-section-actions">
                        <StateNavLink
                            className="button button-default"
                            name={'sponsor-provider-organization'}
                            params={{
                                organizationId: activeOrganization.id,
                                id: product.organization_id,
                            }}>
                            <em className="mdi mdi-open-in-new icon-start" />
                            Bekijk
                        </StateNavLink>
                    </div>

                    <div className="card-block card-block-provider">
                        <div className="provider-img">
                            <img
                                src={
                                    product?.photo?.sizes?.small ||
                                    assetUrl('/assets/img/placeholders/product-small.png')
                                }
                                alt={product?.name}
                            />
                        </div>
                        <div className="provider-details">
                            <div className="provider-title">{product?.name}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header card-header-next">
                    <div className="flex flex-grow">
                        <div className="card-title">
                            {translate('sponsor_products.labels.logs')} ({fundProviderProducts?.meta?.total})
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="card-section">
                        <div className="card-loading">
                            <div className="mdi mdi-loading mdi-spin" />
                        </div>
                    </div>
                )}

                {!loading && fundProviderProducts?.meta?.total > 0 && (
                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th className={'nowrap'}>
                                                {translate('sponsor_products.labels.provider_name')}
                                            </th>

                                            <th className={'nowrap'}>{translate('sponsor_products.labels.fund')}</th>

                                            <th>{translate('sponsor_products.labels.last_updated')}</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {fundProviderProducts?.data?.map((productLog, id) => (
                                            <tr key={id}>
                                                <td>{productLog.organization.name}</td>
                                                <td>{productLog.fund.name}</td>
                                                <td>
                                                    <div className="text-medium text-primary">
                                                        {productLog.updated_at_locale?.split(' - ')[0]}
                                                    </div>

                                                    <div className="text-strong text-md text-muted-dark">
                                                        {productLog.updated_at_locale?.split(' - ')[1]}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && fundProviderProducts?.meta?.total == 0 && (
                    <div className="card-section text-center">
                        <div className="card-subtitle">Er zijn geen aanbiedingen gevonden voor de zoekopdracht.</div>
                    </div>
                )}
            </div>
        </Fragment>
    );
}
