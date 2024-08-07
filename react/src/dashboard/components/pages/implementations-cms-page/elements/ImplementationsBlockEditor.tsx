import React, { Fragment, useCallback, useEffect, useState } from 'react';
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
import ImplementationPageBlock from '../../../../props/models/ImplementationPageBlock';
import useTranslate from '../../../../hooks/useTranslate';
import { uniq } from 'lodash';
import useImplementationPageService from '../../../../services/ImplementationPageService';
import Implementation from '../../../../props/models/Implementation';

export default function ImplementationsBlockEditor({
    blocks,
    setBlocks,
    errors,
    setErrors,
    createFaqRef,
    implementation,
}: {
    blocks: Array<ImplementationPageBlock>;
    setBlocks: React.Dispatch<React.SetStateAction<Array<ImplementationPageBlock>>>;
    errors?: ResponseErrorData;
    setErrors: (errors: ResponseErrorData) => void;
    createFaqRef: React.MutableRefObject<() => Promise<boolean>>;
    implementation: Implementation;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();

    const mediaService = useMediaService();
    const implementationPageService = useImplementationPageService();

    const [expandedIndexes, setExpandedIndexes] = useState([]);
    const [buttonLinkLabelEdited, setButtonLinkLabelEdited] = useState(false);

    const [buttonTargets] = useState([
        { value: false, name: 'Hetzelfde tabblad' },
        { value: true, name: 'Nieuw tabblad' },
    ]);

    const removeBlock = useCallback(
        (blockIndex: number) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('modals.danger_zone.remove_implementation_block.title')}
                    description={translate('modals.danger_zone.remove_implementation_block.description')}
                    buttonCancel={{
                        onClick: modal.close,
                        text: translate('modals.danger_zone.remove_implementation_block.buttons.cancel'),
                    }}
                    buttonSubmit={{
                        onClick: () => {
                            modal.close();
                            const list = [...blocks];
                            list.splice(blockIndex, 1);
                            setBlocks([...list]);
                        },
                        text: translate('modals.danger_zone.remove_implementation_block.buttons.confirm'),
                    }}
                />
            ));
        },
        [blocks, setBlocks, openModal, translate],
    );

    const addBlock = useCallback(() => {
        setBlocks([
            ...blocks,
            {
                label: '',
                title: '',
                description: '',
                button_text: '',
                button_link: '',
                button_enabled: false,
                button_target_blank: true,
            },
        ]);

        setExpandedIndexes((list) => [...list, blocks.length]);
    }, [blocks, setBlocks]);

    const selectBlockImage = useCallback(
        (mediaFile: Blob, index: number) => {
            mediaService
                .store('implementation_block_media', mediaFile, ['thumbnail', 'public', 'large'])
                .then((res) => {
                    setBlocks((blocks) => {
                        blocks[index].media_uid = res.data.data.uid;
                        return [...blocks];
                    });
                })
                .catch((err: ResponseError) => pushDanger('Error!', err.data.message));
        },
        [mediaService, pushDanger, setBlocks],
    );

    const validate = useCallback((): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            implementationPageService
                .validateBlocks(implementation.organization_id, implementation.id, { blocks })
                .then(() => resolve(true))
                .catch((err: ResponseError) => {
                    const { data, status } = err;
                    const { errors, message } = data;

                    if (errors && typeof errors == 'object') {
                        setErrors(errors);

                        const errorIndexes = Object.keys(errors)
                            .map((error) => parseInt(error.split('.')[1] || null))
                            .filter((item) => Number.isInteger(item));

                        setExpandedIndexes((collapsedList) => uniq([...collapsedList, ...errorIndexes]));
                    }

                    reject(
                        status == 422
                            ? translate('components.implementation_block_editor.fix_validation_errors')
                            : message,
                    );
                });
        });
    }, [blocks, implementation.id, implementation.organization_id, implementationPageService, setErrors, translate]);

    useEffect(() => {
        createFaqRef.current = validate;
    }, [createFaqRef, validate]);

    return (
        <div className="block block-implementation-blocks-editor">
            {blocks.map((block, index) => (
                <div className="block-item" key={index}>
                    <div className="block-header">
                        <div className="block-title">
                            {block.title || (!block.id ? 'Nieuwe blok' : 'Blok aanpassen')}
                        </div>
                        <div className="block-actions">
                            {expandedIndexes.includes(index) ? (
                                <div
                                    className="button button-default button-sm"
                                    onClick={() => {
                                        setExpandedIndexes(() => expandedIndexes.filter((item) => item !== index));
                                    }}>
                                    <em className="mdi mdi-arrow-collapse-vertical icon-start" />
                                    Inklappen
                                </div>
                            ) : (
                                <div
                                    className="button button-primary button-sm"
                                    onClick={() => {
                                        setExpandedIndexes(() => uniq([...expandedIndexes, index]));
                                    }}>
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

                    {expandedIndexes.includes(index) && (
                        <div className="block-body">
                            <div className="form">
                                <div className="form-group">
                                    <PhotoSelector
                                        type={'implementation_block_media'}
                                        selectPhoto={(file) => selectBlockImage(file, index)}
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
                                            setBlocks((blocks) => {
                                                blocks[index].label = e.target.value;
                                                return [...blocks];
                                            });
                                        }}
                                    />
                                    <div className="form-hint">Max. 200 tekens</div>
                                    <FormError error={errors['blocks.' + index + '.label']} />
                                </div>

                                <div className="form-group">
                                    <label className="form-label form-label-required">Title</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={block.title || ''}
                                        onChange={(e) => {
                                            setBlocks((blocks) => {
                                                blocks[index].title = e.target.value;
                                                return [...blocks];
                                            });
                                        }}
                                        placeholder="Title..."
                                    />
                                    <div className="form-hint">Max. 200 tekens</div>
                                    <FormError error={errors['blocks.' + index + '.title']} />
                                </div>

                                <div className="form-group">
                                    <label className="form-label form-label-required">Omschrijving</label>
                                    <MarkdownEditor
                                        value={block.description_html || ''}
                                        onChange={(value) => {
                                            setBlocks((blocks) => {
                                                blocks[index].description = value;
                                                return [...blocks];
                                            });
                                        }}
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
                                                    onChange={(e) => {
                                                        setBlocks((blocks) => {
                                                            blocks[index].button_enabled = e.target.checked;
                                                            return [...blocks];
                                                        });
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
                                                    setBlocks((blocks) => {
                                                        blocks[index].button_text = e.target.value;

                                                        if (!buttonLinkLabelEdited) {
                                                            blocks[index].button_link_label = e.target.value;
                                                        }

                                                        return [...blocks];
                                                    });
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
                                                    setBlocks((blocks) => {
                                                        blocks[index].button_link = e.target.value;
                                                        return [...blocks];
                                                    });
                                                }}
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
                                                    onChange={(value: boolean) => {
                                                        setBlocks((blocks) => {
                                                            blocks[index].button_target_blank = value;
                                                            return [...blocks];
                                                        });
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
                                                    setBlocks((blocks) => {
                                                        blocks[index].button_link_label = e.target.value;
                                                        return [...blocks];
                                                    });
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
