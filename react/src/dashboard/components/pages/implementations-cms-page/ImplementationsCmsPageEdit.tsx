import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import usePushDanger from '../../../hooks/usePushDanger';
import { ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import { useNavigate, useParams } from 'react-router-dom';
import Implementation from '../../../props/models/Implementation';
import ImplementationsCmsPageForm from './elements/ImplementationsCmsPageForm';
import ImplementationPage from '../../../props/models/ImplementationPage';
import useImplementationPageService from '../../../services/ImplementationPageService';
import { getStateRouteUrl } from '../../../modules/state_router/Router';

export default function ImplementationsCmsPageEdit() {
    const { implementationId, id } = useParams();

    const navigate = useNavigate();
    const pushDanger = usePushDanger();
    const activeOrganization = useActiveOrganization();

    const implementationService = useImplementationService();
    const implementationPageService = useImplementationPageService();

    const [page, setPage] = useState<ImplementationPage>(null);
    const [implementation, setImplementation] = useState<Implementation>(null);

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(implementationId))
            .then((res) => setImplementation(res.data.data))
            .catch((res: ResponseError) => {
                if (res.status === 403) {
                    return navigate(getStateRouteUrl('implementations', { organizationId: activeOrganization.id }));
                }

                pushDanger('Mislukt!', res.data.message);
            });
    }, [activeOrganization.id, implementationId, implementationService, navigate, pushDanger]);

    const fetchPage = useCallback(
        (id) => {
            implementationPageService
                .read(activeOrganization.id, implementation.id, id)
                .then((res) => setPage(res.data.data))
                .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message));
        },
        [activeOrganization.id, implementation?.id, implementationPageService, pushDanger],
    );

    useEffect(() => fetchImplementation(), [fetchImplementation]);

    useEffect(() => {
        if (implementation) {
            fetchPage(id);
        }
    }, [id, fetchPage, implementation]);

    if (!implementation || !page) {
        return <LoadingCard />;
    }

    return <ImplementationsCmsPageForm implementation={implementation} page={page} page_type={page.page_type} />;
}
