import React, { useCallback, useState, useRef, useEffect, ChangeEvent } from 'react';
import ModalPhotoUploader from '../../modals/ModalPhotoUploader';
import { uniqueId } from 'lodash';
import useOpenModal from '../../../hooks/useOpenModal';
import useAssetUrl from '../../../hooks/useAssetUrl';
import useTranslate from '../../../hooks/useTranslate';

export default function PhotoSelector({
    id,
    type,
    label,
    description,
    disabled,
    thumbnail,
    defaultThumbnail,
    template = 'default',
    selectPhoto,
    resetPhoto,
}: {
    id?: string;
    type: string;
    label?: string;
    description?: string;
    disabled?: boolean;
    thumbnail?: string;
    defaultThumbnail?: string;
    template?: 'default' | 'photo-selector-sign_up' | 'photo-selector-notifications';
    selectPhoto: (file: Blob) => void;
    resetPhoto?: () => void;
}) {
    const [selectorId] = useState(uniqueId());

    const translate = useTranslate();
    const [thumbnailValue, setThumbnailValue] = useState(thumbnail);
    const inputRef = useRef<HTMLInputElement>(null);

    const assetUrl = useAssetUrl();
    const openModal = useOpenModal();

    const onPhotoChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
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

    useEffect(() => {
        setThumbnailValue(thumbnail);
    }, [thumbnail]);

    if (template == 'default') {
        return (
            <div className="block block-photo-selector">
                <label htmlFor={id ? id : `photo_selector_${selectorId}`} className="photo-img">
                    <img src={thumbnailValue || assetUrl('/assets/img/placeholders/image-thumbnail.png')} alt="" />
                </label>
                <div className="photo-details">
                    <input type="file" hidden={true} accept={'image/*'} ref={inputRef} onChange={onPhotoChange} />
                    <div className="photo-label">{label || translate('photo_selector.labels.image')}</div>
                    {description && <div className="photo-description">{description}</div>}

                    <button
                        id={id ? id : `photo_selector_${selectorId}`}
                        type={'button'}
                        className="button button-primary"
                        disabled={disabled}
                        onClick={() => inputRef.current?.click()}>
                        <em className="mdi mdi-upload icon-start" />
                        {translate('photo_selector.buttons.change')}
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
                    <div className="photo-label">{label ? label : translate('photo_selector.labels.image')}</div>
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

    if (template == 'photo-selector-notifications') {
        return (
            <div className="block block-photo-selector-notifications">
                <label
                    htmlFor={id ? id : `photo_selector_${selectorId}`}
                    className="photo-selector-notifications-media">
                    <input type="file" hidden={true} accept={'image/*'} ref={inputRef} onChange={onPhotoChange} />
                    <img
                        src={
                            thumbnailValue ||
                            defaultThumbnail ||
                            assetUrl('/assets/img/placeholders/photo-selector.svg')
                        }
                        alt=""
                    />
                </label>

                <div className="photo-details">
                    <div className="photo-selector-notifications-hint">
                        De afbeelding dient vierkant te zijn met een afmeting van bijvoorbeeld 400x400px.
                        <br />
                        Toegestaande formaten: JPG, PNG
                    </div>
                    <div className="button-group">
                        <button
                            id={id ? id : `photo_selector_${selectorId}`}
                            type={'button'}
                            className="button button-primary button-sm"
                            disabled={disabled}
                            onClick={() => inputRef.current?.click()}>
                            <i className="icon-start mdi mdi-upload" />
                            Afbeelding uploaden
                        </button>

                        {thumbnailValue && (
                            <button
                                className="button button-default button-sm"
                                onClick={() => {
                                    setThumbnailValue(null);
                                    resetPhoto();
                                }}>
                                <i className="icon-start mdi mdi-refresh" />
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
