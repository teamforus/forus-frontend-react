import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import FundProvider from '../../props/models/FundProvider';
import Organization from '../../props/models/Organization';
import { ResponseError } from '../../props/ApiResponses';
import useFormBuilder from '../../hooks/useFormBuilder';
import usePushSuccess from '../../hooks/usePushSuccess';
import FormError from '../elements/forms/errors/FormError';
import useSetProgress from '../../hooks/useSetProgress';
import { clickOnKeyEnter } from '../../helpers/wcag';
import useTranslate from '../../hooks/useTranslate';
import classNames from 'classnames';
import usePushApiError from '../../hooks/usePushApiError';
import useProviderFundService from '../../services/ProviderFundService';
import InfoBox from '../elements/info-box/InfoBox';

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
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const providerFundService = useProviderFundService();

    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const form = useFormBuilder({ note: '' }, (values) => {
        setProgress(0);
        setErrorMessage(null);

        providerFundService
            .unsubscribe(organization.id, providerFund.id, values)
            .then(() => {
                pushSuccess('Gelukt!', 'Verzoek afmelding verstuurd.');
                modal.close();
                onUnsubscribe?.();
            })
            .catch((err: ResponseError) => {
                pushApiError(err);
                form.setErrors(err.data.errors);

                if (!err.data?.errors && err.data?.message) {
                    setErrorMessage(err.data.message);
                }
            })
            .finally(() => {
                setProgress(100);
                form.setIsLocked(false);
            });
    });

    return (
        <div
            data-dusk="modalFundUnsubscribe"
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
                <div className="modal-header">Afmelding voor de regeling</div>
                <div className="modal-body modal-body-visible">
                    <div className="modal-section">
                        <div className="row">
                            <div className="col col-sm-10 col-sm-offset-1">
                                <div className="modal-title text-center">
                                    Weet u zeker dat u zich wilt afmelden bij {providerFund.fund.name}?
                                </div>
                                <div className="modal-description text-center">
                                    Optioneel kunt u een reden opgeven, zodat de gemeente weet waarom u zich heeft
                                    afgemeld.
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Notitie (optioneel)</label>
                                    <textarea
                                        className="form-control"
                                        value={form.values.note}
                                        onChange={(e) => form.update({ note: e.target.value })}
                                        placeholder="Reden"
                                        data-dusk="noteInput"
                                    />
                                    <FormError error={form.errors?.note} />
                                    <FormError error={form.errors?.fund_provider_id} />
                                </div>

                                {errorMessage && (
                                    <div className="form-group">
                                        <InfoBox
                                            type={'warning'}
                                            iconColor={'warning'}
                                            dusk="modalFundUnsubscribeError">
                                            {errorMessage}
                                        </InfoBox>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <div className="button-group">
                        <button
                            className="button button-default"
                            type="button"
                            data-dusk="closeBtn"
                            onClick={() => modal.close()}>
                            {translate('modals.modal_voucher_create.buttons.cancel')}
                        </button>
                        <button className="button button-primary" type="submit" data-dusk="submitBtn">
                            {translate('modals.modal_voucher_create.buttons.submit')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
