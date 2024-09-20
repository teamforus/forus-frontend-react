import React, { FormEvent, Fragment } from 'react';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import FormError from '../../../../../../dashboard/components/elements/forms/errors/FormError';
import Fund from '../../../../../props/models/Fund';
import SignUpFooter from '../../../../elements/sign-up/SignUpFooter';

export default function FundRequestStepContactInformation({
    fund,
    progress,
    bsnWarning,
    contactInformation,
    onPrevStep,
    setContactInformation,
    shouldAddContactInfoRequired,
    contactInformationError,
    onSubmitContactInformation,
}: {
    fund: Fund;
    progress: React.ReactElement;
    bsnWarning: React.ReactElement;
    contactInformation: string;
    onPrevStep: () => void;
    setContactInformation: React.Dispatch<React.SetStateAction<string>>;
    shouldAddContactInfoRequired: boolean;
    contactInformationError: string | string[];
    onSubmitContactInformation: (e: FormEvent) => void;
}) {
    const translate = useTranslate();

    return (
        <Fragment>
            {progress}

            <div className="sign_up-pane">
                <form onSubmit={(e) => onSubmitContactInformation(e)}>
                    <h2 className="sign_up-pane-header">Contactgegevens</h2>
                    <div className="sign_up-pane-body">
                        <p className="sign_up-pane-text text-center">
                            {fund.contact_info_message_text || fund.contact_info_message_default}
                        </p>

                        <div className="form-group">
                            <label className="form-label" htmlFor="fund_request_contact_info">
                                Contactgegevens
                            </label>
                            <textarea
                                className="form-control r-n"
                                id="fund_request_contact_info"
                                rows={5}
                                value={contactInformation}
                                onChange={(e) => setContactInformation(e.target.value)}
                                required={shouldAddContactInfoRequired}
                            />
                            <FormError error={contactInformationError} />
                        </div>
                    </div>
                    <SignUpFooter
                        startActions={
                            <button
                                className="button button-text button-text-padless"
                                onClick={() => onPrevStep()}
                                role="button"
                                tabIndex={0}>
                                <em className="mdi mdi-chevron-left icon-left" />
                                {translate('fund_request.sign_up.pane.footer.prev')}
                            </button>
                        }
                        endActions={
                            <button className="button button-text button-text-padless" type="submit" role="button">
                                Vraag aan
                                <em className="mdi mdi-chevron-right icon-right" />
                            </button>
                        }
                    />

                    {bsnWarning}
                </form>
            </div>
        </Fragment>
    );
}
