import React, { useCallback, useEffect } from 'react';
import ReservationField from '../../../../props/models/ReservationField';
import { ResponseErrorData } from '../../../../props/ApiResponses';
import { uniq, uniqueId } from 'lodash';
import FormError from '../../../elements/forms/errors/FormError';
import ReservationFieldItem from './ReservationFieldItem';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import useTranslate from '../../../../hooks/useTranslate';

type FieldsLocal = ReservationField & { expanded?: boolean; uid?: string };

export default function ReservationFieldsEditor({
    fields,
    onChange,
    errors,
}: {
    fields: Array<FieldsLocal>;
    onChange: React.Dispatch<React.SetStateAction<Array<FieldsLocal>>>;
    errors: ResponseErrorData;
}) {
    const translate = useTranslate();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const addField = useCallback(() => {
        onChange([
            ...fields,
            {
                type: 'text',
                label: '',
                required: false,
                expanded: true,
                description: '',
                fillable_by: 'requester',
                uid: uniqueId(),
            },
        ]);
    }, [fields, onChange]);

    const expandById = useCallback(
        (index: string[]) => {
            onChange((fields) => {
                const list = Array.isArray(index) ? index : [index];

                for (let i = 0; i < list.length; i++) {
                    fields[list[i]].collapsed = false;
                }

                return [...fields];
            });
        },
        [onChange],
    );

    const handleDragEnd = useCallback(
        (event) => {
            const { active, over } = event;

            if (active.id !== over.id) {
                onChange((fields) => {
                    const items = fields.map((field) => field.uid);
                    const oldIndex = items.indexOf(active.id);
                    const newIndex = items.indexOf(over.id);

                    return arrayMove(fields, oldIndex, newIndex);
                });
            }
        },
        [onChange],
    );

    const expandErrors = useCallback(() => {
        if (errors && typeof errors == 'object') {
            const ids = uniq(Object.keys(errors).map((error) => error.split('.')[1] || null));
            expandById(ids.filter((rowIndex) => !isNaN(parseInt(rowIndex))));
        }
    }, [errors, expandById]);

    useEffect(() => {
        expandErrors();
    }, [expandErrors]);

    return (
        <div className="block block-faq-editor">
            {fields.length > 0 && (
                <div className="question-wrapper">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext
                            items={fields.map((field) => field.uid)}
                            strategy={verticalListSortingStrategy}>
                            {fields.map((field, index) => (
                                <ReservationFieldItem
                                    id={field.uid}
                                    key={field.uid}
                                    field={field}
                                    fields={fields}
                                    onChange={onChange}
                                    errors={errors}
                                    index={index}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            )}
            <div className="faq-editor-actions">
                <button
                    className="button button-primary"
                    type="button"
                    disabled={fields.length >= 10}
                    onClick={() => addField()}>
                    <em className="mdi mdi-plus-circle icon-start" />
                    {translate('reservation_settings.buttons.add_field')}
                </button>
            </div>
            <FormError error={errors.fields} />
        </div>
    );
}
