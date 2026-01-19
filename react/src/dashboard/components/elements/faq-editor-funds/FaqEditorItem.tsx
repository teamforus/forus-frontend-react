import MarkdownEditor from '../forms/markdown-editor/MarkdownEditor';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { ResponseErrorData } from '../../../props/ApiResponses';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Faq from '../../../props/models/Faq';
import useTranslate from '../../../hooks/useTranslate';
import FormGroup from '../forms/elements/FormGroup';

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

                {faqItem.type === 'question' ? (
                    <div
                        className={classNames(
                            'question-icon',
                            isCollapsed && (!faqItem.title || !faqItem.description) && 'text-danger',
                        )}>
                        <em className="mdi mdi-frequently-asked-questions" />
                    </div>
                ) : (
                    <div className={classNames('question-icon', isCollapsed && !faqItem.title && 'text-danger')}>
                        <em className="mdi mdi-format-title" />
                    </div>
                )}

                <div className="question-title">
                    {!isCollapsed ? (
                        <span>
                            {!faqItem.id
                                ? faqItem.type === 'question'
                                    ? 'Nieuwe vraag'
                                    : 'Nieuwe titel'
                                : faqItem.type === 'question'
                                  ? 'Vraag aanpassen'
                                  : 'Titel aanpassen'}
                        </span>
                    ) : (
                        <span>{faqItem.title || (faqItem.type === 'question' ? 'Geen vraag' : 'Geen titel')}</span>
                    )}
                </div>

                <div className="question-actions">
                    {!isCollapsed ? (
                        <div
                            className="button button-default button-sm"
                            onClick={() => setUnCollapsedList((list) => list.filter((item) => item !== faqItem.uid))}>
                            <em className="mdi mdi-arrow-collapse-vertical icon-start" />
                            {translate('components.faq_editor.item.buttons.collapse')}
                        </div>
                    ) : (
                        <div
                            className="button button-primary button-sm"
                            onClick={() => setUnCollapsedList((list) => [...list, faqItem.uid])}>
                            <em className="mdi mdi-arrow-expand-vertical icon-start" />
                            {translate('components.faq_editor.item.buttons.expand')}
                        </div>
                    )}

                    <div className="button button-danger button-sm" onClick={onDelete}>
                        <em className="mdi mdi-trash-can-outline icon-start" />
                        {translate('components.faq_editor.item.buttons.delete')}
                    </div>
                </div>
            </div>

            {!isCollapsed && (
                <div className="question-body">
                    <div className="form">
                        <FormGroup
                            required={true}
                            label="Vraag"
                            hint="Max. 200 tekens"
                            error={errors?.[`faq.${index}.title`]}
                            input={(id) => (
                                <input
                                    className="form-control"
                                    id={id}
                                    type="text"
                                    defaultValue={faqItem.title || ''}
                                    onChange={(e) => onChange({ title: e.target.value })}
                                    placeholder="Title..."
                                />
                            )}
                        />

                        {faqItem.type === 'question' ? (
                            <FormGroup
                                required={true}
                                label="Antwoord"
                                hint="Max. 5000 tekens"
                                error={errors?.[`faq.${index}.description`]}
                                input={() => (
                                    <MarkdownEditor
                                        value={faqItem.description_html}
                                        onChange={(description) => onChange({ description: description })}
                                        extendedOptions={true}
                                        placeholder={translate('organization_edit.labels.description')}
                                    />
                                )}
                            />
                        ) : (
                            <FormGroup
                                label="Subtitel"
                                hint="Max. 500 tekens"
                                error={errors?.[`faq.${index}.subtitle`]}
                                input={(id) => (
                                    <textarea
                                        className="r-n form-control"
                                        id={id}
                                        placeholder="Subtitel"
                                        value={faqItem.subtitle}
                                        onChange={(e) => onChange({ subtitle: e.target.value })}
                                    />
                                )}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
