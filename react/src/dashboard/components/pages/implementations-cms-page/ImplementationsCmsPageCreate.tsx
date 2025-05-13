import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useImplementationService from '../../../services/ImplementationService';
import Implementation from '../../../props/models/Implementation';
import ImplementationsCmsPageForm from './elements/ImplementationsCmsPageForm';
import { StringParam, useQueryParam } from 'use-query-params';
import { useNavigateState } from '../../../modules/state_router/Router';
import { useParams } from 'react-router';
import usePushApiError from '../../../hooks/usePushApiError';

export default function ImplementationsCmsPageCreate() {
    const { implementationId } = useParams();
    const [type] = useQueryParam('type', StringParam);
    const activeOrganization = useActiveOrganization();

    const navigateState = useNavigateState();
    const pushApiError = usePushApiError();

    const implementationService = useImplementationService();

    const [implementation, setImplementation] = useState<Implementation>(null);

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(implementationId))
            .then((res) => {
                if (res.data.data.pages.find((page) => page.page_type === type)) {
                    return navigateState('implementations-cms', {
                        id: res.data.data.id,
                        organizationId: activeOrganization.id,
                    });
                }

                setImplementation(res.data.data);
            })
            .catch(pushApiError);
    }, [implementationService, activeOrganization.id, implementationId, type, navigateState, pushApiError]);

    useEffect(() => {
        fetchImplementation();
    }, [fetchImplementation]);

    if (!implementation || !type) {
        return <LoadingCard />;
    }

    return <ImplementationsCmsPageForm implementation={implementation} pageType={type} />;
}
