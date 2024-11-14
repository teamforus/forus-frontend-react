import React from 'react';
import useEnvData from '../../../hooks/useEnvData';
import ProviderProducts from './ProviderProducts';
import SponsorProducts from './SponsorProducts';

export default function Products() {
    const envData = useEnvData();

    return envData.client_type === 'sponsor' ? <SponsorProducts /> : <ProviderProducts />;
}
