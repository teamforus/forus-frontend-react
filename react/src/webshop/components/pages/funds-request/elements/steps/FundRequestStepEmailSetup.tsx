import React, { Fragment, useEffect, useMemo, useState } from 'react';
import UIControlText from '../../../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import FormError from '../../../../../../dashboard/components/elements/forms/errors/FormError';
import Fund from '../../../../../props/models/Fund';
import useFormBuilder from '../../../../../../dashboard/hooks/useFormBuilder';
import { useIdentityEmailsService } from '../../../../../../dashboard/services/IdentityEmailService';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import FundRequestGoBackButton from '../FundRequestGoBackButton';
import { clickOnKeyEnter } from '../../../../../../dashboard/helpers/wcag';
import TranslateHtml from '../../../../../../dashboard/components/elements/translate-html/TranslateHtml';
import EmailProviderLink from '../../../../../../dashboard/components/pages/auth/elements/EmailProviderLink';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useAppConfigs from '../../../../../hooks/useAppConfigs';
import SignUpFooter from '../../../../elements/sign-up/SignUpFooter';
import BindLinksInside from '../../../../elements/bind-links-inside/BindLinksInside';
import { useStateHref } from '../../../../../modules/state_router/Router';

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
    const assetUrl = useAssetUrl();
    const appConfigs = useAppConfigs();

    const translate = useTranslate();
    const identityEmailsService = useIdentityEmailsService();

    const termsUrl = useStateHref('terms_and_conditions');
    const privacyUrl = useStateHref('privacy');

    const [disableSubmitBtn, setDisableSubmitBtn] = useState(false);
    const [emailSubmitted, setEmailSubmitted] = useState(false);
    const emailSetupRequired = useMemo(() => fund?.email_required, [fund?.email_required]);

    const hasPrivacy = useMemo(() => {
        return appConfigs?.show_privacy_checkbox && appConfigs?.pages.privacy;
    }, [appConfigs]);

    const hasTerms = useMemo(() => {
        return appConfigs?.show_terms_checkbox && appConfigs?.pages.terms_and_conditions;
    }, [appConfigs]);

    const emailForm = useFormBuilder<{ email: string; privacy: boolean; terms: boolean }>(
        {
            email: ``,
            privacy: false,
            terms: false,
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

    useEffect(() => {
        if ((!emailForm?.values?.privacy && hasPrivacy) || (!emailForm?.values?.terms && hasTerms)) {
            setDisableSubmitBtn(true);
        } else {
            setDisableSubmitBtn(false);
        }
    }, [emailForm?.values?.privacy, emailForm?.values?.terms, hasPrivacy, hasTerms]);

    return (
        <Fragment>
            {progress}

            {emailSubmitted ? (
                <div className="sign_up-pane">
                    <h1 className="sr-only">
                        {translate('fund_request.sign_up.fund_request_email_setup.email_sent_screen')}
                    </h1>
                    <h2 className="sign_up-pane-header">
                        {translate('fund_request.sign_up.fund_request_email_setup.email_sent')}
                    </h2>

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
                        <h2 className="sign_up-pane-header-title">
                            {translate('fund_request.sign_up.fund_request_email_setup.sign_up_with_email')}
                        </h2>
                    </div>
                    <div className="sign_up-pane-body">
                        <form onSubmit={emailForm.submit}>
                            {emailSetupRequired && (
                                <p className="sign_up-pane-text">
                                    {translate('fund_request.sign_up.fund_request_email_setup.email_required')}
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
                                            autoComplete={'email'}
                                        />
                                        <FormError error={emailForm.errors.email} />
                                    </div>
                                    <div className="col col-lg-3">
                                        <div className="form-label hide-sm">&nbsp;</div>
                                        <button
                                            className="button button-primary button-fill"
                                            disabled={disableSubmitBtn}
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
                                        {translate(
                                            'fund_request.sign_up.fund_request_email_setup.continue_without_email',
                                        )}
                                    </div>
                                    <div className="sign_up-info-description">
                                        <span className="text-strong">
                                            {translate('fund_request.sign_up.fund_request_email_setup.warning')}{' '}
                                        </span>
                                        {translate('fund_request.sign_up.fund_request_email_setup.no_email_info')}
                                    </div>
                                </div>
                            )}

                            {hasPrivacy ? (
                                <div className="row">
                                    <div className="col col-lg-12">
                                        <br className="hidden-lg" />
                                        <label
                                            className="sign_up-pane-text sign_up-pane-text-sm sign_up-privacy"
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
                                            <BindLinksInside onKeyDown={(e) => e.stopPropagation()}>
                                                <strong>
                                                    <TranslateHtml
                                                        i18n={'auth.privacy_link.text'}
                                                        values={{ link_url: privacyUrl }}
                                                    />
                                                </strong>
                                            </BindLinksInside>
                                        </label>
                                    </div>
                                </div>
                            ) : null}

                            {hasTerms ? (
                                <div className="row">
                                    <div className="col col-lg-12">
                                        <br className="hidden-lg" />
                                        <label
                                            className="sign_up-pane-text sign_up-pane-text-sm sign_up-privacy"
                                            htmlFor="terms"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                e.stopPropagation();
                                                clickOnKeyEnter(e);
                                            }}>
                                            <input
                                                type="checkbox"
                                                checked={emailForm.values.terms}
                                                onChange={(e) => {
                                                    emailForm.update({ terms: e.target.checked });
                                                    e.target?.parentElement?.focus();
                                                }}
                                                id="terms"
                                            />
                                            <BindLinksInside onKeyDown={(e) => e.stopPropagation()}>
                                                <strong>
                                                    <TranslateHtml
                                                        i18n={'auth.terms_link.text'}
                                                        values={{ link_url: termsUrl }}
                                                    />
                                                </strong>
                                            </BindLinksInside>
                                        </label>
                                    </div>
                                </div>
                            ) : null}
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
                                    disabled={disableSubmitBtn}
                                    onClick={nextStep}
                                    role="button"
                                    tabIndex={0}>
                                    {translate('fund_request.sign_up.fund_request_email_setup.skip')}
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
