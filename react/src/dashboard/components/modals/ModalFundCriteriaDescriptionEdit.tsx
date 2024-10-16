import React, { useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import FormError from '../elements/forms/errors/FormError';
import useFormBuilder from '../../hooks/useFormBuilder';
import FundCriterion from '../../props/models/FundCriterion';
import { ResponseError } from '../../props/ApiResponses';
import MarkdownEditor from '../elements/forms/markdown-editor/MarkdownEditor';
import useTranslate from '../../hooks/useTranslate';

type FundCriterionTexts = {
    title: string;
    description: string;
    extra_description: string;
    description_html: string;
    extra_description_html: string;
};

export default function ModalFundCriteriaDescriptionEdit({
    modal,
    criterion,
    criterionTexts,
    validateCriteria,
    onSubmit,
}: {
    modal: ModalState;
    criterion: FundCriterion;
    validateCriteria: (criterion: FundCriterion) => Promise<Array<unknown>>;
    criterionTexts: FundCriterionTexts;
    onSubmit?: (res: FundCriterionTexts) => void;
}) {
    const translate = useTranslate();

    const [descriptionHtml, setDescriptionHtml] = useState(criterionTexts.description_html);
    const [extraDescriptionHtml, setExtraDescriptionHtml] = useState(criterionTexts.extra_description_html);

    const form = useFormBuilder<FundCriterionTexts>(
        {
            title: criterionTexts.title,
            description: criterionTexts.description,
            description_html: criterionTexts.description_html,
            extra_description: criterionTexts.extra_description,
            extra_description_html: criterionTexts.extra_description_html,
        },
        (values) => {
            validateCriteria({
                ...criterion,
                title: form.values.title,
                description: form.values.description,
                extra_description: form.values.extra_description,
            })
                .then(() => {
                    onSubmit({
                        title: values.title,
                        description: values.description,
                        extra_description: values.extra_description,
                        description_html: descriptionHtml,
                        extra_description_html: extraDescriptionHtml,
                    });
                    modal.close();
                })
                .catch((err: ResponseError) => {
                    const errorKeys = Object.keys(err.data.errors);

                    if (errorKeys.filter((key) => key.endsWith('.title') || key.endsWith('.description')).length > 0) {
                        form.setErrors(err.data.errors);
                    } else {
                        modal.close();
                    }
                })
                .finally(() => form.setIsLocked(false));
        },
    );

    return (
        <div className={`modal modal-animated ${modal.loading ? 'modal-loading' : null}`}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />

                <div className="modal-header">{translate('modals.modal_fund_criteria_description.title')}</div>

                <div className="modal-body">
                    <div className="modal-section">
                        <div className="form-group">
                            <label className="form-label">
                                {translate('modals.modal_fund_criteria_description.labels.title')}
                            </label>

                            <input
                                className="form-control"
                                value={form.values.title || ''}
                                placeholder="Titel"
                                onChange={(e) => form.update({ title: e.target.value })}
                            />

                            <FormError error={form.errors['criteria.0.title']} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                {translate('modals.modal_fund_criteria_description.labels.description')}
                            </label>

                            <MarkdownEditor
                                value={form.values.description_html || ''}
                                height={200}
                                onChange={(description: string) => form.update({ description: description })}
                                onUpdatedRaw={(data) => {
                                    setDescriptionHtml(data.data.content_html);
                                }}
                            />

                            <FormError error={form.errors['criteria.0.description']} />
                        </div>

                        {criterion.fund_criteria_step_id && (
                            <div className="form-group">
                                <label className="form-label">
                                    {translate('modals.modal_fund_criteria_description.labels.extra_description')}
                                </label>

                                <MarkdownEditor
                                    value={form.values.extra_description_html || ''}
                                    height={200}
                                    onChange={(description: string) => form.update({ extra_description: description })}
                                    onUpdatedRaw={(data) => {
                                        setExtraDescriptionHtml(data.data.content_html);
                                    }}
                                />

                                <FormError error={form.errors['criteria.0.extra_description']} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button className="button button-default" type="button" onClick={modal.close}>
                        {translate('modals.modal_fund_criteria_description.buttons.close')}
                    </button>
                    <button className="button button-primary" type="submit">
                        {translate('modals.modal_fund_criteria_description.buttons.save')}
                    </button>
                </div>
            </form>
        </div>
    );
}
