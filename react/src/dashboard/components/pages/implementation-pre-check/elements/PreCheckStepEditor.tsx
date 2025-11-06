import React, { useCallback, useRef, useState } from 'react';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import PreCheck from '../../../../props/models/PreCheck';
import { uniqueId } from 'lodash';
import { ResponseErrorData } from '../../../../props/ApiResponses';
import ModalDangerZone from '../../../../components/modals/ModalDangerZone';
import useOpenModal from '../../../../hooks/useOpenModal';
import {
    closestCenter,
    CollisionDetection,
    DndContext,
    getFirstCollision,
    KeyboardSensor,
    MeasuringStrategy,
    PointerSensor,
    pointerWithin,
    rectIntersection,
    useSensor,
    useSensors,
} from '@dnd-kit/core';

import useTranslate from '../../../../hooks/useTranslate';
import PreCheckStepEditorItem from './PreCheckStepEditorItem';
import PreCheckRecord from '../../../../props/models/PreCheckRecord';

export default function PreCheckStepEditor({
    preChecks = null,
    setPreChecks,
    errors = null,
}: {
    preChecks: Array<PreCheck>;
    setPreChecks: React.Dispatch<React.SetStateAction<Array<PreCheck>>>;
    errors: ResponseErrorData;
}) {
    const openModal = useOpenModal();
    const translate = useTranslate();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const [activeId, setActiveId] = useState<string | null>(null);
    const lastOverId = useRef<string | null>(null);

    const [clonedItems, setClonedItems] = useState<Array<PreCheck>>(null);
    const [unCollapsed, setUnCollapsed] = useState<Array<string>>([]);

    const isSortingContainer = activeId ? preChecks.map((item) => item.uid).includes(activeId.toString()) : false;
    const recentlyMovedToNewContainer = useRef(false);

    const askConfirmation = useCallback(
        (onConfirm): void => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('modals.danger_zone.remove_implementation_block.title')}
                    description_text={translate('modals.danger_zone.remove_implementation_block.description')}
                    buttonCancel={{
                        text: translate('modals.danger_zone.remove_implementation_block.buttons.cancel'),
                        onClick: () => modal.close(),
                    }}
                    buttonSubmit={{
                        text: translate('modals.danger_zone.remove_implementation_block.buttons.confirm'),
                        onClick: () => {
                            modal.close();
                            onConfirm();
                        },
                    }}
                />
            ));
        },
        [openModal, translate],
    );

    const removePreCheck = useCallback(
        (preCheckIndex: number) => {
            askConfirmation(() => {
                const deletedPreCheck = preChecks.splice(preCheckIndex, 1)[0];
                const defaultPreCheck = preChecks.find((preCheck) => preCheck.default);

                defaultPreCheck.record_types = [
                    ...(defaultPreCheck.record_types || []),
                    ...(deletedPreCheck.record_types || []),
                ];

                setPreChecks([...preChecks]);
            });
        },
        [askConfirmation, preChecks, setPreChecks],
    );

    const addPreCheck = useCallback(() => {
        const preCheck = {
            uid: uniqueId(),
            label: '',
            title: '',
            uncollapsed: true,
            description: '',
            record_types: [],
        };

        setPreChecks([...preChecks, preCheck]);
        setUnCollapsed([...unCollapsed, preCheck.uid]);
    }, [preChecks, unCollapsed, setPreChecks]);

    const findContainer = useCallback(
        (id: string) => {
            if (preChecks.map((item) => item.uid).includes(id.toString())) {
                return id;
            }

            return preChecks.find((item) =>
                item.record_types.map((type) => type.record_type_key).includes(id.toString()),
            )?.uid;
        },
        [preChecks],
    );

    const onDragEnd = useCallback(
        ({ active, over }) => {
            if (preChecks.map((item) => item.uid).includes(over?.id.toString())) {
                setPreChecks((items) => {
                    const activeIndex = items.findIndex((item) => item.uid == active.id);
                    const overIndex = items.findIndex((item) => item.uid == over.id);

                    return arrayMove(items, activeIndex, overIndex);
                });
            }

            const overContainerId = findContainer(over?.id);
            const overContainerIndex = preChecks.findIndex((item) => item.uid == overContainerId);

            const activeContainerId = findContainer(active.id);
            const activeContainerIndex = preChecks.findIndex((item) => item.uid == activeContainerId);

            if (!activeContainerId || over?.id == null) {
                setActiveId(null);
                return;
            }

            if (overContainerId) {
                const activeIndex = preChecks[activeContainerIndex].record_types?.findIndex(
                    (type: PreCheckRecord) => type.record_type_key == active?.id,
                );

                const overIndex = preChecks[overContainerIndex].record_types?.findIndex(
                    (type: PreCheckRecord) => type.record_type_key == over?.id,
                );

                if (activeIndex !== overIndex) {
                    setPreChecks((items) => {
                        items[overContainerIndex] = {
                            ...items[overContainerIndex],
                            record_types: arrayMove(items[overContainerIndex].record_types, activeIndex, overIndex),
                        };

                        return [...items];
                    });
                }
            }

            setActiveId(null);
        },
        [findContainer, preChecks, setPreChecks],
    );

    const onDragCancel = useCallback(() => {
        if (clonedItems) {
            setPreChecks(clonedItems);
        }

        setActiveId(null);
        setClonedItems(null);
    }, [clonedItems, setPreChecks]);

    const onDragStart = useCallback(
        ({ active }) => {
            setActiveId(active.id);
            setClonedItems(preChecks);
        },
        [preChecks],
    );

    const onDragOver = useCallback(
        ({ active, over }) => {
            const overId = over?.id;

            // sorting containers
            if (overId == null || preChecks.find((item) => item.uid === active.id)) {
                return;
            }

            const overContainerId = findContainer(overId);
            const activeContainerId = findContainer(active.id);

            if (!overContainerId || !activeContainerId || activeContainerId === overContainerId) {
                return;
            }

            setPreChecks((preChecks) => {
                const activeItems = preChecks.find((item) => item.uid == activeContainerId)?.record_types;
                const activeIndex = activeItems.findIndex((type) => type.record_type_key == active.id.toString());

                const overItems = preChecks.find((item) => item.uid == overContainerId)?.record_types;
                const overIndex = overItems.findIndex((type) => type.record_type_key == over.id.toString());

                let newIndex: number;

                if (preChecks.map((item) => item.uid).includes(overId.toString())) {
                    newIndex = overItems.length + 1;
                } else {
                    const isBelowOverItem =
                        over &&
                        active.rect.current.translated &&
                        active.rect.current.translated.top > over.rect.top + over.rect.height;

                    const modifier = isBelowOverItem ? 1 : 0;

                    newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
                }

                recentlyMovedToNewContainer.current = true;

                const overContainer = preChecks.find((item) => item.uid == overContainerId);
                const activeContainer = preChecks.find((item) => item.uid == activeContainerId);
                const activeContainerItem = activeContainer.record_types[activeIndex];

                activeContainer.record_types = activeContainer.record_types.filter(
                    (type) => type.record_type_key !== active.id.toString(),
                );

                overContainer.record_types = [
                    ...overItems.slice(0, newIndex),
                    activeContainerItem,
                    ...overItems.slice(newIndex, overContainer.record_types.length),
                ];

                return [...preChecks];
            });
        },
        [findContainer, preChecks, setPreChecks],
    );

    const collisionDetectionStrategy: CollisionDetection = useCallback(
        (args) => {
            if (activeId && preChecks.map((item) => item.uid).includes(activeId?.toString())) {
                return closestCenter({
                    ...args,
                    droppableContainers: args.droppableContainers.filter((container) =>
                        preChecks.map((item) => item.uid).includes(container.id?.toString()),
                    ),
                });
            }

            // Start by finding any intersecting droppable
            const pointerIntersections = pointerWithin(args);
            // If there are droppables intersecting with the pointer, return those
            const intersections = pointerIntersections.length > 0 ? pointerIntersections : rectIntersection(args);

            let overId = getFirstCollision(intersections, 'id');

            if (overId != null) {
                if (preChecks.map((item) => item.uid).includes(overId?.toString())) {
                    const containerItems = preChecks.find((item) => item.uid == overId?.toString()).record_types;

                    // If a container is matched and it contains items (columns 'A', 'B', 'C')
                    if (containerItems.length > 0) {
                        // Return the closest droppable within that container
                        overId = closestCenter({
                            ...args,
                            droppableContainers: args.droppableContainers.filter(
                                (container) =>
                                    container.id !== overId &&
                                    containerItems
                                        .map((type) => type.record_type_key)
                                        .includes(container.id?.toString()),
                            ),
                        })[0]?.id;
                    }
                }

                lastOverId.current = overId?.toString();

                return [{ id: overId }];
            }

            // When a draggable item moves to a new container, the layout may shift
            // and the `overId` may become `null`. We manually set the cached `lastOverId`
            // to the id of the draggable item that was moved to the new container, otherwise
            // the previous `overId` will be returned which can cause items to incorrectly shift positions
            if (recentlyMovedToNewContainer.current) {
                lastOverId.current = activeId;
            }

            // If no droppable is matched, return the last match
            return lastOverId.current ? [{ id: lastOverId.current }] : [];
        },
        [activeId, preChecks],
    );

    return (
        <div className="block block-pre-checks-blocks-editor">
            <DndContext
                sensors={sensors}
                collisionDetection={collisionDetectionStrategy}
                measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
                onDragCancel={onDragCancel}>
                <SortableContext
                    id={'preChecks'}
                    items={(preChecks || []).map((preCheck) => preCheck.uid)}
                    strategy={verticalListSortingStrategy}>
                    {preChecks?.map((preCheck, index) => (
                        <PreCheckStepEditorItem
                            key={preCheck.uid}
                            preCheck={preCheck}
                            preCheckIndex={index}
                            unCollapsed={unCollapsed}
                            setUnCollapsed={setUnCollapsed}
                            preChecks={preChecks}
                            setPreChecks={setPreChecks}
                            errors={errors}
                            removePreCheck={removePreCheck}
                            isSortingContainer={isSortingContainer}
                        />
                    ))}
                </SortableContext>
            </DndContext>

            <div className="pre-check-actions">
                <div className="button button-primary" onClick={addPreCheck}>
                    <em className="mdi mdi-plus-circle icon-start" />
                    Stap toevoegen
                </div>
            </div>
        </div>
    );
}
