import React, { useCallback, useEffect, useState } from 'react';
import { useIdentityEmailsService } from '../../../services/IdentityEmailService';
import useFormBuilder from '../../../hooks/useFormBuilder';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import FormError from '../../elements/forms/errors/FormError';
import IdentityEmail from '../../../props/models/IdentityEmail';
import ModalDangerZone from '../../modals/ModalDangerZone';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useOpenModal from '../../../hooks/useOpenModal';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushSuccess from '../../../hooks/usePushSuccess';
import useAuthIdentity2FAState from '../../../hooks/useAuthIdentity2FAState';
import Auth2FARestriction from '../../elements/auth2fa-restriction/Auth2FARestriction';

export default function PreferencesEmails() {
    const openModal = useOpenModal();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const [showForm, setShowForm] = useState(false);
    const [emails, setEmails] = useState<PaginationData<IdentityEmail>>(null);
    const identityEmailService = useIdentityEmailsService();
    const auth2FAState = useAuthIdentity2FAState();

    const form = useFormBuilder({ email: '' }, (values) => {
        setProgress(0);

        identityEmailService
            .store(values.email?.toString())
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

    const fetchEmails = useCallback(() => {
        setProgress(0);

        identityEmailService
            .list()
            .then((res) => setEmails(res.data))
            .finally(() => setProgress(100));
    }, [identityEmailService, setProgress]);

    const updateEmail = useCallback((email, data) => {
        setEmails((emails) => {
            Object.assign(emails.data[emails.data.indexOf(email)], data);

            return { ...emails };
        });
    }, []);

    const resendVerification = useCallback(
        (email) => {
            if (email['disabled']) {
                return false;
            }

            setProgress(0);
            updateEmail(email, { errors: null, disabled: true });

            identityEmailService
                .resendVerification(email.id)
                .then(() => {
                    pushSuccess('Verificatie e-mail opnieuw verstuurd!');
                    setTimeout(() => updateEmail(email, { disabled: false, errors: null }), 2000);
                })
                .catch((res: ResponseError) => {
                    updateEmail(email, { disabled: false });
                    updateEmail(email, { errors: res.status === 429 ? [res.data.message] : null });
                })
                .finally(() => setProgress(100));
        },
        [identityEmailService, pushSuccess, updateEmail, setProgress],
    );

    const makePrimary = useCallback(
        (email) => {
            if (email.disabled) {
                return false;
            }

            setProgress(0);

            identityEmailService
                .makePrimary(email.id)
                .then(() => {
                    pushSuccess('Opgeslagen!');
                    fetchEmails();
                })
                .finally(() => setProgress(100));
        },
        [fetchEmails, identityEmailService, pushSuccess, setProgress],
    );

    const deleteEmail = useCallback(
        (email) => {
            if (email.disabled) {
                return false;
            }

            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={`Pas op!`}
                    description={`Weet u zeker dat u het volgende emailadres wilt verwijderen "${email.email}"?`}
                    buttonSubmit={{
                        text: 'Confirm',
                        onClick: () => {
                            modal.close();

                            identityEmailService.delete(email.id).then(() => {
                                pushSuccess('Verwijderd!');
                                fetchEmails();
                            });
                        },
                    }}
                    buttonCancel={{ text: 'Cancel', onClick: modal.close }}
                />
            ));
        },
        [fetchEmails, identityEmailService, pushSuccess, openModal],
    );

    const showEmailForm = useCallback(() => {
        setShowForm(true);
        form.reset();
    }, [form]);

    useEffect(() => {
        if (auth2FAState && !auth2FAState?.restrictions?.emails?.restricted) {
            fetchEmails();
        }
    }, [auth2FAState, fetchEmails]);

    if (auth2FAState?.restrictions?.emails?.restricted !== false) {
        return (
            <Auth2FARestriction
                type={'emails'}
                items={auth2FAState?.restrictions?.emails.funds}
                itemName={'name'}
                itemThumbnail={'logo.sizes.thumbnail'}
                defaultThumbnail={'fund-thumbnail'}
            />
        );
    }

    if (!emails || !auth2FAState) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">E-mail instellingen</div>
            </div>
            <div className="card-section card-section-padless">
                <div className="block block-user_emails form">
                    {emails?.data.map((email) => (
                        <div key={`email_${email.id}`} className="user_email-item" id={`email_${email.id}`}>
                            <div className="user_email-icon">
                                <em className={`mdi mdi-email-outline ${email.primary ? 'text-primary' : ''}`} />
                            </div>
                            <div className="user_email-details">
                                <div className="user_email-address" data-dusk="identityEmailListItemEmail">
                                    {email.email}
                                </div>

                                {email.primary && (
                                    <div className="user_email-options">
                                        <div className="user_email-option">Ontvangt inlog e-mail</div>
                                        <div className="user_email-option">Ontvangt notificaties</div>
                                    </div>
                                )}

                                {!email.primary && email.verified && (
                                    <button
                                        type={'button'}
                                        className="button button-default"
                                        disabled={email['disabled']}
                                        onClick={() => makePrimary(email)}
                                        data-dusk="identityEmailListItemSetPrimary">
                                        <em className="mdi mdi-check-circle icon-start" />
                                        Instellen als hoofd e-mailadres
                                    </button>
                                )}

                                {!email.primary && !email.verified && (
                                    <button
                                        type={'button'}
                                        className="button button-default"
                                        disabled={email['disabled']}
                                        onClick={() => resendVerification(email)}
                                        data-dusk="btnResendVerificationEmail">
                                        <em className="mdi mdi-reload icon-start" />
                                        Bevestiging e-mail opnieuw versturen
                                    </button>
                                )}

                                <FormError error={email['errors']} />
                            </div>
                            <div className="user_email-actions">
                                {email.primary && (
                                    <label
                                        data-dusk="identityEmailListItemPrimary"
                                        className="label label-success label-round label-lg pull-left">
                                        Hoofd e-mailadres
                                    </label>
                                )}

                                {!email.verified && !email.primary && (
                                    <label
                                        data-dusk="identityEmailListItemNotVerified"
                                        className="label label-default label-round label-lg pull-left">
                                        Niet bevestigd
                                    </label>
                                )}

                                {!email.primary && (
                                    <button
                                        disabled={email['disabled']}
                                        onClick={() => deleteEmail(email)}
                                        data-dusk="btnDeleteIdentityEmail"
                                        className="button button-default button-icon">
                                        <em className="mdi mdi-trash-can-outline" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {!showForm && form.state !== 'success' && (
                <div className="card-section card-section-primary">
                    <button
                        type={'button'}
                        onClick={() => showEmailForm()}
                        className="button button-primary"
                        data-dusk="btnIdentityNewEmail">
                        <em className="mdi mdi-plus-circle icon-start" />
                        E-mail toevoegen
                    </button>
                </div>
            )}

            {showForm && form.state !== 'success' && (
                <div className="card-section card-section-primary">
                    <div className="card-heading">Voeg een e-mailadres toe</div>
                    <form onSubmit={form.submit} data-dusk="identityNewEmailForm" className="form row">
                        <div className="col col-lg-6 form-group">
                            <div className="form-label form-label-required">E-mailadres</div>
                            <div className="flex-row">
                                <div className="flex-col flex-grow">
                                    <input
                                        type="email"
                                        placeholder="e-mail@e-mail.nl"
                                        value={form.values.email?.toString()}
                                        onChange={(e) => form.update({ email: e.target.value })}
                                        data-dusk="identityNewEmailFormEmail"
                                        className="form-control"
                                    />
                                    <FormError error={form.errors.email} />
                                </div>

                                <div className="flex-col">
                                    <button
                                        type="submit"
                                        data-dusk="identityNewEmailFormSubmit"
                                        className="button button-primary">
                                        Toevoegen
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && form.state == 'success' && (
                <div className="card-section card-section-primary" data-dusk="identityNewEmailSuccess">
                    <div className="card-heading card-heading-padless">Bevestig uw e-mailadres</div>
                    <div className="card-text">
                        U hebt een bevestigingsbericht ontvangen op het e-mailadres dat u zojuist hebt doorgegeven. Klik
                        op de bevestigingslink in dit bericht om de wijziging te voltooien.
                    </div>
                    <div className="button button-primary" onClick={() => showEmailForm()}>
                        Voeg nog een e-mailadres toe
                    </div>
                </div>
            )}
        </div>
    );
}
