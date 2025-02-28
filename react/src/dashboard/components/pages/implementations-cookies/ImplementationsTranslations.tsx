import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import { useParams } from 'react-router-dom';
import Implementation from '../../../props/models/Implementation';
import FormGroup from '../../elements/forms/controls/FormGroup';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import useFormBuilder from '../../../hooks/useFormBuilder';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushApiError from '../../../hooks/usePushApiError';
import usePushSuccess from '../../../hooks/usePushSuccess';

export default function ImplementationsTranslations() {
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
                <StateNavLink
                    name={'implementations'}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    Webshops
                </StateNavLink>
                <StateNavLink
                    name={'implementations-view'}
                    params={{ organizationId: activeOrganization.id, id: implementation.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {implementation.name}
                </StateNavLink>
                <div className="breadcrumb-item active">Vertalingen</div>
            </div>

            <form onSubmit={form.submit} className="card">
                <div className="card-header">
                    <div className="card-title">Vertalingen</div>
                </div>

                <div className="card-section form">
                    <FormGroup
                        inline={true}
                        inlineSize={'lg'}
                        label={'Languages'}
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
                                                        : [...form.values.languages.filter((id) => id !== item.id)],
                                                });
                                            }}
                                            title={`${item.name} [${item.locale?.toUpperCase()}]`}
                                        />
                                    </div>
                                ))}
                            </Fragment>
                        )}
                    />
                </div>

                <div className="card-footer">
                    <div className="button-group flex-center">
                        <StateNavLink
                            name={'implementations-view'}
                            params={{ id: implementation.id, organizationId: activeOrganization.id }}
                            className="button button-default">
                            Annuleren
                        </StateNavLink>
                        <button type={'submit'} name={'implementations-view'} className="button button-primary">
                            Bevestigen
                        </button>
                    </div>
                </div>
            </form>
        </Fragment>
    );
}
