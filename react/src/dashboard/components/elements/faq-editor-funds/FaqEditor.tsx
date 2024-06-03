import React, { useCallback, useEffect, useState } from 'react';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { uniq, uniqueId } from 'lodash';
import { ResponseError, ResponseErrorData } from '../../../props/ApiResponses';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import Faq from '../../../props/models/Faq';
import FaqEditorItem from './FaqEditorItem';
import { useFaqService } from '../../../services/FaqService';
import Organization from '../../../props/models/Organization';
import useTranslate from '../../../hooks/useTranslate';
import ModalDangerZone from '../../modals/ModalDangerZone';
import useOpenModal from '../../../hooks/useOpenModal';

export default function FaqEditor({
    faq = [],
    organization,
    setFaq,
    errors = null,
    setErrors = null,
    createFaqRef = null,
}: {
    organization: Organization;
    faq: Array<Faq & { uid: string }>;
    setFaq: (faq: Array<Faq & { uid: string }>) => void;
    errors: ResponseErrorData;
    setErrors: (errors: ResponseErrorData) => void;
    createFaqRef: React.MutableRefObject<() => Promise<boolean>>;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const faqService = useFaqService();

    const [unCollapsedList, setUnCollapsedList] = useState([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const addQuestion = useCallback(() => {
        const uid = uniqueId();

        setFaq([...faq, { uid, title: '', description: '' }]);
        setUnCollapsedList((list) => [...list, uid]);
    }, [faq, setFaq]);

    const handleDragEnd = useCallback(
        (event) => {
            const { active, over } = event;

            if (active.id !== over.id) {
                const items = faq.map((preCheck) => preCheck.uid);
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);

                setFaq(arrayMove(faq, oldIndex, newIndex));
            }
        },
        [faq, setFaq],
    );

    const askConfirmation = useCallback(
        (onConfirm): void => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('modals.danger_zone.remove_implementation_block.title')}
                    description_text={translate('modals.danger_zone.remove_implementation_block.description')}
                    buttonCancel={{
                        text: translate('modals.danger_zone.remove_implementation_block.buttons.cancel'),
                        onClick: modal.close,
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

    const validate = useCallback(async (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            faqService
                .faqValidate(organization.id, faq)
                .then(() => resolve(true))
                .catch((err: ResponseError) => {
                    const { data, status } = err;
                    const { errors, message } = data;

                    if (errors && typeof errors == 'object') {
                        setErrors(errors);

                        const errorIndexes = Object.keys(errors)
                            .map((error) => error.split('.')[1] || null)
                            .filter((item) => item);

                        setUnCollapsedList((collapsedList) => uniq([...collapsedList, ...errorIndexes]));
                    }

                    reject(status == 422 ? translate('components.faq_editor.fix_validation_errors') : message);
                });
        });
    }, [faq, faqService, organization.id, setErrors, translate]);

    useEffect(() => {
        createFaqRef.current = validate;
    }, [createFaqRef, validate]);

    return (
        <div className="block block-faq-editor">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={faq.map((preCheck) => preCheck.uid)} strategy={verticalListSortingStrategy}>
                    <div className="question-wrapper">
                        {faq?.map((faqItem, questionKey) => (
                            <FaqEditorItem
                                key={faqItem.uid}
                                id={faqItem.uid}
                                faqItem={faqItem}
                                onDelete={() => {
                                    askConfirmation(() => {
                                        faq.splice(questionKey, 1);
                                        setFaq([...faq]);
                                    });
                                }}
                                onChange={(value: Partial<Faq>) => {
                                    Object.assign(faq[questionKey], value);
                                    setFaq([...faq]);
                                }}
                                errors={errors}
                                index={questionKey}
                                unCollapsedList={unCollapsedList}
                                setUnCollapsedList={setUnCollapsedList}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <div className="faq-editor-actions">
                <div className="button button-primary" onClick={addQuestion}>
                    <em className="mdi mdi-plus-circle icon-start" />
                    {translate('components.faq_editor.buttons.add_question')}
                </div>
            </div>
        </div>
    );
}
