import React, { Fragment, useMemo, useState } from 'react';
import UIControlText from '../../../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import FormError from '../../../../../../dashboard/components/elements/forms/errors/FormError';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import Fund from '../../../../../props/models/Fund';
import useFormBuilder from '../../../../../../dashboard/hooks/useFormBuilder';
import { useIdentityEmailsService } from '../../../../../../dashboard/services/IdentityEmailService';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import useEnvData from '../../../../../hooks/useEnvData';
import FundRequestGoBackButton from '../FundRequestGoBackButton';
import { clickOnKeyEnter } from '../../../../../../dashboard/helpers/wcag';
import TranslateHtml from '../../../../../../dashboard/components/elements/translate-html/TranslateHtml';
import EmailProviderLink from '../../../../../../dashboard/components/pages/auth/elements/EmailProviderLink';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useAppConfigs from '../../../../../hooks/useAppConfigs';
import SignUpFooter from '../../../../elements/sign-up/SignUpFooter';

export default function FundRequestStepEmailSetup({
    fund,
    step,
    prevStep,
    nextStep,
    progress,
    bsnWarning,
}: {
    fund: Fund;
    step: number;
    prevStep: () => void;
    nextStep: () => void;
    progress: React.ReactElement;
    bsnWarning: React.ReactElement;
}) {
    const envData = useEnvData();
    const assetUrl = useAssetUrl();
    const appConfigs = useAppConfigs();

    const translate = useTranslate();
    const identityEmailsService = useIdentityEmailsService();

    const [emailSubmitted, setEmailSubmitted] = useState(false);
    const emailSetupRequired = useMemo(() => fund?.email_required, [fund?.email_required]);

    const emailForm = useFormBuilder<{ email: string; privacy: boolean }>(
        {
            email: ``,
            privacy: false,
        },
        (values) => {
            identityEmailsService
                .store(values.email, { target: `fundRequest-${fund.id}` })
                .then(() => setEmailSubmitted(true))
                .catch((res) => {
                    emailForm.setErrors(res.status === 429 ? { email: [res.data.message] } : res.data.errors);
                })
                .finally(() => emailForm.setIsLocked(false));
        },
    );

    return (
        <Fragment>
            {progress}

            {emailSubmitted ? (
                <div className="sign_up-pane">
                    <h1 className="sr-only">Er is een e-mail te bevestiging verstuurd</h1>
                    <h2 className="sign_up-pane-header">E-mail verstuurd</h2>

                    <div className="sign_up-pane-body">
                        <div className="sign_up-email_sent">
                            <div className="sign_up-email_sent-icon">
                                <img
                                    className="sign_up-email_sent-icon-img"
                                    src={assetUrl('/assets/img/modal/email_signup.svg')}
                                    alt=""
                                />
                            </div>
                            <div className="sign_up-email_sent-title">
                                {translate(`popup_auth.header.title_succes_${appConfigs?.communication_type}`)}
                            </div>
                            <TranslateHtml
                                component={<div className="sign_up-email_sent-text" />}
                                i18n={`popup_auth.header.subtitle_we_succes_${appConfigs?.communication_type}`}
                                values={{ email: emailForm.values.email }}
                            />
                            <EmailProviderLink email={emailForm.values.email} />
                        </div>
                    </div>

                    {bsnWarning}
                </div>
            ) : (
                <div className="sign_up-pane">
                    <div className="sign_up-pane-header">
                        <h2 className="sign_up-pane-header-title">Aanmelden met e-mailadres</h2>
                    </div>
                    <div className="sign_up-pane-body">
                        <form onSubmit={emailForm.submit}>
                            {emailSetupRequired && (
                                <p className="sign_up-pane-text">
                                    Om verder te gaan met de aanvraag dient u uw e-mailadres op te geven
                                </p>
                            )}
                            <div className="form-group">
                                <div className="row">
                                    <div className="col col-lg-9">
                                        <label className="form-label" htmlFor="email">
                                            {translate('popup_auth.input.mail')}
                                        </label>
                                        <UIControlText
                                            type={'email'}
                                            value={emailForm.values.email}
                                            onChangeValue={(email) => {
                                                emailForm.update({ email });
                                            }}
                                            tabIndex={0}
                                        />
                                        <FormError error={emailForm.errors.email} />
                                    </div>
                                    <div className="col col-lg-3">
                                        <div className="form-label hide-sm">&nbsp;</div>
                                        <button
                                            className="button button-primary button-fill"
                                            disabled={!emailForm.values.privacy && envData.config?.flags?.privacyPage}
                                            type="submit"
                                            tabIndex={0}>
                                            {translate('popup_auth.buttons.submit')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {!emailSetupRequired && (
                                <div className="sign_up-info">
                                    <div className="sign_up-info-title">
                                        <div className="sign_up-info-title-icon">
                                            <div className="mdi mdi-information-outline" />
                                        </div>
                                        Verder zonder e-mail
                                    </div>
                                    <div className="sign_up-info-description">
                                        <span className="text-strong">Let op! </span>Als u geen e-mailadres achterlaat
                                        ontvangt u geen essentiele berichten zoals de e-mail met de QR-code of wanneer
                                        er een transactie is geweest. Daarnaast kan u alleen inloggen met DigiD.
                                    </div>
                                </div>
                            )}

                            {envData.config?.flags?.privacyPage && (
                                <div className="row">
                                    <div className="col col-lg-12">
                                        <br className="hidden-lg" />
                                        <label
                                            className="sign_up-pane-text"
                                            htmlFor="privacy"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                e.stopPropagation();
                                                clickOnKeyEnter(e);
                                            }}>
                                            <input
                                                type="checkbox"
                                                checked={emailForm.values.privacy}
                                                onChange={(e) => {
                                                    emailForm.update({ privacy: e.target.checked });
                                                    e.target?.parentElement?.focus();
                                                }}
                                                id="privacy"
                                            />
                                            Ik heb de{' '}
                                            <StateNavLink
                                                name={'privacy'}
                                                tabIndex={0}
                                                target={'_blank'}
                                                onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
                                                    e.stopPropagation();
                                                    clickOnKeyEnter(e);
                                                }}
                                                className="text-primary-light sign_up-pane-link">
                                                privacyverklaring
                                            </StateNavLink>{' '}
                                            gelezen
                                        </label>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    <SignUpFooter
                        startActions={
                            <FundRequestGoBackButton prevStep={prevStep} fund={fund} step={step} tabIndex={0} />
                        }
                        endActions={
                            !emailSetupRequired && (
                                <button
                                    className="button button-text button-text-padless"
                                    disabled={envData.config.flags.privacyPage && !emailForm.values.privacy}
                                    onClick={nextStep}
                                    role="button"
                                    tabIndex={0}>
                                    Overslaan
                                    <em className="mdi mdi-chevron-right icon-right" />
                                </button>
                            )
                        }
                    />

                    {bsnWarning}
                </div>
            )}
        </Fragment>
    );
}
