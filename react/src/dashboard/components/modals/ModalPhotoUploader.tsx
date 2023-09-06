import React, { useCallback, useEffect, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import ImageCropper, { ImageCropperPresetValue } from '../elements/image_cropper/ImageCropper';
import useAppConfigs from '../../hooks/useAppConfigs';

export default function ModalPhotoUploader({
    type,
    file,
    modal,
    onSubmit,
    className,
}: {
    type: string;
    file: File;
    modal: ModalState;
    onSubmit: (file: Blob, sizes: Array<ImageCropperPresetValue>) => void;
    className?: string;
}) {
    const appConfigs = useAppConfigs();

    const [confirmed, setConfirmed] = useState(false);
    const [mediaConfig, setMediaConfig] = useState(null);
    const [ready, setReady] = useState(false);
    const [thumbnail, setThumbnail] = useState<ImageCropperPresetValue>(null);
    const [final, setFinal] = useState<ImageCropperPresetValue>(null);
    const [presets, setPresets] = useState<Array<ImageCropperPresetValue>>([]);
    const [targetFile, setTargetFile] = useState<File>(file);

    const apply = useCallback(() => {
        const blob = Object.assign(final.blob, {
            name: targetFile.name,
            lastModified: targetFile.lastModified,
        });

        onSubmit(blob, presets);
        modal.close();
    }, [presets, targetFile, final, modal, onSubmit]);

    const changePhoto = useCallback(() => {
        const input = document.createElement('input');
        input.style.display = 'none';
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/!*');
        input.addEventListener('change', () => {
            setTargetFile(null);
            window.setTimeout(() => setTargetFile(input.files[0]), 0);
        });
        input.click();
    }, []);

    useEffect(() => {
        setMediaConfig(appConfigs.media[type]);
    }, [appConfigs, targetFile, type]);

    useEffect(() => {
        setFinal(presets.find((size) => size.key == 'final'));
        setThumbnail(presets.find((size) => size.key == 'thumbnail'));
    }, [presets]);

    useEffect(() => {
        if (!modal.loading) {
            const timeout = window.setTimeout(() => setReady(true), 250);
            return () => window.clearTimeout(timeout);
        } else {
            setReady(false);
        }
    }, [modal.loading]);

    return (
        <div
            className={classList([
                'modal',
                'modal-animated',
                'modal-photo-upload',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />
            <div className="modal-window">
                <div className="modal-close mdi mdi-close" onClick={modal.close} />
                <div className="modal-body">
                    <div className="modal-section">
                        <div className="modal-title">Verplaats en wijzig grootte</div>
                        <div className="modal-description hidden-xs">
                            U kunt de afbeelding naar uw voorkeur instellen, links ziet u de originele afbeelding en
                            rechts
                            <br />
                            een voorbeeld van hoe het op de webshop eruit komt te
                        </div>
                        <div className="photo-crop">
                            <div className="photo-crop-image">
                                <div className="photo-crop-control full-width-xs">
                                    {targetFile && mediaConfig && ready && (
                                        <ImageCropper
                                            file={targetFile}
                                            presets={[
                                                { width: 200, height: 200, key: 'thumbnail' },
                                                {
                                                    width: mediaConfig?.size.large[0],
                                                    height: mediaConfig?.size.large[1],
                                                    key: 'final',
                                                },
                                            ]}
                                            aspect={mediaConfig.aspect_ratio}
                                            onChange={(sizes) => setPresets(sizes)}
                                        />
                                    )}
                                </div>
                                <div className="photo-crop-preview hidden-xs">
                                    <div className="crop-control-original">
                                        <img src={final?.data} alt="" />
                                    </div>
                                    <div className="crop-control-thumbnails">
                                        <div className="crop-control-thumbnail">
                                            <img src={thumbnail?.data} alt="" />
                                        </div>
                                        <div className="crop-control-thumbnail">
                                            <img src={thumbnail?.data} alt="" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="photo-crop-info">
                                De afmeting van de afbeelding dient bijvoorbeeld {mediaConfig?.size.large[0]}x
                                {mediaConfig?.size.large[1]}px te zijn. (breedte keer hoogte)
                                <br />
                                Toegestaande formaten: .JPG, .PNG
                                <br />
                            </div>
                            <div className="form text-center">
                                <label htmlFor="confirmation" className="checkbox">
                                    <input
                                        type="checkbox"
                                        id="confirmation"
                                        checked={confirmed}
                                        onChange={(e) => setConfirmed(e.target.checked)}
                                    />
                                    <span className="checkbox-label">
                                        <span className="checkbox-box">
                                            <span className="mdi mdi-check" />
                                        </span>
                                        Ik beschik over&nbsp;
                                        <a
                                            target="_blank"
                                            rel="noreferrer"
                                            href="https://www.rijksoverheid.nl/onderwerpen/intellectueel-eigendom/vraag-en-antwoord/mag-ik-teksten-muziek-of-foto-s-van-anderen-gebruiken">
                                            de rechten
                                        </a>
                                        &nbsp;van de afbeelding.
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <div className="flex-row">
                            <div className="flex-col">
                                <button
                                    className="button button-text button-text-primary button-wide"
                                    onClick={() => modal.close()}>
                                    Annuleren
                                </button>
                            </div>
                            <div className="flex-col">
                                <button
                                    type="button"
                                    className="button button-primary-outline button-wide nowrap hidden-xs"
                                    onClick={() => changePhoto()}>
                                    Kies andere afbeelding
                                </button>
                            </div>
                            <div className="flex-col">
                                <button
                                    disabled={!confirmed}
                                    onClick={apply}
                                    className="button button-primary button-wide">
                                    Bevestigen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
