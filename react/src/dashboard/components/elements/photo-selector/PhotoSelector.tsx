import React, { useCallback, useState, useRef, Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ModalPhotoUploader from '../../modals/ModalPhotoUploader';
import { uniqueId } from 'lodash';
import useOpenModal from '../../../hooks/useOpenModal';
import useAssetUrl from '../../../hooks/useAssetUrl';
import Media from '../../../props/models/Media';

export interface TemplateData {
    overlay_type: string;
    overlay_enabled: boolean;
    overlay_opacity: string;
    auto_text_color: boolean;
    header_text_color: string;
    mediaLoading: boolean;
    opacityOptions: Array<{
        value: string;
        label: string;
    }>;
    headerTextColors: Array<{
        value: string;
        label: string;
    }>;
    patterns: Array<{
        value: string;
        label: string;
    }>;
    media?: Media;
}

export default function PhotoSelector({
    id,
    type,
    label,
    description,
    disabled,
    thumbnail,
    template = 'default',
    templateData,
    updateTemplateData,
    selectPhoto,
    resetPhoto,
}: {
    id?: string;
    type: string;
    label?: string;
    description?: string;
    disabled?: boolean;
    thumbnail?: string;
    template?: 'default' | 'photo-selector-sign_up' | 'photo-selector-banner';
    templateData?: TemplateData;
    updateTemplateData?: (data: TemplateData) => void;
    selectPhoto: (file: Blob) => void;
    resetPhoto?: () => void;
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

    useEffect(() => setThumbnailValue(thumbnail), [thumbnail]);

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

    if (template === 'photo-selector-banner') {
        return (
            <div
                className="block block-banner-picker"
                style={{
                    backgroundImage: 'url(' + (thumbnailValue || './assets/img/placeholders/photo-selector.svg') + ')',
                }}>
                {templateData.overlay_enabled && (
                    <div
                        className={`picker-overlay ${
                            templateData.overlay_type !== 'color' ? 'picker-overlay-pattern' : ''
                        }`}
                        style={{
                            backgroundImage:
                                templateData.overlay_type !== 'color'
                                    ? `url(${assetUrl(
                                          '/assets/img/banner-patterns/' + templateData.overlay_type + '.svg',
                                      )})`
                                    : 'url()',
                            opacity: parseFloat(templateData.overlay_opacity) / 100,
                        }}
                    />
                )}

                <div className="picker-dark">
                    <div className="flex">
                        <div className="flex flex-grow">
                            <div className="checkbox checkbox-narrow">
                                <input
                                    type="checkbox"
                                    id="auto_text_color"
                                    checked={templateData.auto_text_color}
                                    onChange={(e) =>
                                        updateTemplateData({
                                            ...templateData,
                                            auto_text_color: e.target.checked,
                                        })
                                    }
                                />
                                <label className="checkbox-label" htmlFor="auto_text_color">
                                    <div className="checkbox-box">
                                        <em className="mdi mdi-check-bold" />
                                    </div>
                                    <div className="flex flex-grow">Auto tekstkleur</div>
                                </label>
                            </div>

                            <div className="checkbox checkbox-narrow">
                                <input
                                    type="checkbox"
                                    id="overlay_enabled"
                                    checked={templateData.overlay_enabled}
                                    onChange={(e) =>
                                        updateTemplateData({
                                            ...templateData,
                                            overlay_enabled: e.target.checked,
                                        })
                                    }
                                />
                                <label className="checkbox-label" htmlFor="overlay_enabled">
                                    <div className="checkbox-box">
                                        <em className="mdi mdi-check-bold" />
                                    </div>
                                    <div className="flex flex-grow">Gebruik een overlay</div>
                                </label>
                            </div>
                        </div>

                        {!templateData.auto_text_color && (
                            <div className="picker-select">
                                <label className="picker-select-label" htmlFor="headerTextColor">
                                    Tekstkleur:
                                </label>
                                <select
                                    className="picker-select-input"
                                    value={templateData.header_text_color}
                                    onChange={(e) =>
                                        updateTemplateData({
                                            ...templateData,
                                            header_text_color: e.target.value,
                                        })
                                    }>
                                    {templateData.headerTextColors.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {templateData.overlay_enabled && (
                            <Fragment>
                                <div className="picker-select">
                                    <label className="picker-select-label" htmlFor="overlayPattern">
                                        Patroon:
                                    </label>
                                    <select
                                        className="picker-select-input"
                                        value={templateData.overlay_type}
                                        onChange={(e) =>
                                            updateTemplateData({
                                                ...templateData,
                                                overlay_type: e.target.value,
                                            })
                                        }>
                                        {templateData.patterns.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="picker-select">
                                    <label className="picker-select-label" htmlFor="overlayOpacity">
                                        Transparantie:
                                    </label>
                                    <select
                                        className="picker-select-input"
                                        value={templateData.overlay_opacity}
                                        onChange={(e) =>
                                            updateTemplateData({
                                                ...templateData,
                                                overlay_opacity: e.target.value,
                                            })
                                        }>
                                        {templateData.opacityOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </Fragment>
                        )}
                    </div>
                </div>

                <div className="picker-content">
                    <input type="file" hidden={true} accept={'image/*'} ref={inputRef} onChange={onPhotoChange} />
                    <div className="flex-row">
                        <div className="flex-col">
                            <div className="mdi mdi-image-area picker-icon" />
                            <div
                                className={`picker-description picker-description-${
                                    templateData.auto_text_color
                                        ? templateData.media?.is_dark
                                            ? 'bright'
                                            : 'dark'
                                        : templateData.header_text_color
                                }`}>
                                {templateData.mediaLoading ? (
                                    <span>
                                        <div className="mdi mdi-loading mdi-spin" />
                                    </span>
                                ) : (
                                    <span>Upload hoofdfoto</span>
                                )}
                            </div>
                            <button
                                type={'button'}
                                className="button button-default"
                                disabled={disabled}
                                onClick={() => inputRef.current?.click()}>
                                Kies foto
                            </button>

                            {templateData.media && (
                                <button type={'button'} className="button button-default" onClick={() => resetPhoto()}>
                                    Ongedaan maken
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <></>;
}
