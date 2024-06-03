import FormError from '../forms/errors/FormError';
import MarkdownEditor from '../forms/markdown-editor/MarkdownEditor';
import React, { useMemo } from 'react';
import { ResponseErrorData } from '../../../props/ApiResponses';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Faq from '../../../props/models/Faq';
import useTranslate from '../../../hooks/useTranslate';

export default function FaqEditorItem({
    id,
    faqItem,
    onChange,
    errors,
    index,
    onDelete,
    unCollapsedList,
    setUnCollapsedList,
}: {
    id: string;
    faqItem: Faq & { uid: string };
    errors: ResponseErrorData;
    index: number;
    onDelete: () => void;
    onChange: (faq: Partial<Faq>) => void;
    unCollapsedList: Array<string>;
    setUnCollapsedList: React.Dispatch<React.SetStateAction<Array<string>>>;
}) {
    const translate = useTranslate();
    const isCollapsed = useMemo(() => !unCollapsedList.includes(faqItem.uid), [unCollapsedList, faqItem]);

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div className="question-item" ref={setNodeRef} style={style}>
            <div className="question-header">
                <em className="mdi mdi-dots-vertical question-drag" {...attributes} {...listeners}></em>

                <div className={`question-icon ${isCollapsed && (!faqItem.title || !faqItem.description)}`}>
                    <em className="mdi mdi-frequently-asked-questions" />
                </div>

                <div className="question-title">
                    {!isCollapsed ? (
                        <span>{!faqItem.id ? 'Nieuwe vraag' : 'Vraag aanpassen'}</span>
                    ) : (
                        <span>{faqItem.title || 'Geen vraag'}</span>
                    )}
                </div>

                <div className="question-actions">
                    {!isCollapsed ? (
                        <div
                            className="button button-default button-sm"
                            onClick={() => setUnCollapsedList((list) => list.filter((item) => item !== faqItem.uid))}>
                            <em className="mdi mdi-arrow-collapse-vertical icon-start"></em>
                            {translate('components.faq_editor.item.buttons.collapse')}
                        </div>
                    ) : (
                        <div
                            className="button button-primary button-sm"
                            onClick={() => setUnCollapsedList((list) => [...list, faqItem.uid])}>
                            <em className="mdi mdi-arrow-expand-vertical icon-start"></em>
                            {translate('components.faq_editor.item.buttons.expand')}
                        </div>
                    )}

                    <div className="button button-danger button-sm" onClick={onDelete}>
                        <em className="mdi mdi-trash-can-outline icon-start"></em>
                        {translate('components.faq_editor.item.buttons.delete')}
                    </div>
                </div>
            </div>

            {!isCollapsed && (
                <div className="question-body">
                    <div className="form">
                        <div className="form-group">
                            <label className="form-label form-label-required">Vraag</label>
                            <input
                                className="form-control"
                                type="text"
                                defaultValue={faqItem.title || ''}
                                onChange={(e) => onChange({ title: e.target.value })}
                                placeholder="Title..."
                            />
                            <div className="form-hint">Max. 200 tekens</div>
                            <FormError error={errors?.[`faq.${index}.title`]} />
                        </div>

                        <div className="form-group">
                            <label className="form-label form-label-required">Antwoord</label>
                            <MarkdownEditor
                                value={faqItem.description_html || faqItem.description || ''}
                                onChange={(description) => onChange({ description: description })}
                                extendedOptions={true}
                                placeholder={translate('organization_edit.labels.description')}
                            />
                            <div className="form-hint">Max. 5000 tekens</div>
                            <FormError error={errors?.[`faq.${index}.description`]} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
