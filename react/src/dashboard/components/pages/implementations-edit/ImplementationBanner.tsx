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
import { useMediaService } from '../../../services/MediaService';
import useOpenModal from '../../../hooks/useOpenModal';
import MarkdownEditor from '../../elements/forms/markdown-editor/MarkdownEditor';
import SelectControl from '../../elements/select-control/SelectControl';
import PhotoSelectorData from '../../elements/photo-selector/types/PhotoSelectorData';
import useTranslate from '../../../hooks/useTranslate';
import FormGroup from '../../elements/forms/elements/FormGroup';
import PhotoSelectorBanner from '../../elements/photo-selector/PhotoSelectorBanner';
import ToggleControl from '../../elements/forms/controls/ToggleControl';
import ModalNotification from '../../modals/ModalNotification';
import usePushApiError from '../../../hooks/usePushApiError';
import InfoBox from '../../elements/info-box/InfoBox';
import { useNavigateState } from '../../../modules/state_router/Router';
import ImplementationsRootBreadcrumbs from '../implementations/elements/ImplementationsRootBreadcrumbs';
import FormPaneContainer from '../../elements/forms/elements/FormPaneContainer';
import FormPane from '../../elements/forms/elements/FormPane';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function ImplementationBanner() {
    const { id } = useParams();
    const activeOrganization = useActiveOrganization();

    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();

    const mediaService = useMediaService();
    const implementationService = useImplementationService();

    const [bannerMedia, setBannerMedia] = useState(null);
    const [implementation, setImplementation] = useState<Implementation>(null);

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
        banner_button?: boolean;
        banner_button_target?: 'self' | '_blank';
        banner_button_type?: 'color' | 'white';
        banner_button_text?: string;
        banner_button_url?: string;
    }>(null, (values) => {
        const data = { ...values };

        const { overlay_enabled, overlay_type, overlay_opacity } = bannerMeta;
        const { banner_collapse, banner_wide, banner_position } = bannerMeta;
        const { banner_color, banner_button_type, banner_background, banner_background_mobile } = bannerMeta;

        if (data.banner_media_uid === implementation.banner_media_uid) {
            delete data.banner_media_uid;
        }

        setProgress(0);

        implementationService
            .updateCMS(activeOrganization.id, implementation.id, {
                ...data,
                ...{ overlay_enabled, overlay_type, overlay_opacity },
                ...{ banner_collapse, banner_wide, banner_position },
                ...{ banner_color, banner_button_type, banner_background, banner_background_mobile },
            })
            .then(() => {
                pushSuccess('Opgeslagen!');
                navigateState(DashboardRoutes.IMPLEMENTATION, {
                    organizationId: activeOrganization.id,
                    id: id,
                });
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
                    title={'Weet u zeker dat u deze foto wilt verwijderen?'}
                    description={
                        'Wanneer u de foto verwijderd kunt u dit niet ongedaan maken. Bedenk daarom goed of u deze actie wilt verrichten.'
                    }
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
    }, [openModal, mediaService, formValues?.banner_media_uid, pushApiError, formUpdate]);

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => setImplementation(res.data.data))
            .catch(pushApiError);
    }, [activeOrganization.id, implementationService, id, pushApiError]);

    useEffect(() => {
        if (implementation) {
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
                banner_button: implementation.banner_button,
                banner_button_text: implementation.banner_button_text,
                banner_button_url: implementation.banner_button_url,
                banner_button_target: implementation.banner_button_target,
                banner_media_uid: implementation.banner_media_uid,
            });
        }
    }, [bannerMetaDefault, formUpdate, implementation]);

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
                <div className="breadcrumb-item active">Homepagina banner</div>
            </div>

            <form className="form card" onSubmit={form.submit}>
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
                                name={DashboardRoutes.IMPLEMENTATION_CONFIG}
                                params={{
                                    organizationId: activeOrganization.id,
                                    id: implementation.id,
                                }}
                                className="button button-default button-sm">
                                <em className="mdi mdi-cog icon-start" />
                                Instellingen
                            </StateNavLink>
                            <StateNavLink
                                name={DashboardRoutes.IMPLEMENTATION_SOCIAL_MEDIA}
                                params={{
                                    organizationId: activeOrganization.id,
                                    id: implementation.id,
                                }}
                                className="button button-default button-sm">
                                <em className="mdi mdi-share-variant-outline icon-start" />
                                Socialmediakanalen
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
                        thumbnail={bannerMedia?.sizes?.large}
                        deletePhoto={deletePhoto}
                        setTemplateData={setBannerMeta}
                        title={form.values?.title}
                        description={form.values?.description}
                        buttonText={form.values?.banner_button_text}
                        organization={activeOrganization}
                        implementation={implementation}
                        disabled={false}
                        showEdit={false}
                    />
                </div>

                <FormPaneContainer className="card-section">
                    <InfoBox type={'primary'}>
                        Zorg dat tekst goed leesbaar is met genoeg contrast tussen tekst en achtergrond. Gebruik geen
                        drukke of felle afbeeldingen achter de tekst. Zo blijft de website duidelijk en toegankelijk
                        voor iedereen.
                    </InfoBox>

                    <FormPane title={'Tekst en paginatitel'}>
                        <FormGroup
                            className="form-group"
                            label={translate('implementation_edit.labels.header_title')}
                            error={form.errors?.title}
                            input={(id) => (
                                <input
                                    id={id}
                                    type="text"
                                    className="form-control"
                                    placeholder="Titel"
                                    value={form.values?.title || ''}
                                    onChange={(e) => form.update({ title: e.target.value })}
                                />
                            )}
                        />
                        <FormGroup
                            className="form-group"
                            label={translate('implementation_edit.labels.header_description')}
                            error={form.errors?.description}
                            input={() =>
                                form.values?.description_alignment && (
                                    <MarkdownEditor
                                        alignment={form.values?.description_alignment}
                                        placeholder={'Omschrijving'}
                                        extendedOptions={true}
                                        allowAlignment={true}
                                        value={form.values?.description_html}
                                        onChange={(description) => form.update({ description })}
                                        onChangeAlignment={(description_alignment) => {
                                            form.update({ description_alignment });
                                        }}
                                    />
                                )
                            }
                        />

                        <FormGroup
                            className="form-group"
                            label={translate('implementation_edit.labels.page_title_suffix')}
                            error={form.errors.page_title_suffix}
                            info={
                                <Fragment>
                                    Het eerste deel van de paginatitel, zichtbaar in het browsertabblad, is standaard
                                    ingesteld. Het tweede deel kan worden aangepast. De titel mag maximaal 60 tekens
                                    lang zijn
                                </Fragment>
                            }
                            input={(id) => (
                                <input
                                    id={id}
                                    type="text"
                                    className="form-control"
                                    placeholder="Achtervoegsel browsertabblad"
                                    value={form.values?.page_title_suffix || ''}
                                    onChange={(e) => form.update({ page_title_suffix: e.target.value })}
                                />
                            )}
                        />
                    </FormPane>

                    <FormPane title={'Actieknop'}>
                        <FormGroup
                            label={'Knop'}
                            error={form.errors?.banner_button}
                            input={(id) => (
                                <ToggleControl
                                    id={id}
                                    checked={form.values?.banner_button}
                                    onChange={(e) => {
                                        form.update({ banner_button: e.target.checked });
                                    }}
                                />
                            )}
                        />
                        <FormGroup
                            required={true}
                            label={'Knoptekst'}
                            error={form.errors?.banner_button_text}
                            input={(id) => (
                                <input
                                    id={id}
                                    type="text"
                                    className="form-control"
                                    placeholder="Knoptekst"
                                    value={form.values?.banner_button_text || ''}
                                    onChange={(e) => form.update({ banner_button_text: e.target.value })}
                                />
                            )}
                        />
                        <FormGroup
                            required={true}
                            label={'Knoplink'}
                            error={form.errors?.banner_button_url}
                            input={(id) => (
                                <input
                                    id={id}
                                    type="text"
                                    className="form-control"
                                    placeholder="Knoplink"
                                    value={form.values?.banner_button_url || ''}
                                    onChange={(e) => form.update({ banner_button_url: e.target.value })}
                                />
                            )}
                        />
                        <FormGroup
                            required={true}
                            label={'Open knop koppeling in'}
                            error={form.errors?.banner_button_target}
                            input={(id) => (
                                <SelectControl
                                    id={id}
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
        </Fragment>
    );
}
