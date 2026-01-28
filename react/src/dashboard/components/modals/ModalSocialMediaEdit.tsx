import React, { useMemo } from 'react';
import classNames from 'classnames';
import { ModalState } from '../../modules/modals/context/ModalContext';
import Organization from '../../props/models/Organization';
import useFormBuilder from '../../hooks/useFormBuilder';
import { ModalButton } from './elements/ModalButton';
import { ResponseError } from '../../props/ApiResponses';
import SelectControl from '../elements/select-control/SelectControl';
import ImplementationSocialMedia from '../../props/models/ImplementationSocialMedia';
import Implementation from '../../props/models/Implementation';
import useImplementationSocialMediaService from '../../services/ImplementationSocialMediaService';
import usePushSuccess from '../../hooks/usePushSuccess';
import useSetProgress from '../../hooks/useSetProgress';
import usePushApiError from '../../hooks/usePushApiError';
import FormGroup from '../elements/forms/elements/FormGroup';

export default function ModalSocialMediaEdit({
    modal,
    onSubmit,
    className,
    usedTypes,
    socialMedia,
    organization,
    implementation,
}: {
    modal: ModalState;
    onSubmit?: () => void;
    className?: string;
    usedTypes: Array<string>;
    socialMedia?: ImplementationSocialMedia;
    organization: Organization;
    implementation: Implementation;
}) {
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();
    const setProgress = useSetProgress();

    const implementationSocialMediaService = useImplementationSocialMediaService();

    const socialMediaTypes = useMemo(() => {
        return [
            { key: null, name: 'Selecteer type' },
            { key: 'facebook', name: 'Facebook' },
            { key: 'twitter', name: 'Twitter' },
            { key: 'youtube', name: 'Youtube' },
        ].filter((type) => !usedTypes.includes(type.key) || type.key == socialMedia?.type);
    }, [socialMedia?.type, usedTypes]);

    const form = useFormBuilder<{
        url?: string;
        type?: string;
        title?: string;
    }>(
        {
            url: socialMedia?.url || '',
            type: socialMedia?.type || null,
            title: socialMedia?.title || '',
        },
        (values) => {
            setProgress(0);

            const promise = socialMedia
                ? implementationSocialMediaService.update(organization.id, implementation.id, socialMedia.id, values)
                : implementationSocialMediaService.store(organization.id, implementation.id, values);

            promise
                .then(() => {
                    pushSuccess('Opgeslagen!');
                    onSubmit();
                    modal.close();
                })
                .catch((err: ResponseError) => {
                    pushApiError(err);
                    form.setErrors(err.data.errors);
                })
                .finally(() => {
                    form.setIsLocked(false);
                    setProgress(100);
                });
        },
    );

    return (
        <div
            className={classNames(
                'modal',
                'modal-md',
                'modal-animated',
                'modal-notification',
                modal.loading && 'modal-loading',
                className,
            )}>
            <div className="modal-backdrop" onClick={modal.close} />
            <form className="modal-window form" onSubmit={form.submit}>
                <div className="modal-close mdi mdi-close" onClick={modal.close} />
                <div className="modal-header">Social media toevoegen</div>

                <div className="modal-body modal-body-visible">
                    <div className="modal-section">
                        <FormGroup
                            required={true}
                            label="Kies soort"
                            error={form.errors.type}
                            input={(id) => (
                                <SelectControl
                                    id={id}
                                    value={form.values.type}
                                    propKey={'key'}
                                    propValue={'name'}
                                    onChange={(type?: string) => form.update({ type })}
                                    options={socialMediaTypes}
                                />
                            )}
                        />

                        <FormGroup
                            required={true}
                            label="URL"
                            error={form.errors.url}
                            input={(id) => (
                                <input
                                    id={id}
                                    type="text"
                                    value={form.values.url}
                                    placeholder="URL"
                                    className="form-control"
                                    onChange={(e) => form.update({ url: e.target.value })}
                                />
                            )}
                        />

                        <FormGroup
                            label="Titel"
                            error={form.errors.title}
                            input={(id) => (
                                <input
                                    id={id}
                                    type="text"
                                    value={form.values.title}
                                    placeholder="Titel"
                                    className="form-control"
                                    onChange={(e) => form.update({ title: e.target.value })}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <ModalButton type="default" button={{ onClick: modal.close }} text={'Sluiten'} />
                    <ModalButton type="primary" button={{ onClick: form.submit }} text={'Bevestigen'} submit={true} />
                </div>
            </form>
        </div>
    );
}
