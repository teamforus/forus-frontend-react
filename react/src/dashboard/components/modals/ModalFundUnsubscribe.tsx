import React, { useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import FundProvider from '../../props/models/FundProvider';
import Organization from '../../props/models/Organization';
import { ResponseError } from '../../props/ApiResponses';
import useFormBuilder from '../../hooks/useFormBuilder';
import usePushSuccess from '../../hooks/usePushSuccess';
import FormError from '../elements/forms/errors/FormError';
import DatePickerControl from '../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../helpers/dates';
import useFundUnsubscribeService from '../../services/FundUnsubscribeService';
import useSetProgress from '../../hooks/useSetProgress';
import { addDays } from 'date-fns';
import { clickOnKeyEnter } from '../../helpers/wcag';
import useTranslate from '../../hooks/useTranslate';
import classNames from 'classnames';
import usePushApiError from '../../hooks/usePushApiError';

export default function ModalFundUnsubscribe({
    modal,
    organization,
    providerFund,
    onUnsubscribe,
    className,
}: {
    modal: ModalState;
    providerFund: FundProvider;
    organization: Organization;
    onUnsubscribe: () => void;
    className?: string;
}) {
    const [dateMin] = useState(addDays(new Date(), 1));

    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const fundUnsubscribeService = useFundUnsubscribeService();

    const form = useFormBuilder(
        {
            unsubscribe_at: null,
            note: '',
        },
        (values) => {
            setProgress(0);

            fundUnsubscribeService
                .store(organization.id, { fund_provider_id: providerFund.id, ...values })
                .then(() => {
                    pushSuccess('Gelukt!', 'Verzoek afmelding verstuurd.');
                    modal.close();
                    onUnsubscribe?.();
                })
                .catch((err: ResponseError) => {
                    pushApiError(err);
                    form.setErrors(err.data.errors);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    return (
        <div
            className={classNames(
                'modal',
                'modal-animated',
                'modal-fund-unsubscribe',
                modal.loading && 'modal-loading',
                className,
            )}>
            <div className="modal-backdrop" onClick={modal.close} />
            <form className="modal-window form" onSubmit={form.submit}>
                <div
                    className="modal-close mdi mdi-close"
                    onClick={modal.close}
                    tabIndex={0}
                    onKeyDown={clickOnKeyEnter}
                    role="button"
                />
                <div className="modal-header">Request unsubscription</div>
                <div className="modal-body modal-body-visible">
                    <div className="modal-section">
                        <div className="row">
                            <div className="col col-sm-10 col-sm-offset-1">
                                <div className="modal-title text-center">
                                    Weet u zeker dat u zich wilt afmelden bij {providerFund.fund.name}?
                                </div>
                                <div className="modal-description text-center">
                                    Als alles duidelijk is kunt u het onderstaande formulier invullen.
                                </div>
                                <div className="form-group">
                                    <label className="form-label form-label-required">Afmeldingsdatum</label>
                                    <DatePickerControl
                                        value={dateParse(form.values.unsubscribe_at)}
                                        dateMin={dateMin}
                                        dateInitial={dateMin}
                                        placeholder={'Kies een datum'}
                                        onChange={(date) => form.update({ unsubscribe_at: dateFormat(date) })}
                                    />
                                    <FormError error={form.errors.unsubscribe_at} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Notitie</label>
                                    <textarea
                                        className="form-control"
                                        value={form.values.note}
                                        onChange={(e) => form.update({ note: e.target.value })}
                                        placeholder="Reden"
                                    />
                                    <FormError error={form.errors.note} />
                                    <FormError error={form.errors.fund_provider_id} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <div className="button-group">
                        <button className="button button-default" type="button" onClick={() => modal.close()}>
                            {translate('modals.modal_voucher_create.buttons.cancel')}
                        </button>
                        <button className="button button-primary" type="submit">
                            {translate('modals.modal_voucher_create.buttons.submit')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
