import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useFormBuilder from '../../../hooks/useFormBuilder';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import FormError from '../../elements/forms/errors/FormError';
import useSetProgress from '../../../hooks/useSetProgress';
import { ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import { useNavigate, useParams } from 'react-router-dom';
import Implementation from '../../../props/models/Implementation';
import { getStateRouteUrl } from '../../../modules/state_router/Router';

export default function ImplementationsEmail() {
    const { id } = useParams();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
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
                pushDanger('Mislukt!', err.data.message);
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
            .catch((res: ResponseError) => {
                if (res.status === 403) {
                    return navigate(getStateRouteUrl('implementations', { organizationId: activeOrganization.id }));
                }

                pushDanger('Mislukt!', res.data.message);
            });
    }, [activeOrganization.id, id, implementationService, navigate, pushDanger]);

    useEffect(() => fetchImplementation(), [fetchImplementation]);

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
                <StateNavLink
                    name={'implementations'}
                    params={{ organizationId: activeOrganization.id }}
                    className="breadcrumb-item">
                    Webshops
                </StateNavLink>
                <StateNavLink
                    name={'implementations-view'}
                    params={{ organizationId: activeOrganization.id, id: implementation.id }}
                    className="breadcrumb-item">
                    {implementation.name}
                </StateNavLink>
                <div className="breadcrumb-item active">Email instellingen</div>
            </div>

            <div className="card">
                <form className="form" onSubmit={form.submit}>
                    <div className="card-header">
                        <div className="card-title">Email instellingen</div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-lg-9">
                                <div className="form-group form-group-inline">
                                    <label className="form-label" htmlFor="email_from_address">
                                        Afzender emailadres
                                    </label>
                                    <input
                                        id="email_from_address"
                                        type="text"
                                        className="form-control"
                                        placeholder="Afzender emailadres"
                                        value={form.values?.email_from_address || ''}
                                        onChange={(e) => form.update({ email_from_address: e.target.value })}
                                    />
                                    <FormError error={form.errors.email_from_address} />
                                </div>
                                <div className="form-group form-group-inline">
                                    <label className="form-label" htmlFor="email_from_name">
                                        Afzender naam
                                    </label>
                                    <input
                                        id="email_from_name"
                                        type="text"
                                        className="form-control"
                                        placeholder="Afzender naam"
                                        value={form.values?.email_from_name || ''}
                                        onChange={(e) => form.update({ email_from_name: e.target.value })}
                                    />
                                    <FormError error={form.errors.email_from_name} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-lg-9">
                                <div className="form-group form-group-inline">
                                    <label className="form-label">
                                        <em className="mdi mdi-information" style={{ fontSize: '18px' }} />
                                    </label>
                                    <span>
                                        Forus zal uw e-mailadres verifieren en uw systeembeheer vragen om Forus zijn
                                        mailservice als veilige afzender toe te voegen aan uw domein.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="button-group flex-center">
                            <StateNavLink
                                name={'implementations-view'}
                                params={{ organizationId: activeOrganization.id, id: implementation.id }}
                                className="button button-default">
                                {t('funds_edit.buttons.cancel')}
                            </StateNavLink>
                            <button className="button button-primary" type="submit">
                                {t('funds_edit.buttons.confirm')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Fragment>
    );
}
