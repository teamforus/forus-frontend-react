import React, { Fragment, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import usePushDanger from '../../../../hooks/usePushDanger';
import FormError from '../../../elements/forms/errors/FormError';
import { ResponseError, ResponseErrorData } from '../../../../props/ApiResponses';
import SelectControlOptions from '../../../elements/select-control/templates/SelectControlOptions';
import SelectControl from '../../../elements/select-control/SelectControl';
import MarkdownEditor from '../../../elements/forms/markdown-editor/MarkdownEditor';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import useOpenModal from '../../../../hooks/useOpenModal';
import { useMediaService } from '../../../../services/MediaService';
import PhotoSelector from '../../../elements/photo-selector/PhotoSelector';
import { ImplementationPageBlock } from '../../../../props/models/ImplementationPage';

type ImplementationPageBlockLocal = ImplementationPageBlock & {
    collapsed?: boolean;
};

export default function ImplementationsBlockEditor({
    blocks,
    errors,
    onChange,
}: {
    blocks: Array<ImplementationPageBlockLocal>;
    errors?: ResponseErrorData;
    onChange: (blocks: Array<ImplementationPageBlockLocal>) => void;
}) {
    const { t } = useTranslation();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();

    const mediaService = useMediaService();

    const [buttonLinkLabelEdited, setButtonLinkLabelEdited] = useState(false);

    const [buttonTargets] = useState([
        { value: false, name: 'Hetzelfde tabblad' },
        { value: true, name: 'Nieuw tabblad' },
    ]);

    const updateValue = useCallback(
        (block: ImplementationPageBlockLocal, key: string, value: string | number | boolean) => {
            const list = [...blocks];
            const index = list.indexOf(block);
            list[index][key] = value;
            onChange(list);
        },
        [blocks, onChange],
    );

    const onButtonTextChange = useCallback(
        (block: ImplementationPageBlockLocal) => {
            if (!buttonLinkLabelEdited) {
                updateValue(block, 'button_link_label', block.button_text);
            }
        },
        [buttonLinkLabelEdited, updateValue],
    );

    const removeBlock = useCallback(
        (blockIndex: number) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={t('modals.danger_zone.remove_implementation_block.title')}
                    description={t('modals.danger_zone.remove_implementation_block.description')}
                    buttonCancel={{
                        onClick: modal.close,
                        text: t('modals.danger_zone.remove_implementation_block.buttons.cancel'),
                    }}
                    buttonSubmit={{
                        onClick: () => {
                            modal.close();
                            const list = [...blocks];
                            list.splice(blockIndex, 1);
                            onChange(list);
                        },
                        text: t('modals.danger_zone.remove_implementation_block.buttons.confirm'),
                    }}
                />
            ));
        },
        [blocks, onChange, openModal, t],
    );

    const addBlock = useCallback(() => {
        const list = [...blocks];

        list.push({
            label: '',
            title: '',
            collapsed: true,
            description: '',
            button_text: '',
            button_link: '',
            button_enabled: false,
            button_target_blank: true,
        });

        onChange(list);
    }, [blocks, onChange]);

    const selectBlockImage = useCallback(
        (mediaFile: Blob, block: ImplementationPageBlockLocal) => {
            mediaService
                .store('implementation_block_media', mediaFile, ['thumbnail', 'public', 'large'])
                .then((res) => updateValue(block, 'media_uid', res.data.data.uid))
                .catch((res: ResponseError) => pushDanger('Error!', res.data.message));
        },
        [mediaService, pushDanger, updateValue],
    );

    return (
        <div className="block block-implementation-blocks-editor">
            {blocks.map((block, index) => (
                <div className="block-item" key={index}>
                    <div className="block-header">
                        <div className="block-title">
                            {block.title || (!block.id ? 'Nieuwe blok' : 'Blok aanpassen')}
                        </div>
                        <div className="block-actions">
                            {block.collapsed ? (
                                <div
                                    className="button button-default button-sm"
                                    onClick={() => updateValue(block, 'collapsed', false)}>
                                    <em className="mdi mdi-arrow-collapse-vertical icon-start" />
                                    Inklappen
                                </div>
                            ) : (
                                <div
                                    className="button button-primary button-sm"
                                    onClick={() => updateValue(block, 'collapsed', true)}>
                                    <em className="mdi mdi-arrow-expand-vertical icon-start" />
                                    Uitklappen
                                </div>
                            )}

                            <div className="button button-danger button-sm" onClick={() => removeBlock(index)}>
                                <em className="mdi mdi-trash-can-outline icon-start" />
                                Blok verwijderen
                            </div>
                        </div>
                    </div>

                    {block.collapsed && (
                        <div className="block-body">
                            <div className="form">
                                <div className="form-group">
                                    <PhotoSelector
                                        type={'implementation_block_media'}
                                        selectPhoto={(file) => selectBlockImage(file, block)}
                                        thumbnail={block?.media?.sizes?.thumbnail}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Label</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={block.label}
                                        placeholder="Label..."
                                        onChange={(e) => updateValue(block, 'label', e.target.value)}
                                    />
                                    <div className="form-hint">Max. 200 tekens</div>
                                    <FormError error={errors['blocks.' + index + '.label']} />
                                </div>

                                <div className="form-group">
                                    <label className="form-label form-label-required">Title</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={block.title}
                                        onChange={(e) => updateValue(block, 'title', e.target.value)}
                                        placeholder="Title..."
                                    />
                                    <div className="form-hint">Max. 200 tekens</div>
                                    <FormError error={errors['blocks.' + index + '.title']} />
                                </div>

                                <div className="form-group">
                                    <label className="form-label form-label-required">Omschrijving</label>
                                    <MarkdownEditor
                                        value={block.description_html}
                                        onChange={(value) => updateValue(block, 'description', value)}
                                        placeholder="Omschrijving..."
                                    />
                                    <div className="form-hint">Max. 5000 tekens</div>
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
                                                    onChange={(e) =>
                                                        updateValue(block, 'button_enabled', e.target.checked)
                                                    }
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
                                                    updateValue(block, 'button_text', e.target.value);
                                                    onButtonTextChange(block);
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
                                                onChange={(e) => updateValue(block, 'button_link', e.target.value)}
                                            />
                                            <FormError error={errors['blocks.' + index + '.button_link']} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label form-label-required">
                                                Open knop koppeling in
                                            </label>
                                            <div className="form-offset">
                                                <SelectControl
                                                    className="form-control"
                                                    propKey={'value'}
                                                    allowSearch={false}
                                                    value={block.button_target_blank}
                                                    onChange={(value: boolean) =>
                                                        updateValue(block, 'button_target_blank', value)
                                                    }
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
                                                    updateValue(block, 'button_link_label', e.target.value);
                                                    setButtonLinkLabelEdited(true);
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
            ))}

            <div className="block-editor-actions">
                <div className="button button-primary" onClick={() => addBlock()}>
                    <em className="mdi mdi-plus-circle icon-start" />
                    Blok toevoegen
                </div>
            </div>
        </div>
    );
}
