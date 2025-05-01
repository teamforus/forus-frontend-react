import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useParams } from 'react-router';
import useSetProgress from '../../../hooks/useSetProgress';
import { useFundService } from '../../../services/FundService';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import ProductsForm from '../products-edit/elements/ProductsForm';
import usePushApiError from '../../../hooks/usePushApiError';

export default function SponsorProductsEdit() {
    const { id, fundId, fundProviderId } = useParams();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const [fundProvider, setFundProvider] = useState(null);

    const fetchFundProvider = useCallback(() => {
        setProgress(0);

        fundService
            .readProvider(activeOrganization.id, parseInt(fundId), parseInt(fundProviderId))
            .then((res) => setFundProvider(res.data.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization.id, fundId, fundProviderId, pushApiError]);

    useEffect(() => {
        fetchFundProvider();
    }, [fetchFundProvider]);

    if (!fundProvider) {
        return <LoadingCard />;
    }

    return <ProductsForm organization={activeOrganization} fundProvider={fundProvider} id={id ? parseInt(id) : null} />;
}
