import React, { Fragment, useMemo, useCallback, useState } from 'react';
import { ResponseError, ResponseErrorData } from '../../../../props/ApiResponses';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ImplementationPageBlock from '../../../../props/models/ImplementationPageBlock';
import MarkdownEditor from '../../../elements/forms/markdown-editor/MarkdownEditor';
import FormError from '../../../elements/forms/errors/FormError';
import { useMediaService } from '../../../../services/MediaService';
import usePushDanger from '../../../../hooks/usePushDanger';
import PhotoSelector from '../../../elements/photo-selector/PhotoSelector';
import SelectControlOptions from '../../../elements/select-control/templates/SelectControlOptions';
import SelectControl from '../../../elements/select-control/SelectControl';

export default function ImplementationsBlockEditorItem({
    id,
    block,
    onChange,
    errors,
    index,
    onDelete,
    unCollapsedList,
    setUnCollapsedList,
}: {
    id: string;
    block: ImplementationPageBlock & { uid: string };
    errors: ResponseErrorData;
    index: number;
    onDelete: () => void;
    onChange: (blocks: Partial<ImplementationPageBlock>) => void;
    unCollapsedList: Array<string>;
    setUnCollapsedList: React.Dispatch<React.SetStateAction<Array<string>>>;
}) {
    const pushDanger = usePushDanger();

    const mediaService = useMediaService();

    const isCollapsed = useMemo(() => !unCollapsedList.includes(block.uid), [unCollapsedList, block]);

    const [buttonLinkLabelEdited, setButtonLinkLabelEdited] = useState(false);

    const [buttonTargets] = useState([
        { value: false, name: 'Hetzelfde tabblad' },
        { value: true, name: 'Nieuw tabblad' },
    ]);

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const selectBlockImage = useCallback(
        (mediaFile: Blob) => {
            mediaService
                .store('implementation_block_media', mediaFile, ['thumbnail', 'public', 'large'])
                .then((res) => {
                    onChange({ media_uid: res.data.data.uid });
                })
                .catch((err: ResponseError) => pushDanger('Error!', err.data.message));
        },
        [mediaService, onChange, pushDanger],
    );

    return (
        <div className="block-item" ref={setNodeRef} style={style}>
            <div className="block-header">
                <em className="mdi mdi-dots-vertical block-drag" {...attributes} {...listeners} />

                <div className="block-title">{block.title || (!block.id ? 'Nieuwe blok' : 'Blok aanpassen')}</div>

                <div className="block-actions">
                    {!isCollapsed ? (
                        <div
                            className="button button-default button-sm"
                            onClick={() => setUnCollapsedList((list) => list.filter((item) => item !== block.uid))}>
                            <em className="mdi mdi-arrow-collapse-vertical icon-start" />
                            Inklappen
                        </div>
                    ) : (
                        <div
                            className="button button-primary button-sm"
                            onClick={() => setUnCollapsedList((list) => [...list, block.uid])}>
                            <em className="mdi mdi-arrow-expand-vertical icon-start" />
                            Uitklappen
                        </div>
                    )}

                    <div className="button button-danger button-sm" onClick={onDelete}>
                        <em className="mdi mdi-trash-can-outline icon-start" />
                        Blok verwijderen
                    </div>
                </div>
            </div>

            {!isCollapsed && (
                <div className="block-body">
                    <div className="form">
                        <div className="form-group">
                            <PhotoSelector
                                type={'implementation_block_media'}
                                selectPhoto={(file) => selectBlockImage(file)}
                                thumbnail={block?.media?.sizes?.thumbnail}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Label</label>
                            <input
                                className="form-control"
                                type="text"
                                value={block.label || ''}
                                placeholder="Label..."
                                onChange={(e) => {
                                    onChange({ label: e.target.value });
                                }}
                            />
                            <div className="form-hint">Max. 30 tekens</div>
                            <FormError error={errors['blocks.' + index + '.label']} />
                        </div>

                        <div className="form-group">
                            <label className="form-label form-label-required">Title</label>
                            <input
                                className="form-control"
                                type="text"
                                value={block.title || ''}
                                onChange={(e) => {
                                    block.title = e.target.value;
                                    onChange({ title: e.target.value });
                                }}
                                placeholder="Title..."
                            />
                            <div className="form-hint">Max. 100 tekens</div>
                            <FormError error={errors['blocks.' + index + '.title']} />
                        </div>

                        <div className="form-group">
                            <label className="form-label form-label-required">Omschrijving</label>
                            <MarkdownEditor
                                value={block.description_html || ''}
                                onChange={(value) => {
                                    onChange({ description: value });
                                }}
                                placeholder="Omschrijving..."
                            />
                            <div className="form-hint">Max. 500 tekens</div>
                            <FormError error={errors['blocks.' + index + '.description']} />
                        </div>

                        <div className="form-group">
                            <div className="flex">
                                <label className="form-label" htmlFor="button_enabled_{{$parent.$index}}">
                                    Button
                                </label>
                                <div className="flex-col">
                                    <label className="form-toggle" htmlFor={`button_enabled_${index}`}>
                                        <input
                                            type="checkbox"
                                            id={`button_enabled_${index}`}
                                            checked={block.button_enabled}
                                            onChange={(e) => {
                                                onChange({ button_enabled: e.target.checked });
                                            }}
                                        />
                                        <div className="form-toggle-inner flex-end">
                                            <div className="toggle-input">
                                                <div className="toggle-input-dot" />
                                            </div>
                                        </div>
                                        <FormError error={errors['blocks.' + index + '.button_enabled']} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {block.button_enabled && (
                            <Fragment>
                                <div className="form-group">
                                    <label className="form-label form-label-required">Button Text</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={block.button_text || ''}
                                        placeholder="Button Text"
                                        onChange={(e) => {
                                            block.button_text = e.target.value;

                                            if (!buttonLinkLabelEdited) {
                                                block.button_link_label = e.target.value;
                                            }
                                            onChange(block);
                                        }}
                                    />
                                    <FormError error={errors['blocks.' + index + '.button_text']} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label form-label-required">Button Link</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={block.button_link || ''}
                                        placeholder="Button Link"
                                        onChange={(e) => {
                                            onChange({ button_link: e.target.value });
                                        }}
                                    />
                                    <FormError error={errors['blocks.' + index + '.button_link']} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label form-label-required">Open knop koppeling in</label>
                                    <div className="form-offset">
                                        <SelectControl
                                            className="form-control"
                                            propKey={'value'}
                                            allowSearch={false}
                                            value={block.button_target_blank}
                                            onChange={(value: boolean) => {
                                                onChange({ button_target_blank: value });
                                            }}
                                            options={buttonTargets}
                                            optionsComponent={SelectControlOptions}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Button Link Label</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={block.button_link_label || ''}
                                        placeholder="Button Link Label"
                                        onChange={(e) => {
                                            setButtonLinkLabelEdited(true);
                                            onChange({ button_link_label: e.target.value });
                                        }}
                                    />
                                    <FormError error={errors['blocks.' + index + '.button_link_label']} />
                                </div>
                            </Fragment>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
