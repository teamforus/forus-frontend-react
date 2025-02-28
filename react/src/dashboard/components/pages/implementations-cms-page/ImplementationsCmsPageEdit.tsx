import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import { useParams } from 'react-router-dom';
import Implementation from '../../../props/models/Implementation';
import ImplementationsCmsPageForm from './elements/ImplementationsCmsPageForm';
import ImplementationPage from '../../../props/models/ImplementationPage';
import useImplementationPageService from '../../../services/ImplementationPageService';
import { useNavigateState } from '../../../modules/state_router/Router';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushApiError from '../../../hooks/usePushApiError';

export default function ImplementationsCmsPageEdit() {
    const { implementationId, id } = useParams();

    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();

    const implementationService = useImplementationService();
    const implementationPageService = useImplementationPageService();

    const [page, setPage] = useState<ImplementationPage>(null);
    const [implementation, setImplementation] = useState<Implementation>(null);

    const fetchImplementation = useCallback(() => {
        setProgress(0);

        implementationService
            .read(activeOrganization.id, parseInt(implementationId))
            .then((res) => setImplementation(res.data.data))
            .catch((err: ResponseError) => {
                if (err.status === 403) {
                    return navigateState('implementations', { organizationId: activeOrganization.id });
                }

                pushApiError(err);
            })
            .finally(() => setProgress(100));
    }, [activeOrganization.id, implementationId, implementationService, navigateState, pushApiError, setProgress]);

    const fetchPage = useCallback(
        (id) => {
            setProgress(0);

            implementationPageService
                .read(activeOrganization.id, implementation.id, id)
                .then((res) => setPage(res.data.data))
                .catch(pushApiError)
                .finally(() => setProgress(100));
        },
        [activeOrganization.id, implementation?.id, implementationPageService, pushApiError, setProgress],
    );

    useEffect(() => {
        fetchImplementation();
    }, [fetchImplementation]);

    useEffect(() => {
        if (implementation) {
            fetchPage(id);
        }
    }, [id, fetchPage, implementation]);

    if (!implementation || !page) {
        return <LoadingCard />;
    }

    return <ImplementationsCmsPageForm implementation={implementation} page={page} pageType={page.page_type} />;
}
