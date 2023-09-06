import React, { useCallback, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ModalPhotoUploader from '../../modals/ModalPhotoUploader';
import { uniqueId } from 'lodash';
import useOpenModal from '../../../hooks/useOpenModal';
import useAssetUrl from '../../../hooks/useAssetUrl';

export default function PhotoSelector({
    id,
    type,
    label,
    description,
    disabled,
    thumbnail,
    template = 'default',
    selectPhoto,
}: {
    id?: string;
    type: string;
    label?: string;
    description?: string;
    disabled?: boolean;
    thumbnail?: string;
    template?: 'default' | 'photo-selector-sign_up';
    selectPhoto: (file: Blob) => void;
}) {
    const [selectorId] = useState(uniqueId());

    const { t } = useTranslation();
    const [thumbnailValue, setThumbnailValue] = useState(thumbnail);
    const inputRef = useRef<HTMLInputElement>(null);

    const openModal = useOpenModal();
    const assetUrl = useAssetUrl();

    const onPhotoChange = useCallback(
        (e) => {
            const file = e.target.files[0];
            e.target.value = null;

            openModal((modal) => (
                <ModalPhotoUploader
                    type={type}
                    file={file}
                    modal={modal}
                    onSubmit={(file, presets) => {
                        const thumbnail = presets.find((preset) => preset.key == 'thumbnail');

                        selectPhoto(file);
                        setThumbnailValue(thumbnail?.data);
                    }}
                />
            ));
        },
        [openModal, selectPhoto, type],
    );

    if (template == 'default') {
        return (
            <div className="block block-photo-selector">
                <label htmlFor={id ? id : `photo_selector_${selectorId}`} className="photo-img">
                    <img src={thumbnailValue || assetUrl('/assets/img/placeholders/image-thumbnail.png')} alt="" />
                </label>
                <div className="photo-details">
                    <input type="file" hidden={true} accept={'image/*'} ref={inputRef} onChange={onPhotoChange} />
                    <div className="photo-label">{label || t('photo_selector.labels.image')}</div>
                    {description && <div className="photo-description">{description}</div>}

                    <button
                        id={id ? id : `photo_selector_${selectorId}`}
                        type={'button'}
                        className="button button-primary"
                        disabled={disabled}
                        onClick={() => inputRef.current?.click()}>
                        <em className="mdi mdi-upload icon-start" />
                        {t('photo_selector.buttons.change')}
                    </button>
                </div>
            </div>
        );
    }

    if (template == 'photo-selector-sign_up') {
        return (
            <div className="block block-photo-selector">
                <label htmlFor={id ? id : `photo_selector_${selectorId}`} className="photo-img">
                    <input type="file" hidden={true} accept={'image/*'} ref={inputRef} onChange={onPhotoChange} />
                    <img src={thumbnailValue || assetUrl('/assets/img/placeholders/photo-selector.svg')} alt="" />
                </label>
                <div className="photo-details">
                    <div className="photo-label">{label ? label : t('photo_selector.labels.image')}</div>
                    <button
                        id={id ? id : `photo_selector_${selectorId}`}
                        type={'button'}
                        className="button button-primary-outline button-sm"
                        disabled={disabled}
                        onClick={() => inputRef.current?.click()}>
                        Afbeelding uploaden
                    </button>

                    {description
                        ?.replace('<br/>', '\n')
                        .split('\n')
                        .map((line, index) => (
                            <div key={index} className="photo-description">
                                {line}
                            </div>
                        ))}
                </div>
            </div>
        );
    }

    return <></>;
}
