import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useFormBuilder from '../../../hooks/useFormBuilder';
import useEnvData from '../../../hooks/useEnvData';
import FormError from '../../elements/forms/errors/FormError';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import useFeedbackService from '../../../services/FeedbackService';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import usePushDanger from '../../../hooks/usePushDanger';
import useAssetUrl from '../../../hooks/useAssetUrl';
import { ResponseError } from '../../../props/ApiResponses';
import useAuthIdentity from '../../../hooks/useAuthIdentity';

export default function Feedback() {
    const { t } = useTranslation();
    const envData = useEnvData();
    const authIdentity = useAuthIdentity();

    const assetUrl = useAssetUrl();
    const pushDanger = usePushDanger();

    const feedbackService = useFeedbackService();

    const [state, setState] = useState<string>('form');

    const [urgencyOptions] = useState([
        { value: null, label: 'Selecteer' },
        { value: 'low', label: 'Laag' },
        { value: 'medium', label: 'Gemiddeld' },
        { value: 'high', label: 'Hoog' },
    ]);

    const form = useFormBuilder(
        {
            title: '',
            urgency: urgencyOptions[0].value,
            content: '',
            use_customer_email: false,
            customer_email: authIdentity?.email || '',
        },
        (values) => {
            feedbackService
                .store({
                    ...values,
                    customer_email: values.use_customer_email ? values.customer_email : null,
                })
                .then(() => setState('success'))
                .catch((err: ResponseError) => {
                    if (err.status == 429) {
                        pushDanger(err?.data?.message);
                    }

                    if (err.status != 422) {
                        return setState('error');
                    }

                    setState('form');
                    form.setErrors(err?.data?.errors);
                })
                .finally(() => form.setIsLocked(false));
        },
    );

    return (
        <>
            {state === 'form' && (
                <div className="card">
                    <form className="form" onSubmit={() => setState('confirmation')}>
                        <div className="card-header">
                            <div className="card-title">{t('components.feedback.title')}</div>
                        </div>

                        {/* Description */}
                        <div className="card-section card-section-primary">
                            <div className="block block-information">
                                <em className="mdi mdi-information block-information-icon"></em>
                                <div className="block-information-info">
                                    Bedankt voor het delen van de feedback. Hierdoor kunnen we het systeem verder
                                    verbeteren.
                                    <br />
                                    {envData?.config?.feedback_email && (
                                        <span>
                                            Heb je vragen over het gebruik en wil je graag hulp? Neem dan contact op met
                                            onze helpdesk via !{envData?.config?.feedback_email}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="card-section card-section-primary">
                            <div className="row">
                                <div className="col col-lg-9 col-xs-12">
                                    <div className="form-group form-group-inline">
                                        <label className="form-label form-label-required">
                                            {t('components.feedback.labels.title')}
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={200}
                                            className="form-control r-n"
                                            name="name"
                                            value={form.values?.title || ''}
                                            onChange={(e) => form.update({ title: e.target.value })}
                                            placeholder={t('components.feedback.labels.title')}
                                        />
                                        <FormError error={form.errors?.title} />
                                    </div>

                                    <div className="form-group form-group-inline">
                                        <label className="form-label">{t('components.feedback.labels.urgency')}</label>
                                        <SelectControl
                                            className="form-control"
                                            propValue={'label'}
                                            propKey={'value'}
                                            allowSearch={false}
                                            value={form.values?.urgency}
                                            onChange={(urgency: string) => form.update({ urgency })}
                                            options={urgencyOptions}
                                            optionsComponent={SelectControlOptions}
                                        />
                                        <FormError error={form.errors?.urgency} />
                                    </div>

                                    <div className="form-group form-group-inline">
                                        <label className="form-label form-label-required">
                                            {t('components.feedback.labels.content')}
                                        </label>
                                        <textarea
                                            maxLength={4000}
                                            className="form-control r-n"
                                            name="content"
                                            value={form.values?.content || ''}
                                            onChange={(e) => form.update({ content: e.target.value })}
                                            placeholder={t('components.feedback.labels.content')}
                                        />
                                        <FormError error={form.errors?.content} />
                                    </div>

                                    <div className="form-group form-group-inline">
                                        <label htmlFor="" className="form-label">
                                            {t('components.feedback.labels.contact')}
                                        </label>

                                        <CheckboxControl
                                            id="use_email"
                                            title={t('components.feedback.labels.use_customer_email')}
                                            checked={form.values?.use_customer_email}
                                            onChange={(e) => form.update({ use_customer_email: e.target.checked })}
                                        />
                                        <FormError error={form.errors?.use_customer_email} />
                                    </div>

                                    {form.values?.use_customer_email && (
                                        <div className="form-group form-group-inline">
                                            <label className="form-label form-label-required">
                                                {t('components.feedback.labels.email')}
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control r-n"
                                                name="customer_email"
                                                value={form.values.customer_email || ''}
                                                onChange={(e) => form.update({ customer_email: e.target.value })}
                                            />
                                            <FormError error={form.errors?.customer_email} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="card-section card-section-primary">
                            <div className="text-center">
                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="button button-primary"
                                    disabled={
                                        !form.values.title ||
                                        !form.values.content ||
                                        (form.values.use_customer_email && !form.values.customer_email)
                                    }>
                                    {t('components.feedback.buttons.confirm')}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {state === 'confirmation' && (
                <div className="card">
                    <form className="form" onSubmit={form.submit}>
                        <div className="card-header">
                            <div className="card-title">{t('components.feedback.title')}</div>
                        </div>

                        <div className="card-section card-section-primary">
                            <div className="row">
                                <div className="col col-lg-9">
                                    <div className="form-data-preview">
                                        <div className="form-group form-group-inline">
                                            <label className="form-label">
                                                {t('components.feedback.labels.title')}
                                            </label>
                                            <span className="form-input-data">{form.values?.title}</span>
                                        </div>

                                        {form.values.urgency && (
                                            <div className="form-group form-group-inline">
                                                <label className="form-label">
                                                    {t('components.feedback.labels.urgency')}
                                                </label>
                                                <span className="form-input-data">
                                                    {
                                                        urgencyOptions.find(
                                                            (option) => option.value === form.values?.urgency,
                                                        )?.label
                                                    }
                                                </span>
                                            </div>
                                        )}

                                        {form.values?.content && (
                                            <div className="form-group form-group-inline">
                                                <label className="form-label">
                                                    {t('components.feedback.labels.content')}
                                                </label>
                                                <span className="form-input-data">{form.values?.content}</span>
                                            </div>
                                        )}

                                        {form.values?.use_customer_email && (
                                            <div className="form-group form-group-inline">
                                                <label className="form-label">
                                                    {t('components.feedback.labels.email')}
                                                </label>
                                                <span className="form-input-data">{form.values?.customer_email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-section card-section-primary">
                            <div className="text-center">
                                <button
                                    type="button"
                                    className="button button-default"
                                    onClick={() => setState('form')}>
                                    {t('components.feedback.buttons.back')}
                                </button>

                                <button type="submit" className="button button-primary">
                                    {t('components.feedback.buttons.send')}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {state === 'success' && (
                <div className="card">
                    <form className="form">
                        <div className="card-header">
                            <div className="card-title">{t('components.feedback.title')}</div>
                        </div>

                        <div className="card-section card-section-primary">
                            <div className="block block-feedback-result">
                                <div className="text-center">
                                    <img
                                        src={assetUrl('/assets/img/feedback-success.svg')}
                                        className="feedback-result-icon"
                                        alt={''}
                                    />
                                    <div className="feedback-result-title">
                                        {t('components.feedback.submit_success.title')}
                                    </div>
                                    <div className="feedback-result-info">
                                        {t('components.feedback.submit_success.info')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-section card-section-primary">
                            <div className="text-center">
                                <button
                                    type="button"
                                    className="button button-primary"
                                    onClick={() => {
                                        setState('form');
                                        form.reset();
                                    }}>
                                    {t('components.feedback.buttons.confirm')}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {state === 'error' && (
                <div className="card">
                    <form className="form">
                        <div className="card-header">
                            <div className="card-title">{t('components.feedback.title')}</div>
                        </div>

                        <div className="card-section card-section-primary">
                            <div className="block block-feedback-result">
                                <div className="text-center">
                                    <img
                                        src={assetUrl('/assets/img/feedback-failure.svg')}
                                        className="feedback-result-icon"
                                        alt={''}
                                    />
                                    <div className="feedback-result-title">
                                        {t('components.feedback.submit_failure.title')}
                                    </div>
                                    <div className="feedback-result-info">
                                        {t('components.feedback.submit_failure.info')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-section card-section-primary">
                            <div className="text-center">
                                <button
                                    type="button"
                                    className="button button-primary"
                                    onClick={() => {
                                        setState('form');
                                        form.reset();
                                    }}>
                                    {t('components.feedback.buttons.confirm')}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
