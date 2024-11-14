import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useTranslate from '../../../hooks/useTranslate';
import useSetProgress from '../../../hooks/useSetProgress';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useAssetUrl from '../../../hooks/useAssetUrl';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { useParams } from 'react-router-dom';
import SponsorProduct from '../../../props/models/Sponsor/SponsorProduct';
import useProductService from '../../../services/ProductService';
import TableDateTime from '../../elements/tables/elements/TableDateTime';

export default function SponsorProductLogs() {
    const { id } = useParams();
    const activeOrganization = useActiveOrganization();

    const assetUrl = useAssetUrl();
    const setProgress = useSetProgress();
    const translate = useTranslate();

    const productService = useProductService();

    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState<SponsorProduct>(null);

    const fetchProduct = useCallback(() => {
        setProgress(0);
        setLoading(true);

        productService
            .sponsorProduct(activeOrganization.id, parseInt(id))
            .then((res) => setProduct(res.data.data))
            .finally(() => {
                setLoading(false);
                setProgress(100);
            });
    }, [activeOrganization.id, productService, id, setProgress]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    if (!product) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'products'}
                    params={{ organizationId: activeOrganization.id }}
                    query={{ view: 'history' }}
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
                            Bekijk aanbieder
                        </StateNavLink>
                    </div>

                    <div className="card-block card-block-provider">
                        <div className="provider-img">
                            <img
                                src={
                                    product?.photo?.sizes?.thumbnail ||
                                    assetUrl('/assets/img/placeholders/product-thumbnail.png')
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
                            {translate('sponsor_products.labels.logs')} ({product.monitored_history?.length})
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

                {!loading && product?.monitored_history?.length > 0 && (
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
                                        {product?.monitored_history?.map((item, id) => (
                                            <tr key={id}>
                                                <td>{product.organization.name}</td>
                                                <td title={product.funds.map((fund) => fund.name)?.join(', ')}>
                                                    <div className={'text-primary text-medium'}>
                                                        {product.funds.length}
                                                    </div>
                                                </td>
                                                <td>
                                                    <TableDateTime value={item.created_at_locale} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && product?.monitored_history.length == 0 && (
                    <div className="card-section text-center">
                        <div className="card-subtitle">Er zijn geen aanbiedingen gevonden voor de zoekopdracht.</div>
                    </div>
                )}
            </div>
        </Fragment>
    );
}
