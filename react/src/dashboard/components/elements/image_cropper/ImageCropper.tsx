import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactCrop, { centerCrop, Crop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { createObjectURL, resizeCanvas } from './helpers/image';
import { canvasPreview } from './helpers/canvasPreview';

export interface ImageCropperPreviewConfig {
    key?: string;
    width: number;
    height: number;
}

export interface ImageCropperPresetValue extends ImageCropperPreviewConfig {
    data: string;
    blob?: Blob;
}

export default function ImageCropper({
    file,
    aspect = null,
    presets = null,
    onChange = null,
    autoSelect = true,
    minWidth = 1,
    minHeight = 1,
}: {
    file: File;
    aspect?: number;
    presets?: Array<ImageCropperPreviewConfig>;
    onChange?: (presets: Array<ImageCropperPresetValue>) => void;
    autoSelect?: boolean;
    minWidth?: number;
    minHeight?: number;
}) {
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();
    const [imgSrc, setImgSrc] = useState<string>(null);
    const [previewsList, setPreviewsList] = useState([]);

    const centerAspectCrop = useCallback((mediaWidth: number, mediaHeight: number, aspect: number) => {
        return centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
            mediaWidth,
            mediaHeight,
        );
    }, []);

    const makePreview = useCallback(function (pixelCrop: PixelCrop, item: ImageCropperPreviewConfig) {
        return new Promise((resolve) => {
            resizeCanvas(
                canvasPreview(imgRef.current, document.createElement('canvas'), pixelCrop),
                item.width,
                item.height,
                'cover',
            ).toBlob((blob) => resolve({ ...item, blob, data: blob ? createObjectURL(blob) : null }));
        });
    }, []);

    const onComplete = useCallback(
        (pixelCrop: PixelCrop) => {
            Promise.all(presets.map((preview) => makePreview(pixelCrop, preview))).then(setPreviewsList);
        },
        [makePreview, presets],
    );

    const onImageLoad = useCallback(
        (e: React.SyntheticEvent<HTMLImageElement>) => {
            if (autoSelect) {
                const { width, height } = e.currentTarget;
                setCrop(centerAspectCrop(width, height, aspect || width / height));
            }
        },
        [aspect, autoSelect, centerAspectCrop],
    );

    useEffect(() => {
        if (!file) {
            return setImgSrc(null);
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
        reader.readAsDataURL(file);
    }, [file]);

    useEffect(() => {
        onChange(previewsList);
    }, [onChange, previewsList]);

    return (
        imgSrc && (
            <ReactCrop
                crop={crop}
                aspect={aspect}
                keepSelection={true}
                minWidth={minWidth}
                minHeight={minHeight}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={onComplete}>
                <img
                    ref={imgRef}
                    src={imgSrc}
                    alt={''}
                    style={{ maxWidth: '400px', display: 'block' }}
                    onLoad={onImageLoad}
                />
            </ReactCrop>
        )
    );
}
