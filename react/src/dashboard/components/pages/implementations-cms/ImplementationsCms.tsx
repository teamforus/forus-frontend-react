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
import { useParams } from 'react-router-dom';
import Implementation from '../../../props/models/Implementation';
import { useMediaService } from '../../../services/MediaService';
import ImplementationsCmsPages from './elements/ImplementationsCmsPages';
import ModalDangerZone from '../../modals/ModalDangerZone';
import useOpenModal from '../../../hooks/useOpenModal';
import MarkdownEditor from '../../elements/forms/markdown-editor/MarkdownEditor';
import SelectControl from '../../elements/select-control/SelectControl';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../helpers/dates';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import PhotoSelectorData from '../../elements/photo-selector/types/PhotoSelectorData';
import useTranslate from '../../../hooks/useTranslate';
import FormGroupInfo from '../../elements/forms/elements/FormGroupInfo';
import FormGroup from '../../elements/forms/controls/FormGroup';
import PhotoSelectorBanner from '../../elements/photo-selector/PhotoSelectorBanner';
import ToggleControl from '../../elements/forms/controls/ToggleControl';
import ModalNotification from '../../modals/ModalNotification';
import usePushApiError from '../../../hooks/usePushApiError';
import InfoBox from '../../elements/info-box/InfoBox';

export default function ImplementationsCms() {
    const { id } = useParams();

    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const activeOrganization = useActiveOrganization();

    const mediaService = useMediaService();
    const implementationService = useImplementationService();

    const [bannerMedia, setBannerMedia] = useState(null);
    const [showInfoBlock, setShowInfoBlock] = useState(false);
    const [implementation, setImplementation] = useState<Implementation>(null);
    const [initialCommunicationType, setInitialCommunicationType] = useState(null);

    const [communicationTypes] = useState([
        { value: true, label: 'Je/jouw' },
        { value: false, label: 'U/uw' },
    ]);

    const [announcementState] = useState([
        { value: false, label: 'Nee' },
        { value: true, label: 'Ja' },
    ]);

    const [privacyAndTermsState] = useState([
        { value: false, label: 'Nee' },
        { value: true, label: 'Ja' },
    ]);

    const [announcementTypes] = useState([
        { value: 'warning', label: 'Waarschuwing' },
        { value: 'success', label: 'Succes' },
        { value: 'primary', label: 'Primair' },
        { value: 'default', label: 'Standaard' },
        { value: 'danger', label: 'Foutmedling' },
    ]);

    const [announcementExpireOptions] = useState([
        { value: false, label: 'Nee' },
        { value: true, label: 'Ja' },
    ]);

    const [bannerMetaDefault] = useState<PhotoSelectorData>({
        media: null,
        mediaLoading: false,
        overlay_enabled: false,
        overlay_type: 'color',
        overlay_opacity: '40',
        banner_color: '#000',
        banner_background: '#fff',
        banner_background_mobile: true,
        banner_wide: true,
        banner_collapse: false,
        banner_position: 'left',
    });

    const [bannerMeta, setBannerMeta] = useState<PhotoSelectorData>(bannerMetaDefault);

    const form = useFormBuilder<{
        title?: string;
        description?: string;
        page_title_suffix?: string;
        banner_media_uid?: string;
        description_html?: string;
        description_alignment?: string;
        informal_communication?: boolean;
        show_privacy_checkbox?: boolean;
        show_terms_checkbox?: boolean;
        banner_button?: boolean;
        banner_button_target?: 'self' | '_blank';
        banner_button_type?: 'color' | 'white';
        banner_button_text?: string;
        banner_button_url?: string;
        announcement?: {
            type?: string;
            title?: string;
            active?: boolean;
            replace?: boolean;
            description?: string;
            expire_at?: string;
            expire?: boolean;
            description_html?: string;
        };
    }>(null, (values) => {
        const submit = () => {
            setProgress(0);
            const data = { ...values };

            const { overlay_enabled, overlay_type, overlay_opacity } = bannerMeta;
            const { banner_collapse, banner_wide, banner_position } = bannerMeta;
            const { banner_color, banner_button_type, banner_background, banner_background_mobile } = bannerMeta;

            if (data.banner_media_uid === implementation.banner_media_uid) {
                delete data.banner_media_uid;
            }

            implementationService
                .updateCMS(activeOrganization.id, implementation.id, {
                    ...data,
                    ...{ overlay_enabled, overlay_type, overlay_opacity },
                    ...{ banner_collapse, banner_wide, banner_position },
                    ...{ banner_color, banner_button_type, banner_background, banner_background_mobile },
                })
                .then((res) => {
                    setImplementation(res.data.data);
                    form.setErrors({});
                    form.update({
                        banner_media_uid: null,
                        announcement: { ...res.data.data.announcement, replace: false },
                    });

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
        };

        if (initialCommunicationType != values.informal_communication) {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title="Aanspreekvorm veranderd!"
                    description_text={[
                        `U heeft de aanspreekvorm veranderd voor de '${implementation.name}' webshop.\n`,
                        `Dit heeft ook invloed op de templates van de e-mailberichten, pushberichten en webberichten.\n`,
                        `Weet u zeker dat u wilt doorgaan?`,
                    ]}
                    buttonSubmit={{
                        text: 'Bevestigen',
                        onClick: () => {
                            submit();
                            modal.close();
                        },
                    }}
                    buttonCancel={{
                        text: 'Annuleren',
                        onClick: () => {
                            form.setIsLocked(false);
                            modal.close();
                        },
                    }}
                />
            ));

            return;
        }

        submit();
    });

    const { update: formUpdate, values: formValues } = form;

    const selectBanner = useCallback(
        (mediaFile: File | Blob) => {
            setBannerMeta((meta) => ({ ...meta, mediaLoading: true }));

            mediaService
                .store('implementation_banner', mediaFile, ['thumbnail', 'medium'])
                .then((res) => {
                    setBannerMedia(res.data.data);
                    setBannerMeta((meta) => ({ ...meta, media: res.data.data }));
                    formUpdate({ banner_media_uid: res.data.data.uid });
                })
                .catch(pushApiError)
                .finally(() => setBannerMeta((meta) => ({ ...meta, mediaLoading: false })));
        },
        [mediaService, pushApiError, formUpdate],
    );

    const deletePhoto = useCallback(() => {
        if (formValues?.banner_media_uid) {
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    title={translate('offices.confirm_delete.title')}
                    description={translate('offices.confirm_delete.description')}
                    buttonSubmit={{
                        onClick: () => {
                            modal.close();
                            mediaService.delete(formValues?.banner_media_uid).catch(pushApiError);
                            setBannerMedia(null);
                            formUpdate({ banner_media_uid: null });
                        },
                    }}
                    buttonCancel={{
                        onClick: () => modal.close(),
                    }}
                />
            ));
        } else {
            setBannerMedia(null);
            formUpdate({ banner_media_uid: null });
        }
    }, [openModal, translate, mediaService, formValues?.banner_media_uid, pushApiError, formUpdate]);

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => setImplementation(res.data.data))
            .catch(pushApiError);
    }, [activeOrganization.id, implementationService, id, pushApiError]);

    useEffect(() => {
        if (implementation) {
            setInitialCommunicationType(implementation.informal_communication);
            setBannerMedia(implementation.banner);

            setBannerMeta({
                ...bannerMetaDefault,

                media: implementation.banner,
                overlay_type: implementation.overlay_type,
                overlay_enabled: implementation.overlay_enabled,
                overlay_opacity: implementation.overlay_opacity.toString(),

                banner_wide: implementation.banner_wide,
                banner_collapse: implementation.banner_collapse,
                banner_position: implementation.banner_position,
                banner_color: implementation.banner_color,
                banner_background: implementation.banner_background,
                banner_button_type: implementation.banner_button_type,
                banner_background_mobile: implementation.banner_background_mobile,
            });

            formUpdate({
                title: implementation.title,
                description: implementation.description,
                description_html: implementation.description_html,
                page_title_suffix: implementation.page_title_suffix,
                description_alignment: implementation.description_alignment,
                informal_communication: implementation.informal_communication,
                show_terms_checkbox: implementation.show_terms_checkbox,
                show_privacy_checkbox: implementation.show_privacy_checkbox,
                banner_button: implementation.banner_button,
                banner_button_text: implementation.banner_button_text,
                banner_button_url: implementation.banner_button_url,
                banner_button_target: implementation.banner_button_target,
                banner_media_uid: implementation.banner_media_uid,
                announcement: {
                    type: announcementTypes[0].value,
                    active: announcementState[0].value,
                    replace: false,
                    title: '',
                    description: '',
                    expire_at: null,
                    expire: !!implementation.announcement?.expire_at,
                    ...(implementation?.announcement || {}),
                },
            });
        }
    }, [formUpdate, implementation, announcementTypes, announcementState, bannerMetaDefault]);

    useEffect(() => {
        fetchImplementation();
    }, [fetchImplementation]);

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
                <div className="breadcrumb-item active">Content Management System</div>
            </div>

            <div className="card">
                <form className="form" onSubmit={form.submit}>
                    <div className="card-header">
                        <div className="card-title flex flex-grow">{translate('implementation_edit.header.title')}</div>
                        <div className="card-header-filters">
                            <div className="block block-inline-filters">
                                <a
                                    className="button button-text button-sm"
                                    href={implementation.url_webshop}
                                    target="_blank"
                                    rel="noreferrer">
                                    Open webshop
                                    <em className="mdi mdi-open-in-new icon-end" />
                                </a>

                                <StateNavLink
                                    name={'implementations-config'}
                                    params={{
                                        organizationId: activeOrganization.id,
                                        id: implementation.id,
                                    }}
                                    className="button button-default button-sm">
                                    <em className="mdi mdi-cog icon-start" />
                                    Instellingen
                                </StateNavLink>

                                <StateNavLink
                                    name={'implementations-social-media'}
                                    params={{
                                        organizationId: activeOrganization.id,
                                        id: implementation.id,
                                    }}
                                    className="button button-default button-sm">
                                    <em className="mdi mdi-share-variant-outline icon-start" />
                                    Instellingen social
                                </StateNavLink>

                                <button className="button button-primary button-sm" type="submit">
                                    {translate('funds_edit.buttons.confirm')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-padless">
                        <PhotoSelectorBanner
                            selectPhoto={(file) => selectBanner(file)}
                            templateData={bannerMeta}
                            thumbnail={bannerMedia?.sizes?.medium}
                            deletePhoto={deletePhoto}
                            setTemplateData={setBannerMeta}
                            title={form.values?.title}
                            description={form.values?.description}
                            buttonText={form.values?.banner_button_text}
                        />
                    </div>
                    <div className="card-section card-section-padless">
                        <InfoBox iconPosition={'top'} iconColor={'light'} type={'primary'} borderType={'none'}>
                            Zorg ervoor dat tekst voor iedereen leesbaar blijft door een sterk contrast tussen titels en
                            hun achtergrond te gebruiken. Volgens de verplichte toegankelijksheidsrichtlijnen moet de
                            contrastverhouding ten minste 4,5:1 zijn voor normale tekst en 3:1 voor grote tekst. Plaats
                            tekst niet direct op drukke of kleurrijke afbeeldingen en gebruik overlays of effen
                            achtergronden om de duidelijkheid te verbeteren. Dit zorgt voor toegankelijkheid voor
                            gebruikers met visuele beperkingen en draagt bij aan de gebruiksvriendelijkheid van de
                            website.
                        </InfoBox>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-lg-9">
                                <div className="form-group form-group-inline form-group-inline-xl">
                                    <label className="form-label" htmlFor="title">
                                        {translate('implementation_edit.labels.header_title')}
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        className="form-control"
                                        placeholder="Titel"
                                        value={form.values?.title || ''}
                                        onChange={(e) => form.update({ title: e.target.value })}
                                    />
                                    <FormError error={form.errors.title} />
                                </div>
                                <div className="form-group form-group-inline form-group-inline-xl">
                                    <label className="form-label" htmlFor="title">
                                        {translate('implementation_edit.labels.header_description')}
                                    </label>

                                    <div className="form-offset">
                                        <MarkdownEditor
                                            alignment={form.values?.description_alignment}
                                            placeholder={'Omschrijving'}
                                            extendedOptions={true}
                                            allowAlignment={true}
                                            value={form.values?.description_html}
                                            onChange={(value) => {
                                                form.update({ description: value });
                                            }}
                                        />
                                    </div>
                                    <FormError error={form.errors.description} />
                                </div>

                                <div className="form-group form-group-inline form-group-inline-xl tooltipped">
                                    <label className="form-label" htmlFor="page_title_suffix">
                                        {translate('implementation_edit.labels.page_title_suffix')}
                                    </label>
                                    <div className="form-offset">
                                        <FormGroupInfo
                                            info={
                                                <Fragment>
                                                    Het eerste deel van de paginatitel, zichtbaar in het browsertabblad,
                                                    is standaard ingesteld. Het tweede deel kan worden aangepast. De
                                                    titel mag maximaal 60 tekens lang zijn
                                                </Fragment>
                                            }>
                                            <input
                                                id="page_title_suffix"
                                                type="text"
                                                className="form-control"
                                                placeholder="Browser tab postfix"
                                                value={form.values?.page_title_suffix || ''}
                                                onChange={(e) => form.update({ page_title_suffix: e.target.value })}
                                            />
                                        </FormGroupInfo>
                                        <FormError error={form.errors.page_title_suffix} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-lg-9">
                                <FormGroup
                                    inline={true}
                                    inlineSize={'xl'}
                                    label={'Button'}
                                    error={form.errors?.banner_button}
                                    input={() => (
                                        <ToggleControl
                                            checked={form.values?.banner_button}
                                            onChange={(e) => {
                                                form.update({ banner_button: e.target.checked });
                                            }}
                                        />
                                    )}
                                />
                                <FormGroup
                                    inline={true}
                                    inlineSize={'xl'}
                                    required={true}
                                    label={'Button text'}
                                    error={form.errors?.banner_button_text}
                                    input={(id) => (
                                        <input
                                            id={id}
                                            type="text"
                                            className="form-control"
                                            placeholder="Button text"
                                            value={form.values?.banner_button_text || ''}
                                            onChange={(e) => form.update({ banner_button_text: e.target.value })}
                                        />
                                    )}
                                />
                                <FormGroup
                                    inline={true}
                                    inlineSize={'xl'}
                                    required={true}
                                    label={'Button link'}
                                    error={form.errors?.banner_button_url}
                                    input={(id) => (
                                        <input
                                            id={id}
                                            type="text"
                                            className="form-control"
                                            placeholder="Button link"
                                            value={form.values?.banner_button_url || ''}
                                            onChange={(e) => form.update({ banner_button_url: e.target.value })}
                                        />
                                    )}
                                />
                                <FormGroup
                                    inline={true}
                                    inlineSize={'xl'}
                                    required={true}
                                    label={'Open knop koppeling in'}
                                    error={form.errors?.banner_button_target}
                                    input={() => (
                                        <SelectControl
                                            value={form.values?.banner_button_target}
                                            propKey={'value'}
                                            propValue={'label'}
                                            options={[
                                                { label: 'Zelfde tabblad', value: 'self' },
                                                { label: 'Nieuw tabblad', value: '_blank' },
                                            ]}
                                            onChange={(banner_button_target: 'self' | '_blank') => {
                                                form.update({ banner_button_target });
                                            }}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-lg-9">
                                <div className="form-group form-group-inline form-group-inline-xl tooltipped">
                                    <label className="form-label" htmlFor="info_url">
                                        {translate('implementation_edit.labels.communication')}
                                    </label>
                                    <div className="form-offset">
                                        <div className="form-group-info">
                                            <div className="form-group-info-control">
                                                <SelectControl
                                                    className="form-control"
                                                    propKey="value"
                                                    propValue="label"
                                                    allowSearch={false}
                                                    options={communicationTypes}
                                                    value={form.values?.informal_communication}
                                                    onChange={(value?: boolean) => {
                                                        form.update({ informal_communication: value });
                                                    }}
                                                />
                                            </div>

                                            <div className="form-group-info-button">
                                                <div
                                                    className={`button button-default button-icon pull-left ${
                                                        showInfoBlock ? 'active' : ''
                                                    }`}
                                                    onClick={() => setShowInfoBlock(!showInfoBlock)}>
                                                    <em className="mdi mdi-information" />
                                                </div>
                                            </div>
                                        </div>

                                        {showInfoBlock && (
                                            <div className="block block-info-box block-info-box-primary">
                                                <div className="info-box-icon mdi mdi-information" />
                                                <div className="info-box-content">
                                                    <div className="block block-markdown">
                                                        <p>
                                                            Kies de aanspreekvorm. Deze aanspreekvorm staat in teksten
                                                            op de website en in de berichten die het systeem verstuurt.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <FormError error={form.errors.informal_communication} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-lg-9">
                                <div className="form-group form-group-inline form-group-inline-xl tooltipped">
                                    <label className="form-label">
                                        {translate('implementation_edit.labels.announcement_show')}
                                    </label>
                                    <div className="form-offset">
                                        <SelectControl
                                            className="form-control"
                                            propKey="value"
                                            propValue="label"
                                            allowSearch={false}
                                            options={announcementState}
                                            value={form.values?.announcement.active}
                                            onChange={(value?: boolean) => {
                                                form.update({
                                                    announcement: { ...form.values.announcement, active: value },
                                                });
                                            }}
                                        />
                                        <FormError error={form.errors['announcement.active']} />
                                    </div>
                                </div>

                                {form.values?.announcement.active && (
                                    <Fragment>
                                        <div className="form-group form-group-inline form-group-inline-xl">
                                            <label className="form-label">
                                                {translate('implementation_edit.labels.announcement_type')}
                                            </label>

                                            <SelectControl
                                                className="form-control"
                                                propKey="value"
                                                propValue="label"
                                                allowSearch={false}
                                                options={announcementTypes}
                                                value={form.values?.announcement.type}
                                                onChange={(value?: string) => {
                                                    form.update({
                                                        announcement: { ...form.values.announcement, type: value },
                                                    });
                                                }}
                                            />
                                            <FormError error={form.errors['announcement.type']} />
                                        </div>

                                        <div className="form-group form-group-inline form-group-inline-xl">
                                            <label className="form-label" htmlFor="announcement_title">
                                                {translate('implementation_edit.labels.announcement_title')}
                                            </label>
                                            <input
                                                id="announcement_title"
                                                type="text"
                                                className="form-control"
                                                placeholder="Titel"
                                                value={form.values?.announcement.title || ''}
                                                onChange={(e) => {
                                                    form.update({
                                                        announcement: {
                                                            ...form.values.announcement,
                                                            title: e.target.value,
                                                        },
                                                    });
                                                }}
                                            />
                                            <FormError error={form.errors['announcement.title']} />
                                        </div>

                                        <div className="form-group form-group-inline form-group-inline-xl">
                                            <label className="form-label" htmlFor="title">
                                                {translate('implementation_edit.labels.announcement_description')}
                                            </label>

                                            <div className="form-offset">
                                                <MarkdownEditor
                                                    value={form.values?.announcement.description_html}
                                                    placeholder={'Beschrijving'}
                                                    onChange={(value) => {
                                                        form.update({
                                                            announcement: {
                                                                ...form.values.announcement,
                                                                description: value,
                                                            },
                                                        });
                                                    }}
                                                />
                                            </div>
                                            <FormError error={form.errors['announcement.description']} />
                                        </div>

                                        <div className="form-group form-group-inline form-group-inline-xl tooltipped">
                                            <label className="form-label">
                                                {translate('implementation_edit.labels.announcement_expire')}
                                            </label>

                                            <SelectControl
                                                className="form-control"
                                                propKey="value"
                                                propValue="label"
                                                allowSearch={false}
                                                options={announcementExpireOptions}
                                                value={form.values?.announcement.expire}
                                                onChange={(value?: boolean) => {
                                                    form.update({
                                                        announcement: {
                                                            ...form.values.announcement,
                                                            expire: value,
                                                            expire_at: value
                                                                ? null
                                                                : form.values.announcement.expire_at,
                                                        },
                                                    });
                                                }}
                                            />
                                        </div>

                                        {form.values?.announcement.expire && (
                                            <div className="form-group form-group-inline form-group-inline-xl">
                                                <label className="form-label">
                                                    {translate('implementation_edit.labels.announcement_expire_at')}
                                                </label>
                                                <div className="form-offset">
                                                    <DatePickerControl
                                                        dateFormat={'dd-MM-yyyy'}
                                                        value={dateParse(form.values?.announcement.expire_at)}
                                                        placeholder="dd-MM-jjjj"
                                                        onChange={(value) => {
                                                            form.update({
                                                                announcement: {
                                                                    ...form.values.announcement,
                                                                    expire_at: dateFormat(value),
                                                                },
                                                            });
                                                        }}
                                                    />
                                                    <FormError error={form.errors['announcement.expire_at']} />
                                                </div>
                                            </div>
                                        )}

                                        <div className="form-group form-group-inline form-group-inline-xl tooltipped">
                                            <label className="form-label">
                                                {translate('implementation_edit.labels.announcement_replace')}
                                            </label>
                                            <div className="form-offset">
                                                <CheckboxControl
                                                    title={'Herstel aankondiging indien aanvrager opnieuw inlogt.'}
                                                    checked={form.values?.announcement.replace}
                                                    onChange={(e) => {
                                                        form.update({
                                                            announcement: {
                                                                ...form.values.announcement,
                                                                replace: e.target.checked,
                                                            },
                                                        });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </Fragment>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-lg-9">
                                <FormGroup
                                    inline={true}
                                    inlineSize={'xl'}
                                    label={translate('implementation_edit.labels.show_privacy_checkbox')}
                                    error={form.errors.show_privacy_checkbox}
                                    input={(id) => (
                                        <FormGroupInfo
                                            info={
                                                <Fragment>
                                                    <p>
                                                        Activeer deze instelling als de gebruiker akkoord moet gaan met
                                                        de privacyvoorwaarden op de website. Op de aanmeldpagina
                                                        verschijnt een checkbox.
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
                                                options={privacyAndTermsState}
                                                value={form.values?.show_privacy_checkbox}
                                                onChange={(value?: boolean) => {
                                                    form.update({ show_privacy_checkbox: value });
                                                }}
                                            />
                                        </FormGroupInfo>
                                    )}
                                />
                                <FormGroup
                                    inline={true}
                                    inlineSize={'xl'}
                                    label={translate('implementation_edit.labels.show_terms_checkbox')}
                                    error={form.errors.show_terms_checkbox}
                                    input={(id) => (
                                        <FormGroupInfo
                                            info={
                                                <Fragment>
                                                    <p>
                                                        Activeer deze instelling als de gebruiker akkoord moet gaan met
                                                        de voorwaarden van de website. Op de aanmeldpagina verschijnt
                                                        een checkbox.
                                                    </p>
                                                    <p>
                                                        <strong>Belangrijk!</strong> Zorg ervoor dat de voorwaarden
                                                        pagina is ingesteld in het CMS, zodat de link naar deze pagina
                                                        goed werkt.
                                                    </p>
                                                </Fragment>
                                            }>
                                            <SelectControl
                                                id={id}
                                                className="form-control"
                                                propKey="value"
                                                propValue="label"
                                                allowSearch={false}
                                                options={privacyAndTermsState}
                                                value={form.values?.show_terms_checkbox}
                                                onChange={(value?: boolean) => {
                                                    form.update({ show_terms_checkbox: value });
                                                }}
                                            />
                                        </FormGroupInfo>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="button-group flex-center">
                            <StateNavLink
                                name={'implementations-view'}
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

            <ImplementationsCmsPages implementation={implementation} />
        </Fragment>
    );
}
