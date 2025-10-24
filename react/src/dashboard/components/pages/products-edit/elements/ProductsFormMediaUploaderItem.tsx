import React from 'react';
import Media from '../../../../props/models/Media';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';

export default function ProductsFormMediaUploaderItem({
    media,
    onDelete,
    disabled = false,
}: {
    media: Media;
    onDelete: () => void;
    disabled: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: media.uid });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            className={classNames('product-media-item', isDragging && 'product-media-item-grabbing')}
            key={media.uid}
            ref={disabled ? undefined : setNodeRef}
            style={style}>
            <div className="product-media-item-drag">
                <em className="mdi mdi-drag-vertical" {...attributes} {...listeners} />
            </div>
            <div className="product-media-item-media">
                <img src={media?.sizes?.small} alt={media?.original_name} />
            </div>
            <div className="product-media-item-details">
                <div className="product-media-item-name">{media?.original_name}</div>
                <div className="product-media-item-actions">
                    <button
                        className="product-media-item-action"
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}>
                        <em className="mdi mdi-close" />
                        Verwijderen
                    </button>
                </div>
            </div>
        </div>
    );
}
