import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import { useParams } from 'react-router';
import Implementation from '../../../props/models/Implementation';
import { getStateRouteUrl, useNavigateState } from '../../../modules/state_router/Router';
import usePushApiError from '../../../hooks/usePushApiError';
import Label from '../../elements/image_cropper/Label';
import ImplementationsRootBreadcrumbs from '../implementations/elements/ImplementationsRootBreadcrumbs';
import FormPaneContainer from '../../elements/forms/elements/FormPaneContainer';
import FormPane from '../../elements/forms/elements/FormPane';
import useTranslate from '../../../hooks/useTranslate';
import InfoBox from '../../elements/info-box/InfoBox';

export default function ImplementationCookies() {
    const { id } = useParams();

    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();
    const translate = useTranslate();

    const implementationService = useImplementationService();

    const [implementation, setImplementation] = useState<Implementation>(null);

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => setImplementation(res.data.data))
            .catch((err: ResponseError) => {
                if (err.status === 403) {
                    return navigateState(
                        getStateRouteUrl('implementations', { organizationId: activeOrganization.id }),
                    );
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
                <ImplementationsRootBreadcrumbs implementation={implementation} />
                <div className="breadcrumb-item active">Cookiemelding</div>
            </div>

            <div className="card form">
                <div className="card-header">
                    <div className="card-title flex flex-grow">Cookiemelding</div>
                    <div className="card-header-filters">
                        <Label type="success">Actief</Label>
                    </div>
                </div>

                <FormPaneContainer className="card-section">
                    <FormPane title={'Functionele opslag'}>
                        <InfoBox>
                            Deze website gebruikt local storage om ervoor te zorgen dat de website goed functioneert en
                            dat gebruikers ingelogd blijven. Aangezien local storage essentieel is voor de werking van
                            de website, staat deze standaard ingeschakeld.
                        </InfoBox>
                    </FormPane>

                    <FormPane title={'Analytische cookies'}>
                        <InfoBox>
                            Wanneer een website tools inzet om statistieken te verzamelen, is het noodzakelijk om
                            toestemming te vragen voor het gebruik van analytische cookies. Het gebruik van deze cookies
                            is optioneel voor gebruikers.
                        </InfoBox>
                    </FormPane>
                </FormPaneContainer>

                <div className="card-footer card-footer-primary">
                    <div className="button-group flex-center">
                        <StateNavLink
                            name={'implementation-view'}
                            params={{ id: implementation.id, organizationId: activeOrganization.id }}
                            className="button button-default">
                            {translate('funds_edit.buttons.cancel')}
                        </StateNavLink>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
