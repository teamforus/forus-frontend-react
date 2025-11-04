import React, { ChangeEvent, Dispatch, SetStateAction, useCallback, useRef } from 'react';
import Media from '../../../../props/models/Media';
import ModalPhotoUploader from '../../../modals/ModalPhotoUploader';
import useOpenModal from '../../../../hooks/useOpenModal';
import useSetProgress from '../../../../hooks/useSetProgress';
import { useMediaService } from '../../../../services/MediaService';
import ProductsFormMediaUploaderItem from './ProductsFormMediaUploaderItem';
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export default function ProductsFormMediaUploader({
    media,
    setMedia,
    disabled = false,
    maxCount = 5,
}: {
    media: Media[];
    setMedia?: Dispatch<SetStateAction<Media[]>>;
    disabled?: boolean;
    maxCount?: number;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const openModal = useOpenModal();
    const setProgress = useSetProgress();

    const mediaService = useMediaService();

    const uploadMedia = useCallback(
        (mediaFile: Blob): Promise<Media> => {
            const syncPresets = ['thumbnail', 'small'];

            return new Promise((resolve, reject) => {
                setProgress(0);

                mediaService
                    .store('product_photo', mediaFile, syncPresets)
                    .then((res) => resolve(res.data.data))
                    .catch((err) => reject(err.data.errors.file))
                    .finally(() => setProgress(100));
            });
        },
        [setProgress, mediaService],
    );

    const onPhotoChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files[0];
            e.target.value = null;

            openModal((modal) => (
                <ModalPhotoUploader
                    type={'product_photo'}
                    file={file}
                    modal={modal}
                    onSubmit={(file /*, presets*/) => {
                        //const thumbnail = presets.find((preset) => preset.key == 'thumbnail');

                        uploadMedia(file).then((result) => {
                            setMedia((media) => [...media, result]);
                        });
                        /*selectPhoto(file);
                        setThumbnailValue(thumbnail?.data);*/
                    }}
                />
            ));
        },
        [openModal, setMedia, uploadMedia],
    );

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;

            if (active.id !== over.id) {
                const items = media.map((item) => item.uid);
                const oldIndex = items.indexOf(active.id.toString());
                const newIndex = items.indexOf(over.id.toString());

                setMedia(arrayMove(media, oldIndex, newIndex));
            }
        },
        [media, setMedia],
    );

    return (
        <div className="block block-product-media-uploader">
            <input type="file" hidden={true} accept={'image/*'} ref={inputRef} onChange={onPhotoChange} />
            <div className="product-media-preview">
                {media?.[0] ? (
                    <img src={media?.[0]?.sizes?.small} alt="Front view of product" />
                ) : (
                    <em className="product-media-preview-icon mdi mdi-image-outline" />
                )}
            </div>
            <div className="product-media-items">
                {(!media || media?.length === 0) && (
                    <div className="product-media-items-placeholder">
                        <div className="product-media-items-placeholder-title">Voeg een afbeelding toe</div>
                        <div className="product-media-items-placeholder-text">
                            U heeft de mogelijkheid om tot en met vijf verschillende afbeeldingen toe te voegen. Mocht u
                            meerdere afbeeldingen hebben geupload, dan kunt de afbeeldingen sorteren. De eerste
                            afbeelding zal als uitgelichte afbeelding op de webshop worden getoond.
                        </div>
                    </div>
                )}

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={media.map((item) => item.uid)} strategy={verticalListSortingStrategy}>
                        <div className="product-media-items">
                            {media?.map((item) => (
                                <ProductsFormMediaUploaderItem
                                    key={item.uid}
                                    media={item}
                                    disabled={disabled}
                                    onDelete={() => {
                                        setMedia((media) => media.filter((mediaItem) => mediaItem.uid != item.uid));
                                    }}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {media?.length < maxCount && (
                    <div className="product-media-actions">
                        <button
                            className="button button-primary"
                            type="button"
                            disabled={disabled}
                            onClick={() => inputRef.current?.click()}>
                            <em className="mdi mdi-upload-outline" />
                            Voeg afbeelding toe
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
