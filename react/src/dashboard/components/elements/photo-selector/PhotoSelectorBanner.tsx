import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ModalPhotoUploader from '../../modals/ModalPhotoUploader';
import useOpenModal from '../../../hooks/useOpenModal';
import useAssetUrl from '../../../hooks/useAssetUrl';
import PhotoSelectorData from './types/PhotoSelectorData';
import FormGroup from '../forms/elements/FormGroup';
import SelectControl from '../select-control/SelectControl';
import PhotoSelectorBannerControlColorPicker from './elements/PhotoSelectorBannerControlColorPicker';
import classNames from 'classnames';
import Markdown from '../../../../webshop/components/elements/markdown/Markdown';
import PhotoSelectorBannerControl from './elements/PhotoSelectorBannerControl';
import { hexToHsva } from '@uiw/color-convert';
import { useMarkdownService } from '../../../services/MarkdownService';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import Implementation from '../../../props/models/Implementation';
import Organization from '../../../props/models/Organization';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import useFileTypeValidation from '../../../services/helpers/useFileTypeValidation';
import usePushDanger from '../../../hooks/usePushDanger';

export default function PhotoSelectorBanner({
    disabled,
    thumbnail,
    templateData,
    setTemplateData,
    selectPhoto,
    deletePhoto,
    title,
    description,
    buttonText,
    showEdit,
    organization,
    implementation,
}: {
    disabled?: boolean;
    thumbnail?: string;
    templateData?: PhotoSelectorData;
    setTemplateData?: React.Dispatch<React.SetStateAction<PhotoSelectorData>>;
    selectPhoto?: (file: Blob) => void;
    deletePhoto?: () => void;
    title?: string;
    description?: string;
    buttonText?: string;
    showEdit?: boolean;
    organization: Organization;
    implementation: Implementation;
}) {
    const [thumbnailValue, setThumbnailValue] = useState(thumbnail);
    const inputRef = useRef<HTMLInputElement>(null);
    const markdownService = useMarkdownService();

    const assetUrl = useAssetUrl();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const fileTypeIsValid = useFileTypeValidation();

    const [acceptedFiles] = useState(['.apng', '.png', '.jpg', '.jpeg', '.svg', '.webp']);
    const [activeDropdown, setActiveDropdown] = useState<'style' | 'button' | 'color' | 'background' | 'overlay'>(null);
    const [descriptionPreview, setDescriptionPreview] = useState<string>(null);

    const overlayPatternUrl = useMemo(() => {
        return assetUrl(`/assets/img/banner-patterns/${templateData.overlay_type}.svg`);
    }, [assetUrl, templateData?.overlay_type]);

    const [bannerPatterns] = useState([
        { value: 'color', label: 'Kleur' },
        { value: 'lines', label: 'Lijnen' },
        { value: 'points', label: 'Punten' },
        { value: 'dots', label: 'Stippen' },
        { value: 'circles', label: 'Cirkels' },
    ]);

    const [bannerOpacityOptions] = useState(
        [...new Array(10).keys()]
            .map((n) => ++n)
            .map((option) => ({
                value: (option * 10).toString(),
                label: `${(10 - option) * 10}%`,
            })),
    );

    const onPhotoChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files[0];
            e.target.value = null;

            if (!fileTypeIsValid(file, acceptedFiles)) {
                return pushDanger(`Toegestaande formaten: ${acceptedFiles.join(', ')}`);
            }

            openModal((modal) => (
                <ModalPhotoUploader
                    type={'implementation_banner'}
                    file={file}
                    modal={modal}
                    initialCropWidth={100}
                    acceptedFiles={acceptedFiles}
                    onSubmit={(file, presets) => {
                        const thumbnail = presets.find((preset) => preset.key == 'final');

                        selectPhoto?.(file);
                        setThumbnailValue(thumbnail?.data);
                    }}
                />
            ));
        },
        [acceptedFiles, fileTypeIsValid, openModal, pushDanger, selectPhoto],
    );

    useEffect(() => {
        setThumbnailValue(thumbnail);
    }, [thumbnail]);

    useEffect(() => {
        if (!description) {
            return;
        }

        markdownService
            .toHtml(description)
            .then((res) => setDescriptionPreview(res.data.html))
            .catch(console.error);
    }, [description, markdownService]);

    return (
        <div className="block block-banner-editor">
            <input type="file" hidden={true} accept={acceptedFiles.join(',')} ref={inputRef} onChange={onPhotoChange} />

            <div
                className={classNames(
                    'banner-editor-preview',
                    templateData.banner_collapse && 'banner-editor-preview-collapse',
                )}
                style={{
                    justifyContent: templateData.banner_position === 'right' ? 'flex-end' : 'flex-start',
                }}>
                <div
                    className="banner-editor-preview-photo"
                    style={{ backgroundImage: thumbnailValue ? 'url(' + thumbnailValue + ')' : 'none' }}>
                    {templateData.overlay_enabled && (
                        <div
                            className="banner-editor-photo-pattern"
                            style={{
                                ...(templateData.overlay_type === 'color'
                                    ? { backgroundColor: '#000' }
                                    : { backgroundImage: `url(${overlayPatternUrl})` }),
                                opacity: parseFloat(templateData.overlay_opacity) / 100,
                            }}
                        />
                    )}
                </div>
                <div
                    className="banner-editor-preview-content"
                    style={{
                        color: templateData?.banner_color,
                        backgroundColor: templateData?.banner_background,
                        flexGrow: 0,
                        flexShrink: 0,
                        padding:
                            hexToHsva(templateData?.banner_background).a === 0 && !templateData?.banner_collapse
                                ? '0px'
                                : undefined,
                        flexBasis: templateData.banner_collapse
                            ? templateData.banner_position === 'center'
                                ? '100%'
                                : '50%'
                            : templateData.banner_position === 'center'
                              ? '100%'
                              : '60%',
                    }}>
                    <div className="banner-editor-title">{title || 'Voorbeeld van de header'}</div>

                    {descriptionPreview && (
                        <Markdown content={descriptionPreview} className="banner-editor-description" />
                    )}

                    <div className="banner-editor-actions">
                        <div
                            className={classNames(
                                'button button-primary button-sm',
                                templateData?.banner_button_type === 'color' ? 'button-primary' : 'button-default',
                            )}
                            style={{
                                backgroundColor: templateData?.banner_button_type === 'color' ? '#305dfb' : null,
                            }}>
                            {buttonText || 'Voorbeeld'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="banner-editor-controls">
                <PhotoSelectorBannerControl
                    label={'Header stijl'}
                    value={'Stel in'}
                    controlKey={'style'}
                    templateData={templateData}
                    setTemplateData={setTemplateData}
                    activeKey={activeDropdown}
                    disabled={disabled}
                    setActiveKey={setActiveDropdown}>
                    <FormGroup
                        label={'Tekst positie:'}
                        input={(id) => (
                            <SelectControl
                                id={id}
                                value={templateData.banner_position}
                                options={[
                                    { label: 'Links', value: 'left' },
                                    { label: 'Gecentreerd', value: 'center' },
                                    { label: 'Rechts', value: 'right' },
                                ]}
                                propKey={'value'}
                                propValue={'label'}
                                onChange={(banner_position: 'left' | 'center' | 'right') => {
                                    setTemplateData({ ...templateData, banner_position });
                                }}
                            />
                        )}
                    />
                    <FormGroup
                        label={'Uitklappen:'}
                        input={(id) => (
                            <SelectControl
                                id={id}
                                value={templateData.banner_collapse ? 'yes' : 'no'}
                                options={[
                                    { label: 'Ja', value: 'yes' },
                                    { label: 'Nee', value: 'no' },
                                ]}
                                propKey={'value'}
                                propValue={'label'}
                                onChange={(banner_collapse: 'yes' | 'no') => {
                                    setTemplateData({ ...templateData, banner_collapse: banner_collapse === 'yes' });
                                }}
                            />
                        )}
                    />
                    <FormGroup
                        label={'Schermbreedte achtergrond:'}
                        input={(id) => (
                            <SelectControl
                                id={id}
                                value={templateData.banner_wide ? 'yes' : 'no'}
                                options={[
                                    { label: 'Volledig', value: 'yes' },
                                    { label: 'Vast', value: 'no' },
                                ]}
                                propKey={'value'}
                                propValue={'label'}
                                onChange={(banner_wide: 'yes' | 'no') => {
                                    setTemplateData({ ...templateData, banner_wide: banner_wide === 'yes' });
                                }}
                            />
                        )}
                    />
                    <FormGroup
                        label={'Achtegrondfoto op mobiel:'}
                        input={(id) => (
                            <SelectControl
                                id={id}
                                value={templateData.banner_background_mobile ? 'yes' : 'no'}
                                options={[
                                    { label: 'Ja', value: 'yes' },
                                    { label: 'Nee', value: 'no' },
                                ]}
                                propKey={'value'}
                                propValue={'label'}
                                onChange={(banner_background_mobile: 'yes' | 'no') => {
                                    setTemplateData({
                                        ...templateData,
                                        banner_background_mobile: banner_background_mobile === 'yes',
                                    });
                                }}
                            />
                        )}
                    />
                </PhotoSelectorBannerControl>

                <PhotoSelectorBannerControl
                    label={'Overlay'}
                    value={'Stel in'}
                    controlKey={'overlay'}
                    templateData={templateData}
                    setTemplateData={setTemplateData}
                    activeKey={activeDropdown}
                    disabled={disabled}
                    setActiveKey={setActiveDropdown}>
                    <FormGroup
                        label={'Gebruik een overlay:'}
                        input={(id) => (
                            <SelectControl
                                id={id}
                                value={templateData.overlay_enabled ? 'yes' : 'no'}
                                options={[
                                    { label: 'Ja', value: 'yes' },
                                    { label: 'Nee', value: 'no' },
                                ]}
                                propKey={'value'}
                                propValue={'label'}
                                onChange={(overlay_enabled: 'yes' | 'no') => {
                                    setTemplateData({ ...templateData, overlay_enabled: overlay_enabled === 'yes' });
                                }}
                            />
                        )}
                    />
                    <FormGroup
                        label={'Patroon:'}
                        input={(id) => (
                            <SelectControl
                                id={id}
                                value={templateData.overlay_type}
                                options={bannerPatterns}
                                disabled={!templateData.overlay_enabled}
                                propKey={'value'}
                                propValue={'label'}
                                onChange={(overlay_type: string) => {
                                    setTemplateData({ ...templateData, overlay_type });
                                }}
                            />
                        )}
                    />
                    <FormGroup
                        label={'Transparantie:'}
                        input={(id) => (
                            <SelectControl
                                id={id}
                                value={templateData.overlay_opacity}
                                options={bannerOpacityOptions}
                                disabled={!templateData.overlay_enabled}
                                propKey={'value'}
                                propValue={'label'}
                                onChange={(overlay_opacity: string) => {
                                    setTemplateData({ ...templateData, overlay_opacity });
                                }}
                            />
                        )}
                    />
                </PhotoSelectorBannerControl>

                <PhotoSelectorBannerControl
                    label={'Knop stijl'}
                    value={'Stel in'}
                    controlKey={'button'}
                    templateData={templateData}
                    setTemplateData={setTemplateData}
                    activeKey={activeDropdown}
                    disabled={disabled}
                    setActiveKey={setActiveDropdown}>
                    <FormGroup
                        label={'Stijl:'}
                        input={(id) => (
                            <SelectControl
                                id={id}
                                value={templateData.banner_button_type}
                                options={[
                                    { label: 'Kleur', value: 'color' },
                                    { label: 'Wit', value: 'white' },
                                ]}
                                propKey={'value'}
                                propValue={'label'}
                                onChange={(banner_button_type: 'color' | 'white') => {
                                    setTemplateData({ ...templateData, banner_button_type });
                                }}
                            />
                        )}
                    />
                </PhotoSelectorBannerControl>

                <PhotoSelectorBannerControl
                    label={'Achtergrond'}
                    disabled={disabled}
                    value={templateData.banner_background}
                    valueType={'color'}
                    controlKey={'background'}
                    templateData={templateData}
                    setTemplateData={setTemplateData}
                    activeKey={activeDropdown}
                    setActiveKey={setActiveDropdown}>
                    <FormGroup
                        label={'Kleur:'}
                        input={() => (
                            <PhotoSelectorBannerControlColorPicker
                                color={templateData.banner_background}
                                onChange={(color) => {
                                    setTemplateData({ ...templateData, banner_background: color.hexa });
                                }}
                                alphaFractions={5}
                                showAlpha={true}
                            />
                        )}
                    />
                </PhotoSelectorBannerControl>

                <PhotoSelectorBannerControl
                    label={'Tekst'}
                    value={templateData.banner_color}
                    valueType={'color'}
                    controlKey={'color'}
                    templateData={templateData}
                    setTemplateData={setTemplateData}
                    activeKey={activeDropdown}
                    disabled={disabled}
                    setActiveKey={setActiveDropdown}>
                    <FormGroup
                        label={'Kleur:'}
                        input={() => (
                            <PhotoSelectorBannerControlColorPicker
                                color={templateData.banner_color}
                                onChange={(color) => setTemplateData({ ...templateData, banner_color: color.hex })}
                            />
                        )}
                    />
                </PhotoSelectorBannerControl>

                {showEdit ? (
                    <div className="banner-editor-controls-buttons">
                        <StateNavLink
                            name={DashboardRoutes.IMPLEMENTATION_VIEW_BANNER}
                            params={{
                                organizationId: organization?.id,
                                id: implementation?.id,
                            }}
                            className="button button-primary button-sm">
                            <em className="mdi mdi-pencil-outline icon-start" />
                            Banner bewerken
                        </StateNavLink>
                    </div>
                ) : (
                    <div className="banner-editor-controls-buttons">
                        {templateData.media && (
                            <button type={'button'} className="button button-default button-sm" onClick={deletePhoto}>
                                <em className="mdi mdi-trash-can-outline icon-start" />
                                Foto verwijderen
                            </button>
                        )}

                        <button
                            type={'button'}
                            className="button button-default-dashed button-sm"
                            disabled={disabled}
                            onClick={() => inputRef.current?.click()}>
                            <em className="mdi mdi-file-image-plus icon-start" />
                            Kies foto
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
