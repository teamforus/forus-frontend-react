import React, { useCallback, useEffect, useState } from 'react';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { ResponseError, ResponseErrorData } from '../../../../props/ApiResponses';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import useOpenModal from '../../../../hooks/useOpenModal';
import ImplementationPageBlock from '../../../../props/models/ImplementationPageBlock';
import useTranslate from '../../../../hooks/useTranslate';
import { uniq, uniqueId } from 'lodash';
import useImplementationPageService from '../../../../services/ImplementationPageService';
import Implementation from '../../../../props/models/Implementation';
import ImplementationsBlockEditorItem from './ImplementationsBlockEditorItem';

export default function ImplementationsBlockEditor({
    blocks,
    setBlocks,
    errors,
    setErrors,
    createFaqRef,
    implementation,
}: {
    blocks: Array<ImplementationPageBlock & { uid: string }>;
    setBlocks: React.Dispatch<React.SetStateAction<Array<ImplementationPageBlock & { uid: string }>>>;
    errors?: ResponseErrorData;
    setErrors: (errors: ResponseErrorData) => void;
    createFaqRef: React.MutableRefObject<() => Promise<boolean>>;
    implementation: Implementation;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();

    const implementationPageService = useImplementationPageService();

    const [unCollapsedList, setUnCollapsedList] = useState([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = useCallback(
        (event) => {
            const { active, over } = event;

            if (active.id !== over.id) {
                const items = blocks.map((block) => block.uid);
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);

                setBlocks(arrayMove(blocks, oldIndex, newIndex));
            }
        },
        [blocks, setBlocks],
    );

    const askConfirmation = useCallback(
        (onConfirm) => {
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
                            onConfirm();
                        },
                        text: translate('modals.danger_zone.remove_implementation_block.buttons.confirm'),
                    }}
                />
            ));
        },
        [openModal, translate],
    );

    const addBlock = useCallback(() => {
        const uid = uniqueId();

        setBlocks([
            ...blocks,
            {
                uid,
                label: '',
                title: '',
                description: '',
                button_text: '',
                button_link: '',
                button_enabled: false,
                button_target_blank: true,
            },
        ]);

        setUnCollapsedList((list) => [...list, uid]);
    }, [blocks, setBlocks]);

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

                        setUnCollapsedList((collapsedList) => uniq([...collapsedList, ...errorIndexes]));
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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={blocks.map((block) => block.uid)} strategy={verticalListSortingStrategy}>
                    {blocks.map((block, index) => (
                        <ImplementationsBlockEditorItem
                            id={block.uid}
                            key={block.uid}
                            block={block}
                            errors={errors}
                            index={index}
                            onDelete={() => {
                                askConfirmation(() => {
                                    blocks.splice(index, 1);
                                    setBlocks([...blocks]);
                                });
                            }}
                            onChange={(value: Partial<ImplementationPageBlock>) => {
                                setBlocks((blocks) => {
                                    blocks[index] = { ...blocks[index], ...value };
                                    return [...blocks];
                                });
                            }}
                            unCollapsedList={unCollapsedList}
                            setUnCollapsedList={setUnCollapsedList}
                        />
                    ))}
                </SortableContext>
            </DndContext>

            <div className="block-editor-actions">
                <div className="button button-primary" onClick={() => addBlock()}>
                    <em className="mdi mdi-plus-circle icon-start" />
                    Blok toevoegen
                </div>
            </div>
        </div>
    );
}
