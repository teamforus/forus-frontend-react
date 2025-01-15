import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useAuthIdentity2FAState from '../../../hooks/useAuthIdentity2FAState';
import IdentityEmail from '../../../../dashboard/props/models/IdentityEmail';
import { useIdentityEmailsService } from '../../../../dashboard/services/IdentityEmailService';
import EmailProviderLink from '../../../../dashboard/components/pages/auth/elements/EmailProviderLink';
import usePushSuccess from '../../../../dashboard/hooks/usePushSuccess';
import useFormBuilder from '../../../../dashboard/hooks/useFormBuilder';
import { PaginationData, ResponseError } from '../../../../dashboard/props/ApiResponses';
import useAppConfigs from '../../../hooks/useAppConfigs';
import FormError from '../../../../dashboard/components/elements/forms/errors/FormError';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import Auth2FARestriction from '../../elements/auth2fa-restriction/Auth2FARestriction';

export default function PreferencesEmails() {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();

    const appConfigs = useAppConfigs();
    const auth2FAState = useAuthIdentity2FAState();
    const auth2faRestricted = useMemo(() => auth2FAState?.restrictions?.emails?.restricted, [auth2FAState]);

    const identityEmailService = useIdentityEmailsService();

    const [showForm, setShowForm] = useState(false);

    const [emails, setEmails] = useState<PaginationData<IdentityEmail>>(null);
    const [emailErrors, setEmailErrors] = useState({});
    const [emailDisabled, setEmailDisabled] = useState({});
    const [emailDisableTimeout, setEmailDisableTimeout] = useState(null);

    const resendVerification = useCallback(
        (emailId: number) => {
            if (emailDisabled?.[emailId]) {
                return false;
            }

            setProgress(0);
            setEmailErrors((errors) => ({ ...errors, [emailId]: null }));
            setEmailDisabled((value) => ({ ...value, [emailId]: true }));

            identityEmailService
                .resendVerification(emailId)
                .then(() => {
                    pushSuccess('Verificatie e-mail opnieuw verstuurd!');

                    setEmailDisableTimeout(
                        window.setTimeout(() => {
                            setEmailDisabled((emailDisabled) => ({ ...emailDisabled, [emailId]: false }));
                        }, 2000),
                    );
                })
                .catch((res) => {
                    setEmailDisabled((value) => ({ ...value, [emailId]: false }));

                    setEmailErrors((errors) => ({
                        ...errors,
                        [emailId]: res.status === 429 ? res.data.message : null,
                    }));
                })
                .finally(() => setProgress(100));
        },
        [emailDisabled, identityEmailService, pushSuccess, setProgress],
    );

    const fetchEmails = useCallback(() => {
        setProgress(0);

        identityEmailService
            .list()
            .then((res) => setEmails(res.data))
            .finally(() => setProgress(100));
    }, [identityEmailService, setProgress]);

    const makePrimary = useCallback(
        (email: IdentityEmail) => {
            if (emailDisabled[email.id]) {
                return false;
            }

            identityEmailService.makePrimary(email.id).then(() => {
                pushSuccess('Opgeslagen!');
                fetchEmails();
            });
        },
        [emailDisabled, identityEmailService, pushSuccess, fetchEmails],
    );

    const deleteEmail = useCallback(
        (email: IdentityEmail) => {
            if (emailDisabled[email.id]) {
                return false;
            }

            identityEmailService.delete(email.id).then(() => {
                pushSuccess('Verwijderd!');
                fetchEmails();
            });
        },
        [emailDisabled, fetchEmails, identityEmailService, pushSuccess],
    );

    const form = useFormBuilder({ email: '' }, (values) => {
        identityEmailService
            .store(values.email)
            .then(() => {
                fetchEmails();
                setShowForm(false);
                form.setState('success');
            })
            .catch((err: ResponseError) => {
                form.setErrors(err.status === 429 ? { email: [err.data.message] } : err.data.errors);
                form.setIsLocked(false);
            })
            .finally(() => setProgress(100));
    });

    const showEmailForm = useCallback(() => {
        setShowForm(true);
        form.reset();
    }, [form]);

    useEffect(() => {
        if (auth2FAState && !auth2FAState?.restrictions?.emails?.restricted) {
            fetchEmails();
        }
    }, [auth2FAState, fetchEmails]);

    useEffect(() => {
        return () => window.clearTimeout(emailDisableTimeout);
    }, [emailDisableTimeout]);

    return (
        <BlockShowcaseProfile
            breadcrumbItems={[
                { name: translate(`preferences_emails.breadcrumbs.home`), state: 'home' },
                { name: translate('preferences_emails.breadcrumbs.preferences_emails') },
            ]}
            profileHeader={
                (auth2faRestricted || emails) &&
                (auth2faRestricted ? (
                    <></>
                ) : (
                    <div className="profile-content-header clearfix">
                        <div className="profile-content-title">
                            <div className="pull-left">
                                <h1 className="profile-content-header">{translate('preferences_emails.title')}</h1>
                            </div>
                        </div>
                    </div>
                ))
            }>
            {auth2faRestricted ? (
                <Auth2FARestriction
                    type={'emails'}
                    items={auth2FAState.restrictions.emails.funds}
                    itemName={'name'}
                    itemThumbnail={'logo.sizes.thumbnail'}
                    defaultThumbnail={'fund-thumbnail'}
                />
            ) : (
                emails && (
                    <Fragment>
                        {emails?.data?.map((email) => (
                            <div key={email.id} className="card" id={`email_${email.id}`}>
                                <div className="card-section card-section-padless">
                                    <div className="block block-user_emails">
                                        <div className="user_email-item">
                                            <div className="user_email-icon">
                                                <em className={`mdi mdi-at ${email.primary ? 'text-primary' : ''}`} />
                                            </div>
                                            <div className="user_email-details">
                                                <div
                                                    className="user_email-address"
                                                    data-dusk="identityEmailListItemEmail">
                                                    {email.email}
                                                </div>
                                                {email.primary && (
                                                    <ul className="user_email-options">
                                                        <li className="user_email-option">
                                                            {translate('preferences_emails.usage.sign_in')}
                                                        </li>
                                                        <li className="user_email-option">
                                                            {translate('preferences_emails.usage.notifications')}
                                                        </li>
                                                    </ul>
                                                )}
                                                <div className="flex-row">
                                                    {!email.primary && email.verified && (
                                                        <button
                                                            type={'button'}
                                                            disabled={emailDisabled[email.id]}
                                                            className="button button-text button-text-primary"
                                                            onClick={() => makePrimary(email)}
                                                            data-dusk="identityEmailListItemSetPrimary">
                                                            <em className="mdi mdi-check-circle icon-start" />
                                                            {translate('preferences_emails.buttons.set_primary')}
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex-row">
                                                    {!email.primary && !email.verified && (
                                                        <button
                                                            type={'button'}
                                                            disabled={emailDisabled[email.id]}
                                                            className="button button-text button-text-primary"
                                                            onClick={() => resendVerification(email.id)}
                                                            data-dusk="btnResendVerificationEmail">
                                                            <em className="mdi mdi-reload icon-start" />
                                                            {translate('preferences_emails.buttons.send_again')}
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex-row">
                                                    {!email.primary && !email.verified && (
                                                        <EmailProviderLink
                                                            email={email.email}
                                                            icon={'open-in-new'}
                                                            type={'text'}
                                                        />
                                                    )}
                                                </div>
                                                {emailErrors?.[email.id] && (
                                                    <div className="text-danger">{emailErrors?.[email.id]}</div>
                                                )}
                                            </div>

                                            <div className="user_email-actions">
                                                <div className="flex-row">
                                                    <div className="flex flex-col flex-center flex">
                                                        {email.primary && (
                                                            <label
                                                                className="label label-success"
                                                                data-dusk="identityEmailListItemPrimary">
                                                                {translate('preferences_emails.labels.primary')}
                                                            </label>
                                                        )}
                                                        {!email.verified && !email.primary && (
                                                            <label
                                                                className="label label-default"
                                                                data-dusk="identityEmailListItemNotVerified">
                                                                {translate('preferences_emails.labels.not_confirmed')}
                                                            </label>
                                                        )}
                                                    </div>
                                                    {!email.primary && (
                                                        <div className="flex flex-col">
                                                            <button
                                                                type={'button'}
                                                                disabled={emailDisabled[email.id]}
                                                                className="button button-primary-outline button-icon"
                                                                aria-label="Verwijder"
                                                                onClick={() => deleteEmail(email)}
                                                                data-dusk="btnDeleteIdentityEmail">
                                                                <em className="mdi mdi-trash-can-outline"></em>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="card">
                            {!showForm && form.state !== 'success' && (
                                <div className="card-section">
                                    <h2 className="card-heading card-heading-lg">
                                        {translate('preferences_emails.create.title')}
                                    </h2>
                                    <button
                                        type="button"
                                        className="button button-primary"
                                        onClick={showEmailForm}
                                        role="button"
                                        data-dusk="btnIdentityNewEmail">
                                        <em className="mdi mdi-plus-circle icon-start" />
                                        {translate('preferences_emails.create.buttons.add_new')}
                                    </button>
                                </div>
                            )}

                            {showForm && form.state !== 'success' && (
                                <div className="card-section">
                                    <h2 className="card-heading card-heading-lg">
                                        {translate('preferences_emails.create.title')}
                                    </h2>
                                    <form className="form row" onSubmit={form.submit} data-dusk="identityNewEmailForm">
                                        <div className="col col-lg-6 form-group">
                                            <label className="form-label" htmlFor="preferences_form_email">
                                                {translate('preferences_emails.create.labels.email')}
                                            </label>
                                            <div className="flex-row">
                                                <div className="flex-col flex-grow">
                                                    <input
                                                        className="form-control"
                                                        type="email"
                                                        id="preferences_form_email"
                                                        value={form.values.email}
                                                        onChange={(e) => {
                                                            form.update({ email: e.target.value });
                                                        }}
                                                        data-dusk="identityNewEmailFormEmail"
                                                        aria-label="Vul uw e-mailadres in"
                                                    />
                                                    <FormError error={form.errors.email} />
                                                </div>
                                                <div className="flex-col">
                                                    <button
                                                        type="submit"
                                                        className="button button-primary"
                                                        data-dusk="identityNewEmailFormSubmit">
                                                        {translate('preferences_emails.create.buttons.send')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {!showForm && form.state == 'success' && (
                                <div className="card-section" data-dusk="identityNewEmailSuccess">
                                    <h2 className="card-heading card-heading-lg card-heading-padless">
                                        {translate(
                                            `preferences_emails.email_added.title_${appConfigs.communication_type}`,
                                        )}
                                    </h2>
                                    <div className="card-text">
                                        {translate(
                                            `preferences_emails.email_added.description_${appConfigs.communication_type}`,
                                        )}
                                    </div>
                                    <div className="button button-primary" onClick={showEmailForm} role="button">
                                        {translate('preferences_emails.create.buttons.add_more')}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Fragment>
                )
            )}
        </BlockShowcaseProfile>
    );
}
