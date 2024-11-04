import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import { PaginationData } from '../../../../props/ApiResponses';
import useSetProgress from '../../../../hooks/useSetProgress';
import useProductService from '../../../../services/ProductService';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import Product from '../../../../props/models/Product';
import { useParams } from 'react-router-dom';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import { useFundService } from '../../../../services/FundService';

export default function SponsorProductLogs() {
    const { id, fundId, fundProviderId } = useParams();
    const activeOrganization = useActiveOrganization();

    const translate = useTranslate();
    const setProgress = useSetProgress();

    const productService = useProductService();
    const fundService = useFundService();

    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState<Product>(null);
    const [logs, setProductLogs] = useState<PaginationData<Product>>(null);

    const fetchLogs = useCallback(() => {
        setProgress(0);
        setLoading(true);

        productService
            .sponsorDigestLogs(activeOrganization.id, {
                product_id: id,
            })
            .then((res) => setProductLogs(res.data))
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

    if (!product || !logs) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="card">
                <div className="card-header">
                    <div className="photo">{product?.name}</div>
                </div>
            </div>

            <div className="card">
                <div className="card-header card-header-next">
                    <div className="flex flex-grow">
                        <div className="flex-col">
                            <div className="card-title">
                                {translate('products.offers')} ({logs?.meta?.total})
                            </div>
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

                {!loading && logs?.meta?.total > 0 && (
                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th className={'nowrap'}>{translate('sponsor_products.labels.name')}</th>

                                            <th className={'nowrap'}>
                                                {translate('sponsor_products.labels.provider_name')}
                                            </th>

                                            <th>{translate('sponsor_products.labels.last_updated')}</th>

                                            <th>{translate('sponsor_products.labels.nr_changes')}</th>

                                            <th className="text-right nowrap th-narrow" />
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {logs?.data?.map((productLog, id) => (
                                            <tr key={id}>
                                                <td>{productLog.organization.name}</td>
                                                <td>
                                                    <div className="text-medium text-primary">
                                                        {product.updated_at_locale?.split(' - ')[0]}
                                                    </div>

                                                    <div className="text-strong text-md text-muted-dark">
                                                        {product.updated_at_locale?.split(' - ')[1]}
                                                    </div>
                                                </td>
                                                <td>{productLog.digest_logs_count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && logs?.meta?.total == 0 && (
                    <div className="card-section text-center">
                        <div className="card-subtitle">Er zijn geen aanbiedingen gevonden voor de zoekopdracht.</div>
                    </div>
                )}
            </div>
        </Fragment>
    );
}
