import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import usePushDanger from '../../../hooks/usePushDanger';
import { ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import { useNavigate, useParams } from 'react-router-dom';
import Implementation from '../../../props/models/Implementation';
import ImplementationsCmsPageForm from './elements/ImplementationsCmsPageForm';
import { StringParam, useQueryParams } from 'use-query-params';
import { getStateRouteUrl } from '../../../modules/state_router/Router';

export default function ImplementationsCmsPageCreate() {
    const { implementationId } = useParams();
    const [{ type }] = useQueryParams({ type: StringParam });

    const navigate = useNavigate();
    const pushDanger = usePushDanger();
    const activeOrganization = useActiveOrganization();

    const implementationService = useImplementationService();

    const [implementation, setImplementation] = useState<Implementation>(null);

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(implementationId))
            .then((res) => {
                if (res.data.data.pages.find((page) => page.page_type === type)) {
                    return navigate(
                        getStateRouteUrl('implementations-cms', {
                            organizationId: activeOrganization.id,
                            id: res.data.data.id,
                        }),
                    );
                }

                setImplementation(res.data.data);
            })
            .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message));
    }, [implementationService, activeOrganization.id, implementationId, type, navigate, pushDanger]);

    useEffect(() => fetchImplementation(), [fetchImplementation]);

    if (!implementation || !type) {
        return <LoadingCard />;
    }

    return <ImplementationsCmsPageForm implementation={implementation} page_type={type} />;
}
