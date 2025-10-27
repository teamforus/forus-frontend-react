import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useFormBuilder from '../../../hooks/useFormBuilder';
import usePushSuccess from '../../../hooks/usePushSuccess';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import FormError from '../../elements/forms/errors/FormError';
import useSetProgress from '../../../hooks/useSetProgress';
import { ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import { useParams } from 'react-router';
import Implementation from '../../../props/models/Implementation';
import { useNavigateState } from '../../../modules/state_router/Router';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function ImplementationsDigid() {
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
                    return navigateState(DashboardRoutes.IMPLEMENTATIONS, { organizationId: activeOrganization.id });
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
                <div className="breadcrumb-item active">DigiD instellingen</div>
            </div>

            <div className="card">
                <form className="form" onSubmit={form.submit}>
                    <div className="card-header">
                        <div className="card-title">DigiD instellingen</div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-md-8 col-md-offset-2 col-xs-12">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="digid_app_id">
                                        App identificatienummer
                                    </label>
                                    <input
                                        id="digid_app_id"
                                        type="text"
                                        className="form-control"
                                        placeholder="Bijv. Gemeente01"
                                        disabled={form.values?.digid_enabled}
                                        value={form.values?.digid_app_id || ''}
                                        onChange={(e) => form.update({ digid_app_id: e.target.value })}
                                    />
                                    <FormError error={form.errors.digid_app_id} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label form-label-required" htmlFor="digid_shared_secret">
                                        Sleutelcode
                                    </label>
                                    <input
                                        id="digid_shared_secret"
                                        type="password"
                                        className="form-control"
                                        placeholder="Bijv. 56CC-0EDF-E57C-960D-K524-LWFZ"
                                        disabled={form.values?.digid_enabled}
                                        value={form.values?.digid_shared_secret || ''}
                                        onChange={(e) => form.update({ digid_shared_secret: e.target.value })}
                                    />
                                    <FormError error={form.errors.digid_shared_secret} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="digid_a_select_server">
                                        DigiD Server
                                    </label>
                                    <input
                                        id="digid_a_select_server"
                                        type="text"
                                        className="form-control"
                                        placeholder="Bijv.  digidasdemo1"
                                        disabled={form.values?.digid_enabled}
                                        value={form.values?.digid_a_select_server || ''}
                                        onChange={(e) => form.update({ digid_a_select_server: e.target.value })}
                                    />
                                    <FormError error={form.errors.digid_a_select_server} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <label className="form-toggle form-label" htmlFor="status">
                                        <input
                                            className="form-label"
                                            type="checkbox"
                                            id="status"
                                            checked={form.values?.digid_enabled}
                                            onChange={(e) => form.update({ digid_enabled: e.target.checked })}
                                        />
                                        <div className="form-toggle-inner flex-end">
                                            <div className="toggle-input">
                                                <div className="toggle-input-dot" />
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="button-group flex-center">
                            <StateNavLink
                                name={DashboardRoutes.IMPLEMENTATION}
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
            </div>
        </Fragment>
    );
}
