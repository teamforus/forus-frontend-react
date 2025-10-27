import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import Implementation from '../../../props/models/Implementation';
import PhotoSelector from '../../elements/photo-selector/PhotoSelector';
import MarkdownEditor from '../../elements/forms/markdown-editor/MarkdownEditor';
import useFormBuilder from '../../../hooks/useFormBuilder';
import Media from '../../../props/models/Media';
import { useMediaService } from '../../../services/MediaService';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushSuccess from '../../../hooks/usePushSuccess';
import { useParams } from 'react-router';
import { useNavigateState } from '../../../modules/state_router/Router';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import InfoBox from '../../elements/info-box/InfoBox';
import FormPaneContainer from '../../elements/forms/elements/FormPaneContainer';
import FormPane from '../../elements/forms/elements/FormPane';
import FormGroup from '../../elements/forms/elements/FormGroup';
import ImplementationsRootBreadcrumbs from '../implementations/elements/ImplementationsRootBreadcrumbs';

export default function ImplementationNotificationsBranding() {
    const { id } = useParams();

    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();

    const mediaService = useMediaService();
    const implementationService = useImplementationService();

    const [media, setMedia] = useState<Media>(null);
    const [mediaFile, setMediaFile] = useState<Blob>(null);
    const [implementation, setImplementation] = useState<Implementation>(null);

    const uploadMedia = useCallback(() => {
        return new Promise((resolve) => {
            if (!media && !mediaFile && implementation.email_logo) {
                return mediaService.delete(implementation.email_logo.uid).then(() => resolve(null));
            }

            if (!mediaFile) {
                return resolve(null);
            }

            setProgress(0);

            return mediaService
                .store('email_logo', mediaFile, 'thumbnail')
                .then((res) => {
                    setMedia(res.data.data);
                    setMediaFile(null);
                    resolve(res.data.data.uid);
                })
                .catch((err: ResponseError) => {
                    resolve(null);
                    pushApiError(err);
                })
                .finally(() => setProgress(100));
        });
    }, [implementation?.email_logo, media, mediaFile, mediaService, pushApiError, setProgress]);

    const form = useFormBuilder(
        {
            email_color: '',
            email_logo_uid: '',
            email_signature: '',
            email_signature_html: '',
        },
        async (values) => {
            const uid = await uploadMedia();

            setProgress(0);

            const email_color = values.email_color ? values.email_color.toUpperCase().trim() : null;
            const email_signature = values.email_signature ? values.email_signature.trim() : null;

            const data = {
                email_color: email_color && email_color != implementation.email_color_default ? email_color : null,
                email_signature:
                    email_signature && email_signature != implementation.email_signature_default
                        ? email_signature
                        : null,
                ...(uid ? { email_logo_uid: uid } : {}),
            };

            implementationService
                .updateEmailBranding(activeOrganization.id, implementation.id, data)
                .then(() => {
                    pushSuccess('Gelukt!', 'De aanpassingen zijn opgeslagen!');
                    navigateState('implementation-notifications', {
                        organizationId: activeOrganization.id,
                        id: implementation.id,
                    });
                })
                .catch((err: ResponseError) => {
                    form.setIsLocked(false);
                    form.setErrors(err.data.errors);
                    pushApiError(err);
                })
                .finally(() => setProgress(100));
        },
    );

    const { update: updateForm } = form;

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => setImplementation(res.data.data))
            .catch(pushApiError);
    }, [implementationService, activeOrganization.id, id, pushApiError]);

    useEffect(() => {
        if (implementation) {
            const { email_color, email_signature, email_color_default } = implementation;

            setMedia(implementation.email_logo);

            updateForm({
                email_color: email_color ? email_color : email_color_default,
                email_signature: email_signature ? email_signature : '',
                email_signature_html: implementation.email_signature_html,
            });
        }
    }, [implementation, updateForm]);

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
                <StateNavLink
                    name={'implementation-notifications'}
                    params={{ organizationId: activeOrganization.id, id: implementation.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    Systeemberichten
                </StateNavLink>
                <div className="breadcrumb-item active">Handtekening en huisstijl</div>
            </div>

            <div className="card card-collapsed">
                <form className="form" onSubmit={form.submit}>
                    <div className="card-header">
                        <div className="card-title">Handtekening en huisstijl</div>
                    </div>
                    <FormPaneContainer className={'card-section'}>
                        <FormPane title={'Handtekening'}>
                            <FormGroup
                                label={'Logo'}
                                error={form.errors.email_logo_uid}
                                input={() => (
                                    <PhotoSelector
                                        type="email_logo"
                                        thumbnail={media?.sizes?.thumbnail}
                                        defaultThumbnail={implementation.email_logo_default.sizes.thumbnail}
                                        selectPhoto={(file) => setMediaFile(file)}
                                        resetPhoto={() => {
                                            setMedia(null);
                                            setMediaFile(null);
                                        }}
                                        template="photo-selector-notifications"
                                        description-translate="organization_edit.labels.photo_description"
                                    />
                                )}
                            />

                            <FormGroup
                                label={'Kleur van knoppen en links in de e-mailberichten'}
                                error={form?.errors?.email_color}
                                input={(id) => (
                                    <input
                                        id={id}
                                        className="form-control"
                                        type="color"
                                        value={form.values.email_color}
                                        onChange={(e) => form.update({ email_color: e.target.value })}
                                    />
                                )}
                            />

                            <FormGroup
                                label={'Handtekening'}
                                error={form.errors?.email_signature}
                                input={() => (
                                    <Fragment>
                                        <MarkdownEditor
                                            height={200}
                                            value={form.values.email_signature_html}
                                            allowLists={false}
                                            onChange={(value) => form.update({ email_signature: value })}
                                        />

                                        <div className="form-hint">
                                            {translate('system_notifications.hints.maxlen', {
                                                attribute: 'handtekening',
                                                size: 4096,
                                            })}
                                        </div>
                                    </Fragment>
                                )}
                            />
                        </FormPane>

                        <InfoBox>{translate('system_notifications.header.tooltip')}</InfoBox>
                    </FormPaneContainer>
                    <div className="card-section">
                        <div className="button-group flex-center">
                            <StateNavLink
                                className="button button-default"
                                name={'implementation-notifications'}
                                params={{ organizationId: activeOrganization.id, id: implementation.id }}>
                                Annuleren
                            </StateNavLink>

                            <button className="button button-primary" type="submit">
                                Opslaan
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Fragment>
    );
}
