import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useFormBuilder from '../../../hooks/useFormBuilder';
import usePushSuccess from '../../../hooks/usePushSuccess';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useSetProgress from '../../../hooks/useSetProgress';
import { ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import { useParams } from 'react-router';
import Implementation from '../../../props/models/Implementation';
import { getStateRouteUrl, useNavigateState } from '../../../modules/state_router/Router';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import InfoBox from '../../elements/info-box/InfoBox';
import ImplementationsRootBreadcrumbs from '../implementations/elements/ImplementationsRootBreadcrumbs';
import FormPaneContainer from '../../elements/forms/elements/FormPaneContainer';
import FormPane from '../../elements/forms/elements/FormPane';
import FormGroup from '../../elements/forms/elements/FormGroup';

export default function ImplementationEmail() {
    const { id } = useParams();

    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();

    const implementationService = useImplementationService();

    const [implementation, setImplementation] = useState<Implementation>(null);

    const form = useFormBuilder<{
        email_from_name: string;
        email_from_address: string;
    }>(null, (values) => {
        setProgress(0);

        implementationService
            .updateEmail(activeOrganization.id, implementation.id, values)
            .then((res) => {
                setImplementation(res.data.data);
                form.setErrors({});
                pushSuccess('Opgeslagen!');
            })
            .catch((err: ResponseError) => {
                form.setErrors(err.data.errors);
                pushApiError(err);
            })
            .finally(() => {
                setProgress(100);
                form.setIsLocked(false);
            });
    });

    const { update } = form;

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

    useEffect(() => {
        if (implementation) {
            update({
                email_from_name: implementation.email_from_name,
                email_from_address: implementation.email_from_address,
            });
        }
    }, [update, implementation]);

    if (!implementation) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <ImplementationsRootBreadcrumbs implementation={implementation} />
                <div className="breadcrumb-item active">Email instellingen</div>
            </div>

            <form className="form card" onSubmit={form.submit}>
                <div className="card-header">
                    <div className="card-title">Email instellingen</div>
                </div>

                <FormPaneContainer className="card-section">
                    <FormPane title={'Afzender'}>
                        <FormGroup
                            label={'Afzender emailadres'}
                            error={form.errors?.email_from_address}
                            input={(id) => (
                                <input
                                    id={id}
                                    type="text"
                                    className="form-control"
                                    placeholder="Afzender emailadres"
                                    value={form.values?.email_from_address || ''}
                                    onChange={(e) => form.update({ email_from_address: e.target.value })}
                                />
                            )}
                        />

                        <FormGroup
                            label={'Afzender naam'}
                            error={form.errors?.email_from_name}
                            input={(id) => (
                                <input
                                    id={id}
                                    type="text"
                                    className="form-control"
                                    placeholder="Afzender naam"
                                    value={form.values?.email_from_name || ''}
                                    onChange={(e) => form.update({ email_from_name: e.target.value })}
                                />
                            )}
                        />
                    </FormPane>

                    <InfoBox type="default">
                        Forus zal uw e-mailadres verifieren en uw systeembeheer vragen om Forus zijn mailservice als
                        veilige afzender toe te voegen aan uw domein.
                    </InfoBox>
                </FormPaneContainer>

                <div className="card-footer card-footer-primary">
                    <div className="button-group flex-center">
                        <StateNavLink
                            name={'implementation-view'}
                            params={{ id: implementation.id, organizationId: activeOrganization.id }}
                            className="button button-default">
                            {translate('funds_edit.buttons.cancel')}
                        </StateNavLink>
                        <button className="button button-primary" type="submit">
                            {translate('funds_edit.buttons.confirm')}
                        </button>
                    </div>
                </div>
            </form>
        </Fragment>
    );
}
