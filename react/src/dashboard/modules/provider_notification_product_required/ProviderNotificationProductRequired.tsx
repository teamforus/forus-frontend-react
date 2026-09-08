import React, { useEffect, useState } from 'react';
import ModalFundsProviderProductsRequired from '../../components/modals/ModalFundsProviderProductsRequired';
import useStorageService from '../storage/useStrorrageService';
import useOpenModal from '../../hooks/useOpenModal';
import { useStateRoutes } from '../state_router/Router';
import useActiveOrganization from '../../hooks/useActiveOrganization';
import Fund from '../../props/models/Fund';
import useProviderFundService from '../../services/ProviderFundService';

export default function ProviderNotificationProductRequired() {
    const { route } = useStateRoutes();
    const storage = useStorageService();
    const openModal = useOpenModal();
    const activeOrganization = useActiveOrganization();

    const providerFundService = useProviderFundService();

    const [providerWarningModalCanOpen, setProviderWarningModalCanOpen] = useState(false);
    const [funds, setFunds] = useState<Array<Fund>>(null);

    useEffect(() => {
        if (providerWarningModalCanOpen && activeOrganization?.id) {
            providerFundService.listFundsProviderProductsRequired(activeOrganization.id).then((res) => {
                if (res.data.data.length > 0) {
                    openModal((modal) => <ModalFundsProviderProductsRequired modal={modal} funds={res.data.data} />);
                }

                setFunds(res.data.data);
            });
        }
    }, [activeOrganization?.id, providerFundService, openModal, providerWarningModalCanOpen]);

    useEffect(() => {
        const canShowOnPage = route?.state?.name !== 'provider-overview';
        const modalWasClosed = storage.getCollectionWithExpiry('funds_provider_products_required');

        if (activeOrganization && canShowOnPage && !modalWasClosed && !funds) {
            setProviderWarningModalCanOpen(true);
        }
    }, [route.pathname, route?.state?.name, activeOrganization, storage, funds]);

    return null;
}
