import React, { useMemo } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import Organization from '../../props/models/Organization';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormError from '../elements/forms/errors/FormError';
import { ModalButton } from './elements/ModalButton';
import { ResponseError } from '../../props/ApiResponses';
import SelectControl from '../elements/select-control/SelectControl';
import SelectControlOptions from '../elements/select-control/templates/SelectControlOptions';
import ImplementationSocialMedia from '../../props/models/ImplementationSocialMedia';
import Implementation from '../../props/models/Implementation';
import useImplementationSocialMediaService from '../../services/ImplementationSocialMediaService';
import usePushSuccess from '../../hooks/usePushSuccess';
import usePushDanger from '../../hooks/usePushDanger';

export default function ModalSocialMediaEdit({
    modal,
    socialMedia,
    className,
    onSubmit,
    usedTypes,
    cancelButton,
    organization,
    implementation,
}: {
    modal: ModalState;
    socialMedia?: ImplementationSocialMedia;
    className?: string;
    onSubmit?: () => void;
    usedTypes: Array<string>;
    cancelButton?: ModalButton;
    organization: Organization;
    implementation: Implementation;
}) {
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();

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
            const promise = socialMedia
                ? implementationSocialMediaService.update(organization.id, implementation.id, socialMedia.id, values)
                : implementationSocialMediaService.store(organization.id, implementation.id, values);

            promise
                .then(() => {
                    pushSuccess('Opgeslagen!');
                    onSubmit();
                    modal.close();
                })
                .catch((res: ResponseError) => {
                    pushDanger('Error!', res?.data?.message);
                    form.setErrors(res.data.errors);
                })
                .finally(() => form.setIsLocked(false));
        },
    );

    return (
        <div
            className={classList([
                'modal',
                'modal-md',
                'modal-animated',
                'modal-notification',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />
            <form className="modal-window form" onSubmit={form.submit}>
                <div className="modal-close mdi mdi-close" onClick={modal.close} />
                <div className="modal-header">Social media toevoegen</div>

                <div className="modal-body modal-body-visible">
                    <div className="modal-section">
                        <div className="form-group">
                            <label htmlFor="" className="form-label form-label-required">
                                Kies soort
                            </label>
                            <SelectControl
                                value={form.values.type}
                                propKey={'key'}
                                propValue={'name'}
                                onChange={(type?: string) => form.update({ type })}
                                options={socialMediaTypes}
                                optionsComponent={SelectControlOptions}
                            />
                            <FormError error={form.errors.type} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="url" className="form-label form-label-required">
                                URL
                            </label>
                            <input
                                id="url"
                                type="text"
                                value={form.values.url}
                                placeholder="URL"
                                className="form-control"
                                onChange={(e) => form.update({ url: e.target.value })}
                            />
                            <FormError error={form.errors.url} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="url" className="form-label">
                                Titel
                            </label>
                            <input
                                id="url"
                                type="text"
                                value={form.values.title}
                                placeholder="Titel"
                                className="form-control"
                                onChange={(e) => form.update({ title: e.target.value })}
                            />
                            <FormError error={form.errors.title} />
                        </div>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <ModalButton type="default" button={{ onClick: modal.close, ...cancelButton }} text={'Sluiten'} />
                    <ModalButton type="primary" button={{ onClick: form.submit }} text={'Bevestigen'} submit={true} />
                </div>
            </form>
        </div>
    );
}
