import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useSetProgress from '../../../hooks/useSetProgress';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { useParams } from 'react-router-dom';
import useProductService from '../../../services/ProductService';
import ProductDetailsBlock from '../products-view/elements/ProductDetailsBlock';
import SponsorProduct from '../../../props/models/Sponsor/SponsorProduct';
import ProductMonitoredHistoryCard from './elements/ProductMonitoredHistoryCard';
import ProductMonitoredHistoryCardFunds from './elements/ProductMonitoredHistoryCardFunds';

export default function SponsorProductView() {
    const { productId } = useParams();

    const setProgress = useSetProgress();

    const productService = useProductService();
    const activeOrganization = useActiveOrganization();

    const [product, setProduct] = useState<SponsorProduct>(null);

    const fetchProduct = useCallback(() => {
        setProgress(0);

        productService
            .sponsorProduct(activeOrganization.id, parseInt(productId))
            .then((res) => setProduct(res.data.data))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, productService, productId, setProgress]);

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
                    name={'sponsor-products'}
                    params={{ organizationId: activeOrganization.id }}
                    query={{ view: 'history' }}
                    activeExact={true}
                    className="breadcrumb-item">
                    Aanbod
                </StateNavLink>
                <div className="breadcrumb-item active">{product.name}</div>
            </div>

            <div className="card">
                <div className="card-section">
                    <ProductDetailsBlock product={product} viewType={'sponsor'} showStockAndReservations={false} />
                </div>
            </div>

            <ProductMonitoredHistoryCardFunds type={'card'} product={product} activeOrganization={activeOrganization} />
            <ProductMonitoredHistoryCard product={product} />
        </Fragment>
    );
}
