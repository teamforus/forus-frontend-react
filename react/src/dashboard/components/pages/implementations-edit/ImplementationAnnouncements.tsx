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
import { dateFormat, dateParse } from '../../../helpers/dates';
import { ResponseError } from '../../../props/ApiResponses';
import { useNavigateState } from '../../../modules/state_router/Router';
import ImplementationsRootBreadcrumbs from '../implementations/elements/ImplementationsRootBreadcrumbs';
import SelectControl from '../../elements/select-control/SelectControl';
import MarkdownEditor from '../../elements/forms/markdown-editor/MarkdownEditor';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import InfoBox from '../../elements/info-box/InfoBox';
import FormPaneContainer from '../../elements/forms/elements/FormPaneContainer';
import FormPane from '../../elements/forms/elements/FormPane';
import FormGroup from '../../elements/forms/elements/FormGroup';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

type FormValues = {
    active: boolean;
    type: string;
    title: string;
    description: string;
    description_html?: string;
    expire: boolean;
    expire_at?: string;
    replace: boolean;
};

const announcementStateOptions = [
    { value: false, label: 'Nee' },
    { value: true, label: 'Ja' },
];

const announcementTypeOptions = [
    { value: 'warning', label: 'Waarschuwing' },
    { value: 'success', label: 'Succes' },
    { value: 'primary', label: 'Primair' },
    { value: 'default', label: 'Standaard' },
    { value: 'danger', label: 'Foutmelding' },
];

const announcementExpireOptions = [
    { value: false, label: 'Nee' },
    { value: true, label: 'Ja' },
];

export default function ImplementationAnnouncements() {
    const { id } = useParams();

    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();

    const activeOrganization = useActiveOrganization();
    const implementationService = useImplementationService();

    const [implementation, setImplementation] = useState<Implementation>(null);

    const form = useFormBuilder<FormValues>(
        {
            active: false,
            type: announcementTypeOptions[0].value,
            title: '',
            description: '',
            description_html: '',
            expire: false,
            expire_at: null,
            replace: false,
        },
        (values) => {
            setProgress(0);

            implementationService
                .updateCMS(activeOrganization.id, implementation.id, {
                    announcement: {
                        active: values.active,
                        type: values.type,
                        title: values.title,
                        description: values.description,
                        description_html: values.description_html,
                        expire: values.expire,
                        expire_at: values.expire ? values.expire_at : null,
                        replace: values.replace,
                    },
                })
                .then(() => {
                    pushSuccess('Opgeslagen!');
                    navigateState(DashboardRoutes.IMPLEMENTATION, {
                        organizationId: activeOrganization.id,
                        id: id,
                    });
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
                const implementationData = res.data.data;
                const announcement = implementationData.announcement;

                setImplementation(implementationData);

                formUpdate({
                    active: !!announcement?.active,
                    type: announcement?.type || announcementTypeOptions[0].value,
                    title: announcement?.title || '',
                    description: announcement?.description || '',
                    description_html: announcement?.description_html || '',
                    expire: !!announcement?.expire_at || false,
                    expire_at: announcement?.expire_at || null,
                    replace: false,
                });
            })
            .catch(pushApiError);
    }, [id, implementationService, activeOrganization.id, pushApiError, formUpdate]);

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
                <div className="breadcrumb-item active">Aankondigingen</div>
            </div>

            <form className="form card" onSubmit={form.submit}>
                <div className="card-header">
                    <div className="card-title flex flex-grow">Aankondigingen</div>
                </div>

                <FormPaneContainer className="card-section">
                    <FormPane title={'Instellingen'}>
                        <FormGroup
                            label={translate('implementation_edit.labels.announcement_show')}
                            error={form.errors['announcement.active']}
                            input={(id) => (
                                <SelectControl
                                    id={id}
                                    propKey="value"
                                    propValue="label"
                                    allowSearch={false}
                                    options={announcementStateOptions}
                                    value={form.values?.active}
                                    onChange={(value?: boolean) => form.update({ active: value })}
                                />
                            )}
                        />

                        {form.values?.active && (
                            <Fragment>
                                <FormGroup
                                    label={translate('implementation_edit.labels.announcement_type')}
                                    error={form.errors['announcement.type']}
                                    input={(id) => (
                                        <SelectControl
                                            id={id}
                                            propKey="value"
                                            propValue="label"
                                            allowSearch={false}
                                            options={announcementTypeOptions}
                                            value={form.values?.type}
                                            onChange={(value?: string) => form.update({ type: value })}
                                        />
                                    )}
                                />

                                <FormGroup
                                    label={translate('implementation_edit.labels.announcement_title')}
                                    error={form.errors['announcement.title']}
                                    input={(id) => (
                                        <input
                                            id={id}
                                            type="text"
                                            className="form-control"
                                            value={form.values?.title || ''}
                                            onChange={(e) => form.update({ title: e.target.value })}
                                        />
                                    )}
                                />

                                <FormGroup
                                    label={translate('implementation_edit.labels.announcement_description')}
                                    error={form.errors['announcement.description']}
                                    input={() => (
                                        <MarkdownEditor
                                            value={form.values?.description_html || ''}
                                            placeholder="Beschrijving"
                                            onChange={(value) => form.update({ description: value })}
                                        />
                                    )}
                                />

                                <FormGroup
                                    label={translate('implementation_edit.labels.announcement_expire')}
                                    error={form.errors['announcement.expire']}
                                    input={(id) => (
                                        <SelectControl
                                            id={id}
                                            propKey="value"
                                            propValue="label"
                                            allowSearch={false}
                                            options={announcementExpireOptions}
                                            value={form.values?.expire}
                                            onChange={(value?: boolean) =>
                                                form.update({
                                                    expire: value,
                                                    expire_at: value ? form.values?.expire_at : null,
                                                })
                                            }
                                        />
                                    )}
                                />

                                {form.values?.expire && (
                                    <FormGroup
                                        label={translate('implementation_edit.labels.announcement_expire_at')}
                                        error={form.errors['announcement.expire_at']}
                                        input={() => (
                                            <DatePickerControl
                                                dateFormat={'dd-MM-yyyy'}
                                                value={dateParse(form.values?.expire_at)}
                                                placeholder="dd-MM-jjjj"
                                                onChange={(value) => form.update({ expire_at: dateFormat(value) })}
                                            />
                                        )}
                                    />
                                )}

                                <FormGroup
                                    label={translate('implementation_edit.labels.announcement_replace')}
                                    input={() => (
                                        <CheckboxControl
                                            title={
                                                'Maak de aankondiging opnieuw zichtbaar voor iedereen, ook als zij deze eerder hebben gesloten.'
                                            }
                                            checked={form.values?.replace}
                                            onChange={(event) => form.update({ replace: event.target.checked })}
                                        />
                                    )}
                                />
                            </Fragment>
                        )}
                    </FormPane>

                    <InfoBox type="default">
                        Gebruik aankondigingen om bezoekers gericht te informeren. Houd de boodschap kort, kies een
                        passend type en stel een einddatum in als de aankondiging tijdelijk zichtbaar moet zijn.
                    </InfoBox>
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
        </Fragment>
    );
}
