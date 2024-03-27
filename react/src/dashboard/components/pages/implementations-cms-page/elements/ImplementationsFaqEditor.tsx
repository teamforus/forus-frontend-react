import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import FormError from '../../../elements/forms/errors/FormError';
import { ResponseErrorData } from '../../../../props/ApiResponses';
import MarkdownEditor from '../../../elements/forms/markdown-editor/MarkdownEditor';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import useOpenModal from '../../../../hooks/useOpenModal';
import { ImplementationPageFaq } from '../../../../props/models/ImplementationPage';
import { ReactSortable } from 'react-sortablejs';
import { uniqueId } from 'lodash';

type ImplementationPageFaqLocal = ImplementationPageFaq & {
    collapsed?: boolean;
};

export default function ImplementationsFaqEditor({
    faqs,
    errors,
    onChange,
}: {
    faqs: Array<ImplementationPageFaqLocal>;
    errors?: ResponseErrorData;
    onChange: (faqs: Array<ImplementationPageFaqLocal>) => void;
}) {
    const { t } = useTranslation();
    const openModal = useOpenModal();

    const updateValue = useCallback(
        (block: ImplementationPageFaqLocal, key: string, value: string | number | boolean) => {
            const list = [...faqs];
            const index = list.indexOf(block);
            list[index][key] = value;
            onChange(list);
        },
        [faqs, onChange],
    );

    const removeBlock = useCallback(
        (blockIndex: number) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={t('modals.danger_zone.remove_faq.title')}
                    description={t('modals.danger_zone.remove_faq.description')}
                    buttonCancel={{
                        onClick: modal.close,
                        text: t('modals.danger_zone.remove_faq.buttons.cancel'),
                    }}
                    buttonSubmit={{
                        onClick: () => {
                            modal.close();
                            const list = [...faqs];
                            list.splice(blockIndex, 1);
                            onChange(list);
                        },
                        text: t('modals.danger_zone.remove_faq.buttons.confirm'),
                    }}
                />
            ));
        },
        [faqs, onChange, openModal, t],
    );

    const addBlock = useCallback(() => {
        const list = [...faqs];

        list.push({
            id: uniqueId('sortable_'),
            title: '',
            collapsed: true,
            description: '',
        });

        onChange(list);
    }, [faqs, onChange]);

    return (
        <div className="block block-faq-editor">
            <div className="question-wrapper">
                <ReactSortable list={faqs} setList={(list) => onChange(list)} animation={150} handle={'.question-drag'}>
                    {faqs.map((block, index) => (
                        <div className="question-item" key={index}>
                            <div className="question-header">
                                <em className="mdi mdi-dots-vertical question-drag" />
                                <div
                                    className={`question-icon ${
                                        !block.collapsed && (!block.title || !block.description) ? 'text-danger' : ''
                                    }`}>
                                    <em className="mdi mdi-frequently-asked-questions" />
                                </div>

                                <div className="question-title">
                                    {block.collapsed ? (
                                        <span>{!block.id ? 'Nieuwe vraag' : 'Vraag aanpassen'}</span>
                                    ) : (
                                        <span>{block.title || 'Geen vraag'}</span>
                                    )}
                                </div>

                                <div className="question-actions">
                                    {block.collapsed ? (
                                        <div
                                            className="button button-default button-sm"
                                            onClick={() => updateValue(block, 'collapsed', false)}>
                                            <em className="mdi mdi-arrow-collapse-vertical icon-start" />
                                            {t('components.faq_editor.item.buttons.collapse')}
                                        </div>
                                    ) : (
                                        <div
                                            className="button button-primary button-sm"
                                            onClick={() => updateValue(block, 'collapsed', true)}>
                                            <em className="mdi mdi-arrow-expand-vertical icon-start" />
                                            {t('components.faq_editor.item.buttons.expand')}
                                        </div>
                                    )}

                                    <div className="button button-danger button-sm" onClick={() => removeBlock(index)}>
                                        <em className="mdi mdi-trash-can-outline icon-start" />
                                        {t('components.faq_editor.item.buttons.delete')}
                                    </div>
                                </div>
                            </div>

                            {block.collapsed && (
                                <div className="question-body">
                                    <div className="form">
                                        <div className="form-group">
                                            <label className="form-label form-label-required">Vraag</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                value={block.title}
                                                onChange={(e) => updateValue(block, 'title', e.target.value)}
                                                placeholder="Vraag..."
                                            />
                                            <div className="form-hint">Max. 200 tekens</div>
                                            <FormError error={errors['faq.' + index + '.title']} />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label form-label-required">Antwoord</label>
                                            <MarkdownEditor
                                                extendedOptions={true}
                                                value={block.description_html}
                                                onChange={(value) => updateValue(block, 'description', value)}
                                                placeholder="Antwoord..."
                                            />
                                            <div className="form-hint">Max. 5000 tekens</div>
                                            <FormError error={errors['faq.' + index + '.description']} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </ReactSortable>
            </div>
            <div className="faq-editor-actions">
                <div className="button button-primary" onClick={() => addBlock()}>
                    <em className="mdi mdi-plus-circle icon-start" />
                    {t('components.faq_editor.buttons.add_question')}
                </div>
            </div>
        </div>
    );
}
