import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import { useParams } from 'react-router';
import Implementation from '../../../props/models/Implementation';
import { useNavigateState } from '../../../modules/state_router/Router';
import usePushApiError from '../../../hooks/usePushApiError';
import Label from '../../elements/image_cropper/Label';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function ImplementationsCookies() {
    const { id } = useParams();

    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();

    const implementationService = useImplementationService();

    const [implementation, setImplementation] = useState<Implementation>(null);

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => setImplementation(res.data.data))
            .catch((err: ResponseError) => {
                if (err.status === 403) {
                    return navigateState(DashboardRoutes.IMPLEMENTATIONS, { organizationId: activeOrganization.id });
                }

                pushApiError(err);
            });
    }, [activeOrganization.id, id, implementationService, navigateState, pushApiError]);

    useEffect(() => {
        fetchImplementation();
    }, [fetchImplementation]);

    if (!implementation) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={DashboardRoutes.IMPLEMENTATIONS}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    Webshops
                </StateNavLink>
                <StateNavLink
                    name={DashboardRoutes.IMPLEMENTATION}
                    params={{ organizationId: activeOrganization.id, id: implementation.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {implementation.name}
                </StateNavLink>
                <div className="breadcrumb-item active">Cookiemelding</div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex flex-grow card-title">Cookiemelding</div>
                    <Label type="success">Actief</Label>
                </div>

                <div className="card-section">
                    <div className="card-block card-block-keyvalue">
                        <div className="keyvalue-item">
                            <div className="keyvalue-key">Local storage</div>
                            <div className="keyvalue-value">
                                <div className={`block block-info-box block-info-box-primary`}>
                                    <div className="info-box-icon mdi mdi-information" />
                                    <div className="info-box-content">
                                        Deze website gebruikt local storage om ervoor te zorgen dat de website goed
                                        functioneert en dat gebruikers ingelogd blijven. Aangezien local storage
                                        essentieel is voor de werking van de website, staat deze standaard ingeschakeld.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-section">
                    <div className="card-block card-block-keyvalue">
                        <div className="keyvalue-item">
                            <div className="keyvalue-key">Analytische cookies</div>
                            <div className="keyvalue-value">
                                <div className={`block block-info-box block-info-box-primary`}>
                                    <div className="info-box-icon mdi mdi-information" />
                                    <div className="info-box-content">
                                        Wanneer een website tools inzet om statistieken te verzamelen, is het
                                        noodzakelijk om toestemming te vragen voor het gebruik van analytische cookies.
                                        Het gebruik van deze cookies is optioneel voor de gebruikers.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-footer">
                    <div className="button-group flex-center">
                        <StateNavLink
                            name={DashboardRoutes.IMPLEMENTATION}
                            params={{ id: implementation.id, organizationId: activeOrganization.id }}
                            className="button button-default">
                            Ga terug
                        </StateNavLink>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
