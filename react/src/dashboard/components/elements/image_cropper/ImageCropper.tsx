import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactCrop, { centerCrop, Crop, makeAspectCrop, PercentCrop, PixelCrop } from 'react-image-crop';
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
    minWidth = 40,
    minHeight = 40,
    initialWidth = 90,
    quality = 0.93,
}: {
    file: File;
    aspect?: number;
    presets?: Array<ImageCropperPreviewConfig>;
    onChange?: (presets: Array<ImageCropperPresetValue>) => void;
    autoSelect?: boolean;
    minWidth?: number;
    minHeight?: number;
    initialWidth?: number;
    quality?: number;
}) {
    const imgSrc = useMemo(() => window.URL.createObjectURL(file ? file : null), [file]);
    const [img, setImg] = useState<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();
    const [previewsList, setPreviewsList] = useState([]);

    const centerAspectCrop = useCallback(
        (mediaWidth: number, mediaHeight: number, aspect: number) => {
            return centerCrop(
                makeAspectCrop({ unit: '%', width: initialWidth }, aspect, mediaWidth, mediaHeight),
                mediaWidth,
                mediaHeight,
            );
        },
        [initialWidth],
    );

    const makePreview = useCallback(
        function (percentCrop: PercentCrop, item: ImageCropperPreviewConfig) {
            const selectionRatio = percentCrop.width / percentCrop.height;

            const pixelCrop = {
                width: img.width * (percentCrop.width / 100),
                height: img.height * (percentCrop.height / 100),
                x: img.width * (percentCrop.x / 100),
                y: img.height * (percentCrop.y / 100),
                unit: 'px',
            };

            return new Promise((resolve) => {
                resizeCanvas(
                    canvasPreview(img, document.createElement('canvas'), pixelCrop as PixelCrop),
                    item.width ? item.width : item.height ? item.height * selectionRatio : pixelCrop.width,
                    item.height ? item.height : item.width ? item.width * selectionRatio : pixelCrop.height,
                    'cover',
                ).toBlob(
                    (blob) => resolve({ ...item, blob, data: blob ? createObjectURL(blob) : null }),
                    'image/jpeg',
                    quality,
                );
            });
        },
        [img, quality],
    );

    const onComplete = useCallback(
        (percentCrop: PercentCrop) => {
            Promise.all(presets.map((preview) => makePreview(percentCrop, preview))).then(setPreviewsList);
        },
        [makePreview, presets],
    );

    const onImageLoad = useCallback(
        (img: HTMLImageElement) => {
            if (autoSelect) {
                setCrop(centerAspectCrop(img.width, img.height, aspect || img.width / img.height));
            }
        },
        [aspect, autoSelect, centerAspectCrop],
    );

    useEffect(() => {
        onChange(previewsList);
    }, [onChange, previewsList, crop]);

    useEffect(() => {
        const image = new Image();
        image.onload = () => setImg(image);
        image.src = encodeURI(imgSrc);
    }, [imgSrc]);

    useEffect(() => {
        if (img) {
            onImageLoad(img);
        }
    }, [onImageLoad, img]);

    return (
        file && (
            <ReactCrop
                crop={crop}
                aspect={aspect}
                keepSelection={true}
                minWidth={minWidth}
                minHeight={minHeight}
                onChange={(_, percentageCrop) => setCrop(percentageCrop)}
                onComplete={(_, percentageCrop) => onComplete(percentageCrop)}>
                <img src={encodeURI(imgSrc)} alt={''} style={{ display: 'block' }} />
            </ReactCrop>
        )
    );
}
