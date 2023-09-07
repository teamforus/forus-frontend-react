import React, { useCallback, useContext, useEffect, useState } from 'react';
import { mainContext } from '../../../../contexts/MainContext';
import { useTranslation } from 'react-i18next';
import PhotoSelector from '../../../elements/photo-selector/PhotoSelector';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import { useOrganizationService } from '../../../../services/OrganizationService';
import Organization from '../../../../props/models/Organization';
import FormError from '../../../elements/forms/errors/FormError';
import CheckboxControl from '../../../elements/forms/controls/CheckboxControl';
import SelectControl from '../../../elements/select-control/SelectControl';
import SelectControlOptions from '../../../elements/select-control/templates/SelectControlOptions';
import BusinessType from '../../../../props/models/BusinessType';
import { useBusinessTypeService } from '../../../../services/BusinessTypeService';
import { NavLink, useParams } from 'react-router-dom';
import { getStateRouteUrl, useNavigateState } from '../../../../modules/state_router/Router';
import { useMediaService } from '../../../../services/MediaService';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import useAuthIdentity from '../../../../hooks/useAuthIdentity';
import usePushDanger from '../../../../hooks/usePushDanger';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import useSetProgress from '../../../../hooks/useSetProgress';
import MarkdownEditor from '../../../elements/forms/markdown-editor/MarkdownEditor';

export default function OrganizationForm() {
    const { organizationId } = useParams();
    const { t } = useTranslation();
    const { fetchOrganizations, setActiveOrganization } = useContext(mainContext);

    const authIdentity = useAuthIdentity();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const [mediaFile, setMediaFile] = useState<Blob>(null);
    const mediaService = useMediaService();
    const organizationService = useOrganizationService();
    const businessTypeService = useBusinessTypeService();
    const { apiResourceToForm } = organizationService;
    const navigateState = useNavigateState();

    const [organization, setOrganization] = useState<Organization>(null);
    const [businessTypes, setBusinessTypes] = useState<Array<BusinessType>>(null);

    const fetchBusinessTypes = useCallback(() => {
        setProgress(0);

        businessTypeService
            .list({ per_page: 9999 })
            .then((res) => setBusinessTypes(res.data.data))
            .finally(() => setProgress(100));
    }, [businessTypeService, setProgress]);

    const fetchOrganization = useCallback(
        (id) => {
            setProgress(0);

            organizationService
                .read(id)
                .then((res) => setOrganization(res.data.data))
                .finally(() => setProgress(100));
        },
        [organizationService, setProgress],
    );

    const uploadMedia = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!mediaFile) {
                return resolve(organization?.logo?.uid);
            }

            setProgress(0);

            return mediaService
                .store('organization_logo', mediaFile)
                .then((res) => {
                    setMediaFile(null);
                    resolve(res.data.data.uid);
                }, reject)
                .finally(() => setProgress(100));
        });
    }, [mediaFile, mediaService, setProgress, organization]);

    const form = useFormBuilder<{
        iban?: string;
        name?: string;
        phone?: string;
        phone_public?: boolean;
        email?: string;
        email_public?: boolean;
        website?: string;
        website_public?: boolean;
        media_uid?: string;
        description?: string;
        description_html?: string;
        kvk?: string;
        btw?: string;
        business_type_id?: number;
    }>(null, (values) => {
        if (typeof values.iban === 'string') {
            values.iban = values.iban.replace(/\s/g, '');
        }

        uploadMedia().then((uid: string) => {
            values.media_uid = uid;
            setProgress(0);

            const promise = organization
                ? organizationService.update(organization.id, values)
                : organizationService.store(values);

            promise
                .then(
                    (res) => {
                        navigateState('organizations');
                        pushSuccess('Success!');
                        fetchOrganizations().then(() => {
                            organizationService.use(res.data.data.id);
                            setActiveOrganization(res.data.data);
                        });
                    },
                    (res) => {
                        form.setIsLocked(false);
                        form.setErrors(res.data.errors);
                        pushDanger('Error!', res.data.message);
                    },
                )
                .finally(() => setProgress(100));
        });
    });

    const { update } = form;

    useEffect(() => {
        if (organization) {
            update({ ...apiResourceToForm(organization) });
        }
    }, [apiResourceToForm, update, organization]);

    useEffect(() => {
        if (organizationId) {
            fetchOrganization(organizationId);
        }
    }, [organizationId, fetchOrganization]);

    useEffect(() => {
        fetchBusinessTypes();
    }, [fetchBusinessTypes]);

    useEffect(() => {
        if (!organizationId && businessTypes) {
            update({ business_type_id: businessTypes[0]?.id });
        }
    }, [businessTypes, organizationId, update]);

    if ((organizationId && !organization) || !businessTypes) {
        return <LoadingCard />;
    }

    return (
        <form className="card form" onSubmit={form.submit}>
            <div className="card-header">
                {organizationId ? (
                    <div className="card-title">{t('organization_edit.header.title_edit')}</div>
                ) : (
                    <div className="card-title">{t('organization_edit.header.title_add')}</div>
                )}
            </div>
            <div className="card-section card-section-primary">
                <div className="row">
                    <div className="col col-xs-12">
                        <div className="form-group form-group-inline">
                            <label htmlFor="" className="form-label">
                                &nbsp;
                            </label>
                            <div className="form-offset">
                                <PhotoSelector
                                    type="organization_logo"
                                    thumbnail={organization?.logo?.sizes?.thumbnail}
                                    selectPhoto={(file) => setMediaFile(file)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-section card-section-primary">
                <div className="row">
                    <div className="col col-lg-9 col-lg-12">
                        <div className="form-group form-group-inline">
                            <label htmlFor="name" className="form-label form-label-required">
                                {t('organization_edit.labels.name')}
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Bedrijfsnaam"
                                value={form.values?.name || ''}
                                onChange={(e) => form.update({ name: e.target.value })}
                            />
                            <FormError error={form.errors?.name} />
                        </div>
                        <div className="form-group form-group-inline">
                            <label htmlFor="iban" className="form-label form-label-required">
                                {t('organization_edit.labels.bank')}
                            </label>
                            <div className="form-offset">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder={'IBAN-nummer'}
                                    value={form.values?.iban || ''}
                                    onChange={(e) => form.update({ iban: e.target.value })}
                                    disabled={organization && organization?.identity_address != authIdentity.address}
                                />
                                {organization && organization?.identity_address != authIdentity.address && (
                                    <div className="form-hint">Alleen de eigenaar kan het rekeningnummer wijzigen.</div>
                                )}
                                <FormError error={form.errors?.iban} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-section card-section-primary">
                <div className="form-group form-group-inline">
                    <label htmlFor="email" className="form-label form-label-required">
                        {t('organization_edit.labels.mail')}
                    </label>
                    <div className="form-offset">
                        <div className="row">
                            <div className="col col-lg-8 col-lg-12">
                                <input
                                    id={'email'}
                                    type="email"
                                    className="form-control"
                                    value={form.values?.email || ''}
                                    onChange={(e) => form.update({ email: e.target.value })}
                                    placeholder="E-mailadres"
                                />
                                <FormError error={form.errors?.email} />
                            </div>

                            <div className="col col-lg-4 col-lg-12">
                                <CheckboxControl
                                    id={'email_public'}
                                    title={'Maak publiek'}
                                    checked={!!form.values?.email_public}
                                    onChange={(e) => form.update({ email_public: e.target.checked })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-group form-group-inline">
                    <label htmlFor="phone" className="form-label form-label-required">
                        {t('organization_edit.labels.phone')}
                    </label>
                    <div className="form-offset">
                        <div className="row">
                            <div className="col col-lg-8 col-lg-12">
                                <input
                                    id="phone"
                                    type="text"
                                    className="form-control"
                                    value={form.values?.phone || ''}
                                    onChange={(e) => form.update({ phone: e.target.value })}
                                    placeholder="Telefoonnummer"
                                />
                                <FormError error={form.errors?.phone} />
                            </div>

                            <div className="col col-lg-4 col-lg-12">
                                <CheckboxControl
                                    id={'phone_public'}
                                    title={'Maak publiek'}
                                    checked={!!form.values?.phone_public}
                                    onChange={(e) => form.update({ phone_public: e.target.checked })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-group form-group-inline">
                    <label htmlFor="website" className="form-label">
                        {t('organization_edit.labels.website')}
                    </label>
                    <div className="form-offset">
                        <div className="row">
                            <div className="col col-lg-8 col-lg-12">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={form.values?.website || ''}
                                    onChange={(e) => form.update({ website: e.target.value })}
                                    placeholder="Website"
                                />
                                <FormError error={form.errors?.website} />
                            </div>

                            <div className="col col-lg-4 col-lg-12">
                                <CheckboxControl
                                    id={'website_public'}
                                    title={'Maak publiek'}
                                    checked={!!form.values?.website_public}
                                    onChange={(e) => form.update({ website_public: e.target.checked })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-section card-section-primary">
                <div className="row">
                    <div className="col col-lg-9 col-lg-12">
                        <div className="form-group form-group-inline">
                            <label htmlFor="" className="form-label form-label-required">
                                {t('organization_edit.labels.business_type')}
                            </label>
                            <div className="form-offset">
                                <SelectControl
                                    className={'form-control'}
                                    options={businessTypes || []}
                                    propKey={'id'}
                                    allowSearch={true}
                                    value={form.values?.business_type_id}
                                    optionsComponent={SelectControlOptions}
                                    onChange={(id?: number) => form.update({ business_type_id: id })}
                                />
                                <FormError error={form.errors?.business_type_id} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-section card-section-primary">
                <div className="row">
                    <div className="col col-lg-9 col-lg-12">
                        <div className="form-group form-group-inline">
                            <label htmlFor="description" className="form-label form-label-required">
                                {t('organization_edit.labels.description')}
                            </label>
                            <div className="form-offset">
                                <MarkdownEditor
                                    value={form.values?.description_html || ''}
                                    onChange={(description) => form.update({ description })}
                                    extendedOptions={true}
                                    placeholder={t('organization_edit.labels.description')}
                                />
                                <FormError error={form.errors?.description} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-section card-section-primary">
                <div className="row">
                    <div className="col col-lg-9 col-lg-12">
                        <div className="form-group form-group-inline">
                            <label htmlFor="kvk" className="form-label form-label-required">
                                {t('organization_edit.labels.kvk')}
                            </label>
                            <input
                                type="text"
                                placeholder="KvK-nummer"
                                className="form-control"
                                value={form.values?.kvk || ''}
                                onChange={(e) => form.update({ kvk: e.target.value })}
                            />
                            <FormError error={form.errors?.kvk} />
                        </div>
                        <div className="form-group form-group-inline">
                            <label htmlFor="kvk" className="form-label form-label-required">
                                {t('organization_edit.labels.tax')}
                            </label>
                            <input
                                type="text"
                                placeholder="BTW-nummer"
                                className="form-control"
                                value={form.values?.btw || ''}
                                onChange={(e) => form.update({ btw: e.target.value })}
                            />
                            <FormError error={form.errors?.btw} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-section card-section-primary">
                <div className="text-center">
                    {/*{organization && (
                        <NavLink
                            to={getStateRouteUrl('organization-offices', { organizationId: organization?.id })}
                            type="button"
                            className="button button-default">
                            {t('organization_edit.buttons.cancel')}
                        </NavLink>
                    )}*/}

                    <NavLink to={getStateRouteUrl('organizations')} type="button" className="button button-default">
                        {t('organization_edit.buttons.cancel')}
                    </NavLink>

                    <button type="submit" className="button button-primary">
                        {t('organization_edit.buttons.create')}
                    </button>
                </div>
            </div>
        </form>
    );
}
