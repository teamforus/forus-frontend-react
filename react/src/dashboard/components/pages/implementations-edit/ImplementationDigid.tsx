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
import { useNavigateState } from '../../../modules/state_router/Router';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import ImplementationsRootBreadcrumbs from '../implementations/elements/ImplementationsRootBreadcrumbs';
import FormPaneContainer from '../../elements/forms/elements/FormPaneContainer';
import FormPane from '../../elements/forms/elements/FormPane';
import FormGroup from '../../elements/forms/elements/FormGroup';

export default function ImplementationDigid() {
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
        digid_enabled: boolean;
        digid_app_id: string;
        digid_shared_secret: string;
        digid_a_select_server: string;
    }>(
        {
            digid_enabled: false,
            digid_app_id: null,
            digid_shared_secret: null,
            digid_a_select_server: null,
        },
        (values) => {
            setProgress(0);

            implementationService
                .updateDigiD(activeOrganization.id, implementation.id, values)
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
        },
    );

    const { update } = form;

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => setImplementation(res.data.data))
            .catch((err: ResponseError) => {
                if (err.status === 403) {
                    return navigateState('implementations', { organizationId: activeOrganization.id });
                }

                pushApiError(err);
            });
    }, [implementationService, activeOrganization.id, id, pushApiError, navigateState]);

    useEffect(() => {
        fetchImplementation();
    }, [fetchImplementation]);

    useEffect(() => {
        if (implementation) {
            update({
                digid_enabled: implementation.digid_enabled,
                digid_app_id: implementation.digid_app_id,
                digid_shared_secret: implementation.digid_shared_secret,
                digid_a_select_server: implementation.digid_a_select_server,
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
                <div className="breadcrumb-item active">DigiD instellingen</div>
            </div>

            <form className="form card" onSubmit={form.submit}>
                <div className="card-header">
                    <div className="card-title">DigiD instellingen</div>
                </div>

                <FormPaneContainer className="card-section">
                    <FormPane title={'Instellingen'}>
                        <FormGroup
                            label={'App identificatienummer'}
                            error={form.errors?.digid_app_id}
                            input={(id) => (
                                <input
                                    id={id}
                                    type="text"
                                    className="form-control"
                                    placeholder="Bijv. Gemeente01"
                                    disabled={form.values?.digid_enabled}
                                    value={form.values?.digid_app_id || ''}
                                    onChange={(e) => form.update({ digid_app_id: e.target.value })}
                                />
                            )}
                        />

                        <FormGroup
                            required={true}
                            label={'Sleutelcode'}
                            error={form.errors?.digid_shared_secret}
                            input={(id) => (
                                <input
                                    id={id}
                                    type="password"
                                    className="form-control"
                                    placeholder="Bijv. 56CC-0EDF-E57C-960D-K524-LWFZ"
                                    disabled={form.values?.digid_enabled}
                                    value={form.values?.digid_shared_secret || ''}
                                    onChange={(e) => form.update({ digid_shared_secret: e.target.value })}
                                />
                            )}
                        />

                        <FormGroup
                            label={'DigiD Server'}
                            error={form.errors?.digid_a_select_server}
                            input={(id) => (
                                <input
                                    id={id}
                                    type="text"
                                    className="form-control"
                                    placeholder="Bijv. digidasdemo1"
                                    disabled={form.values?.digid_enabled}
                                    value={form.values?.digid_a_select_server || ''}
                                    onChange={(e) => form.update({ digid_a_select_server: e.target.value })}
                                />
                            )}
                        />

                        <FormGroup
                            label={'Status'}
                            input={(id) => (
                                <label className="form-toggle form-label" htmlFor={id}>
                                    <input
                                        className="form-label"
                                        type="checkbox"
                                        id={id}
                                        checked={form.values?.digid_enabled}
                                        onChange={(e) => form.update({ digid_enabled: e.target.checked })}
                                    />
                                    <div className="form-toggle-inner flex-end">
                                        <div className="toggle-input">
                                            <div className="toggle-input-dot" />
                                        </div>
                                    </div>
                                </label>
                            )}
                        />
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
                        <button className="button button-primary" type="submit">
                            {translate('funds_edit.buttons.confirm')}
                        </button>
                    </div>
                </div>
            </form>
        </Fragment>
    );
}
