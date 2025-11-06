import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import { useParams } from 'react-router';
import Implementation from '../../../props/models/Implementation';
import FormGroup from '../../elements/forms/elements/FormGroup';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import useFormBuilder from '../../../hooks/useFormBuilder';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushApiError from '../../../hooks/usePushApiError';
import usePushSuccess from '../../../hooks/usePushSuccess';
import ImplementationsRootBreadcrumbs from '../implementations/elements/ImplementationsRootBreadcrumbs';
import FormPaneContainer from '../../elements/forms/elements/FormPaneContainer';
import FormPane from '../../elements/forms/elements/FormPane';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function ImplementationTranslations() {
    const { id } = useParams();

    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();
    const activeOrganization = useActiveOrganization();

    const implementationService = useImplementationService();

    const [implementation, setImplementation] = useState<Implementation>(null);

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => setImplementation(res.data.data))
            .catch(pushApiError);
    }, [activeOrganization.id, id, implementationService, pushApiError]);

    const form = useFormBuilder({ languages: [] }, () => {
        setProgress(0);

        implementationService
            .updateCMS(activeOrganization.id, implementation?.id, form.values)
            .then((res) => {
                setImplementation(res.data.data);
                pushSuccess('Opgeslagen!');
            })
            .catch((err: ResponseError) => {
                form.setErrors(err.data.errors);
                pushApiError(err);
            })
            .finally(() => {
                form.setIsLocked(false);
                setProgress(100);
            });
    });

    const { update: formUpdate } = form;

    useEffect(() => {
        fetchImplementation();
    }, [fetchImplementation]);

    useEffect(() => {
        formUpdate({ languages: implementation?.languages.map((item) => item.id) });
    }, [implementation?.languages, formUpdate]);

    if (!implementation) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <ImplementationsRootBreadcrumbs implementation={implementation} />
                <div className="breadcrumb-item active">Vertalingen</div>
            </div>

            <form onSubmit={form.submit} className="card form">
                <div className="card-header">
                    <div className="card-title flex flex-grow">Vertalingen</div>
                    <div className="card-header-filters">
                        <div className="block block-inline-filters">
                            <StateNavLink
                                name={DashboardRoutes.ORGANIZATION_TRANSLATIONS}
                                className={'button button-primary button-sm'}
                                params={{ organizationId: activeOrganization.id }}>
                                <em className="mdi mdi-pencil-outline" />
                                Beheer vertaallimieten
                            </StateNavLink>
                        </div>
                    </div>
                </div>

                <FormPaneContainer className="card-section">
                    <FormPane title={'Beschikbare talen'}>
                        <FormGroup
                            label={'Beschikbare talen'}
                            input={() => (
                                <Fragment>
                                    {activeOrganization?.translations_languages?.map((item) => (
                                        <div key={item.id}>
                                            <CheckboxControl
                                                checked={form.values.languages?.includes(item.id)}
                                                disabled={
                                                    !activeOrganization?.allow_translations ||
                                                    !activeOrganization?.translations_enabled
                                                }
                                                onChange={(e) => {
                                                    formUpdate({
                                                        languages: e.currentTarget?.checked
                                                            ? [...form.values.languages, item.id]
                                                            : [
                                                                  ...form.values.languages.filter(
                                                                      (languageId) => languageId !== item.id,
                                                                  ),
                                                              ],
                                                    });
                                                }}
                                                title={`${item.name} [${item.locale?.toUpperCase()}]`}
                                            />
                                        </div>
                                    ))}
                                </Fragment>
                            )}
                        />
                    </FormPane>
                </FormPaneContainer>

                <div className="card-footer card-footer-primary">
                    <div className="button-group flex-center">
                        <StateNavLink
                            name={DashboardRoutes.IMPLEMENTATION}
                            params={{ id: implementation.id, organizationId: activeOrganization.id }}
                            className="button button-default">
                            Annuleren
                        </StateNavLink>
                        <button type={'submit'} className="button button-primary">
                            Bevestigen
                        </button>
                    </div>
                </div>
            </form>
        </Fragment>
    );
}
