import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useImplementationService from '../../../services/ImplementationService';
import Implementation from '../../../props/models/Implementation';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useFormBuilder from '../../../hooks/useFormBuilder';
import usePushSuccess from '../../../hooks/usePushSuccess';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushApiError from '../../../hooks/usePushApiError';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useTranslate from '../../../hooks/useTranslate';
import FormGroup from '../../elements/forms/elements/FormGroup';
import FormGroupInfo from '../../elements/forms/elements/FormGroupInfo';
import SelectControl from '../../elements/select-control/SelectControl';
import { ResponseError } from '../../../props/ApiResponses';
import ImplementationsRootBreadcrumbs from '../implementations/elements/ImplementationsRootBreadcrumbs';
import FormPaneContainer from '../../elements/forms/elements/FormPaneContainer';
import FormPane from '../../elements/forms/elements/FormPane';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

type FormValues = {
    show_privacy_checkbox: boolean;
    show_terms_checkbox: boolean;
};

export default function ImplementationTermsAndPrivacy() {
    const { id } = useParams();

    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const activeOrganization = useActiveOrganization();
    const implementationService = useImplementationService();

    const [implementation, setImplementation] = useState<Implementation>(null);

    const options = [
        { value: false, label: 'Nee' },
        { value: true, label: 'Ja' },
    ];

    const form = useFormBuilder<FormValues>(
        {
            show_privacy_checkbox: false,
            show_terms_checkbox: false,
        },
        (values) => {
            setProgress(0);

            implementationService
                .updateCMS(activeOrganization.id, implementation.id, {
                    show_privacy_checkbox: values.show_privacy_checkbox,
                    show_terms_checkbox: values.show_terms_checkbox,
                })
                .then((res) => {
                    setImplementation(res.data.data);
                    form.setErrors({});
                    form.update({
                        show_privacy_checkbox: res.data.data.show_privacy_checkbox,
                        show_terms_checkbox: res.data.data.show_terms_checkbox,
                    });
                    pushSuccess('Opgeslagen!');
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data?.errors || {});
                    pushApiError(err);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    const { update: formUpdate } = form;

    const fetchImplementation = useCallback(() => {
        if (!id) {
            return;
        }

        const implementationId = parseInt(id, 10);

        if (Number.isNaN(implementationId)) {
            return;
        }

        implementationService
            .read(activeOrganization.id, implementationId)
            .then((res) => {
                setImplementation(res.data.data);

                formUpdate({
                    show_privacy_checkbox: !!res.data.data.show_privacy_checkbox,
                    show_terms_checkbox: !!res.data.data.show_terms_checkbox,
                });
            })
            .catch(pushApiError);
    }, [activeOrganization.id, id, implementationService, formUpdate, pushApiError]);

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
                <div className="breadcrumb-item active">Privacy en voorwaarden</div>
            </div>

            <div className="card form">
                <form className="form" onSubmit={form.submit}>
                    <div className="card-header">
                        <div className="card-title flex flex-grow">Privacy en voorwaarden</div>
                    </div>

                    <FormPaneContainer className="card-section">
                        <FormPane title={'Toestemmingsinstellingen'}>
                            <FormGroup
                                label={translate('implementation_edit.labels.show_privacy_checkbox')}
                                error={form.errors.show_privacy_checkbox}
                                input={(id) => (
                                    <FormGroupInfo
                                        info={
                                            <Fragment>
                                                <p>
                                                    Activeer deze instelling als de gebruiker akkoord moet gaan met de
                                                    privacyvoorwaarden op de website. Op de aanmeldpagina verschijnt een
                                                    checkbox.
                                                </p>
                                                <p>
                                                    <strong>Belangrijk!</strong> Zorg ervoor dat de privacypagina is
                                                    ingesteld in het CMS, zodat de link naar deze pagina goed werkt.
                                                </p>
                                            </Fragment>
                                        }>
                                        <SelectControl
                                            id={id}
                                            className="form-control"
                                            propKey="value"
                                            propValue="label"
                                            allowSearch={false}
                                            options={options}
                                            value={form.values?.show_privacy_checkbox}
                                            onChange={(value?: boolean) =>
                                                form.update({ show_privacy_checkbox: value })
                                            }
                                        />
                                    </FormGroupInfo>
                                )}
                            />

                            <FormGroup
                                label={translate('implementation_edit.labels.show_terms_checkbox')}
                                error={form.errors.show_terms_checkbox}
                                input={(id) => (
                                    <FormGroupInfo
                                        info={
                                            <Fragment>
                                                <p>
                                                    Activeer deze instelling als de gebruiker akkoord moet gaan met de
                                                    voorwaarden van de website. Op de aanmeldpagina verschijnt een
                                                    checkbox.
                                                </p>
                                                <p>
                                                    <strong>Belangrijk!</strong> Zorg ervoor dat de voorwaardepagina is
                                                    ingesteld in het CMS, zodat de link naar deze pagina goed werkt.
                                                </p>
                                            </Fragment>
                                        }>
                                        <SelectControl
                                            id={id}
                                            className="form-control"
                                            propKey="value"
                                            propValue="label"
                                            allowSearch={false}
                                            options={options}
                                            value={form.values?.show_terms_checkbox}
                                            onChange={(value?: boolean) => form.update({ show_terms_checkbox: value })}
                                        />
                                    </FormGroupInfo>
                                )}
                            />
                        </FormPane>
                    </FormPaneContainer>

                    <div className="card-footer card-footer-primary">
                        <div className="button-group flex-center">
                            <StateNavLink
                                name={DashboardRoutes.IMPLEMENTATION}
                                params={{
                                    id: implementation.id,
                                    organizationId: activeOrganization.id,
                                }}
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
