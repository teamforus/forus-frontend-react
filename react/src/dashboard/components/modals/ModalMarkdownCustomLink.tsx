import React, { ChangeEvent, useCallback, useRef, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import { useTranslation } from 'react-i18next';
import useFormBuilder from '../../hooks/useFormBuilder';
import { useMediaService } from '../../services/MediaService';
import { ResponseError } from '../../props/ApiResponses';
import FormError from '../elements/forms/errors/FormError';
import useSetProgress from '../../hooks/useSetProgress';

export default function ModalMarkdownCustomLink({
    type,
    modal,
    values,
    success,
    className,
}: {
    modal: ModalState;
    type: 'imageLink' | 'customLink' | 'youtubeLink';
    values: { url?: string; alt?: string; text?: string };
    success: (values: { url?: string; text?: string; uid?: string; alt?: string }) => void;
    className?: string;
}) {
    const { t } = useTranslation();
    const input = useRef(null);
    const [errors, setErrors] = useState(null);
    const mediaService = useMediaService();
    const setProgress = useSetProgress();

    const form = useFormBuilder(
        {
            ...{ url: '', alt: '', text: '', uid: null, ...values },
        },
        (values) => {
            success(values);
            modal.close();
            form.setIsLocked(false);
        },
    );

    const selectMedia = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            input.current?.remove();
            input.current = document.createElement('input');
            input.current.setAttribute('type', 'file');
            input.current.setAttribute('accept', 'image/*');
            input.current.style.display = 'none';

            input.current.addEventListener('change', (e: ChangeEvent<HTMLInputElement>) => {
                setProgress(0);

                mediaService
                    .store('cms_media', e.target.files[0], ['public'])
                    .then(
                        (res) => {
                            setErrors(errors);
                            const media = res.data.data;

                            form.update({
                                uid: media.uid,
                                url: media.sizes.public,
                            });
                        },
                        (res: ResponseError) => {
                            setErrors(res.data.errors);
                        },
                    )
                    .finally(() => setProgress(100));
            });

            input.current.click();
        },
        [errors, form, mediaService],
    );

    return (
        <div className={classList(['modal', 'modal-animated', modal.loading ? 'modal-loading' : null, className])}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <div className="modal-close mdi mdi-close" onClick={close} role="button" />
                {type == 'imageLink' && (
                    <div className="modal-header">{t('modals.modal_markdown_custom_link.header.image')}</div>
                )}

                {type == 'customLink' && (
                    <div className="modal-header">{t('modals.modal_markdown_custom_link.header.link')}</div>
                )}

                {type == 'youtubeLink' && (
                    <div className="modal-header">{t('modals.modal_markdown_custom_link.header.youtube')}</div>
                )}

                <div className="modal-body">
                    <div className="modal-section">
                        {type === 'customLink' && (
                            <div className="form-group">
                                <label className="form-label" htmlFor="link_text">
                                    {t('modals.modal_markdown_custom_link.labels.desc')}
                                </label>
                                <input
                                    type="text"
                                    id="link_text"
                                    className="form-control"
                                    value={form.values?.text || ''}
                                    onChange={(e) => form.update({ text: e.target.value })}
                                />
                            </div>
                        )}

                        {(type === 'customLink' || type === 'youtubeLink') && (
                            <div className="form-group">
                                <label className="form-label" htmlFor="link_url">
                                    {t('modals.modal_markdown_custom_link.labels.url')}
                                </label>
                                <input
                                    type="text"
                                    id="link_url"
                                    className="form-control"
                                    value={form.values?.url || ''}
                                    onChange={(e) => form.update({ url: e.target.value })}
                                />
                            </div>
                        )}

                        {type === 'imageLink' && (
                            <div className="form-group">
                                <div className="flex-row">
                                    <div className="flex-col flex-grow">
                                        <label className="form-label" htmlFor="media_url">
                                            {t('modals.modal_markdown_custom_link.labels.url_image')}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="media_url"
                                            type="text"
                                            value={form.values?.url || ''}
                                            onChange={(e) => form.update({ url: e.target.value })}
                                        />
                                        <FormError error={errors?.file} />
                                    </div>
                                    <div className="flex-col">
                                        <label className="form-label">&nbsp;</label>
                                        <button
                                            className="button button-primary nowrap"
                                            type="button"
                                            onClick={selectMedia}>
                                            <em className="mdi mdi-upload icon-start" />
                                            {t('modals.modal_markdown_custom_link.buttons.upload_image')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {type === 'imageLink' && (
                            <div className="form-group">
                                <label className="form-label" htmlFor="media_alt">
                                    {t('modals.modal_markdown_custom_link.labels.alt_text')}
                                </label>
                                <input
                                    className="form-control"
                                    id="media_alt"
                                    type="text"
                                    value={form.values.alt}
                                    onChange={(e) => form.update({ alt: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="modal-footer text-center">
                    <button className="button button-primary" type="submit">
                        {t('modal.buttons.confirm')}
                    </button>
                    <button className="button button-default" type="button" onClick={modal.close}>
                        {t('modal.buttons.close')}
                    </button>
                </div>
            </form>
        </div>
    );
}
