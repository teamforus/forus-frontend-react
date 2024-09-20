import React, { useCallback, useEffect, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { useIdentity2FAService } from '../../services/Identity2FAService';
import Identity2FA from '../../props/models/Identity2FA';
import usePushDanger from '../../hooks/usePushDanger';
import usePushSuccess from '../../hooks/usePushSuccess';
import Identity2FAState from '../../props/models/Identity2FAState';
import SelectControl from '../elements/select-control/SelectControl';
import SelectControlOptions from '../elements/select-control/templates/SelectControlOptions';
import Auth2FAProvider from '../../props/models/Auth2FAProvider';
import QrCode from '../elements/qr-code/QrCode';
import FormError from '../elements/forms/errors/FormError';
import PincodeControl from '../elements/forms/controls/PincodeControl';
import PhoneControl from '../elements/forms/controls/PhoneControl';
import useTimer from '../../hooks/useTimer';
import { ResponseError } from '../../props/ApiResponses';
import Auth2FAInfoBox from '../elements/auth2fa-info-box/Auth2FAInfoBox';
import classNames from 'classnames';

export default function Modal2FASetup({
    modal,
    type,
    auth = false,
    className,
    onReady,
    onCancel,
    assetUrl,
    auth2FAState,
    showInfoBox = true,
}: {
    modal: ModalState;
    type: string;
    auth?: boolean;
    className?: string;
    onReady: () => void;
    onCancel: () => void;
    assetUrl: (uri?: string) => string;
    showInfoBox?: boolean;
    auth2FAState: Identity2FAState;
}) {
    const [isLocked, setIsLocked] = useState(false);
    const [unlockEvent, setUnlockEvent] = useState(null);

    const [auth2FA, setAuth2FA] = useState<Identity2FA>(null);

    const [phoneNumber, setPhoneNumber] = useState(null);
    const [phoneNumberError, setPhoneNumberError] = useState(null);
    const [activateAuthErrors, setActivateAuthErrors] = useState(null);

    const [confirmationCode, setConfirmationCode] = useState(null);
    const [verifyAuthErrors, setVerifyAuthErrors] = useState(null);

    const [sendingCode, setSendingCode] = useState(null);

    const [step, setStep] = useState(null);
    const identity2FAService = useIdentity2FAService();

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const timer = useTimer();
    const { setTimer } = timer;

    const [providers, setProviders] = useState<Array<Auth2FAProvider>>(null);
    const [provider, setProvider] = useState<Auth2FAProvider>(null);

    const lock = useCallback(() => {
        if (isLocked) {
            return true;
        }

        setIsLocked(true);
    }, [isLocked]);

    const cancel = useCallback(() => {
        onCancel ? onCancel() : null;
        modal.close();
    }, [modal, onCancel]);

    const done = useCallback(() => {
        onReady ? onReady() : null;
        modal.close();
    }, [modal, onReady]);

    const goToStep = useCallback((step: string) => {
        setPhoneNumber('+31');
        setPhoneNumberError(null);
        setConfirmationCode('');
        setStep(step);
    }, []);

    const unlock = useCallback(
        (time = 1000) => {
            window.clearTimeout(unlockEvent);
            setUnlockEvent(window.setTimeout(() => setIsLocked(false), time));
        },
        [unlockEvent],
    );

    const blockResend = useCallback(() => {
        setTimer(10);
    }, [setTimer]);

    const makePhone2FA = useCallback(() => {
        identity2FAService
            .store({
                type: 'phone',
                phone: parseInt(phoneNumber?.toString().replace(/\D/g, '') || 0),
            })
            .then(
                (res) => {
                    goToStep('provider_confirmation');
                    setAuth2FA(res.data?.data);
                    blockResend();
                },
                (res) => {
                    setPhoneNumberError(res?.data?.errors?.phone);
                    pushDanger('Mislukt!', res.data?.message || 'Unknown error.');
                },
            );
    }, [blockResend, goToStep, identity2FAService, phoneNumber, pushDanger]);

    const makeAuthenticator2FA = useCallback(() => {
        identity2FAService.store({ type: 'authenticator' }).then(
            (res) => {
                setAuth2FA(res.data?.data);
                goToStep('provider_select');
            },
            (res: ResponseError) => {
                pushDanger(res.data?.message || 'Unknown error.');

                if (res.status == 429) {
                    cancel();
                }
            },
        );
    }, [cancel, goToStep, identity2FAService, pushDanger]);

    const submitPhoneNumber = useCallback(() => {
        makePhone2FA();
    }, [makePhone2FA]);

    const submitAuthenticator = useCallback(() => {
        goToStep('provider_confirmation');
    }, [goToStep]);

    const activateProvider = useCallback(() => {
        if (!auth2FA || !provider || lock()) {
            return;
        }

        identity2FAService
            .activate(auth2FA.uuid, {
                key: provider.key,
                code: confirmationCode,
            })
            .then(() => {
                setActivateAuthErrors(null);
                goToStep('success');
            })
            .catch((res) => {
                setActivateAuthErrors(res.data?.errors?.code);
                pushDanger(res.data?.message || 'Unknown error.');
            })
            .finally(() => unlock());
    }, [auth2FA, confirmationCode, goToStep, identity2FAService, lock, provider, pushDanger, unlock]);

    const verifyAuthProvider = useCallback(() => {
        if (!auth2FA || lock()) {
            return;
        }

        identity2FAService
            .authenticate(auth2FA.uuid, { code: confirmationCode })
            .then(() => {
                setVerifyAuthErrors(null);
                goToStep('success');
            })
            .catch((res) => {
                setVerifyAuthErrors(res.data?.errors?.code);
                pushDanger(res.data?.message || 'Unknown error.');
            })
            .finally(() => unlock());
    }, [auth2FA, confirmationCode, goToStep, identity2FAService, lock, pushDanger, unlock]);

    const resendCode = useCallback(
        (notify = true) => {
            if (!auth2FA?.uuid) {
                return;
            }

            setSendingCode(true);
            blockResend();

            identity2FAService
                .send(auth2FA.uuid)
                .then(
                    () => (notify ? pushSuccess('Gelukt!', 'We hebben de code opnieuw verstuurd.') : false),
                    (res) => pushDanger('Mislukt!', res?.data?.message),
                )
                .then(() => setSendingCode(false));
        },
        [auth2FA?.uuid, blockResend, identity2FAService, pushDanger, pushSuccess],
    );

    const onKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter' && step == 'provider_select') {
                return submitAuthenticator();
            }

            if (e.key === 'Enter' && step == 'success') {
                return done();
            }
        },
        [done, step, submitAuthenticator],
    );

    const bindEvents = useCallback(() => {
        document.body.addEventListener('keydown', onKeyDown);
    }, [onKeyDown]);

    const unbindEvents = useCallback(() => {
        document.body.removeEventListener('keydown', onKeyDown);
    }, [onKeyDown]);

    useEffect(() => {
        const providers = auth2FAState.providers.filter((provider) => provider.type == type);
        const active_providers = auth2FAState.active_providers.filter((item) => item.provider_type.type == type);

        setAuth2FA((auth2FA) => (auth2FA ? auth2FA : active_providers.find((auth_2fa) => auth_2fa)));
        setProvider(providers.find((provider) => provider));
        setProviders(providers);

        bindEvents();

        return () => {
            unbindEvents();
        };
    }, [type, bindEvents, unbindEvents, auth2FAState]);

    // should set up
    useEffect(() => {
        if (auth) {
            return;
        }

        // should set up
        if (type === 'authenticator') {
            makeAuthenticator2FA();
        }

        if (type === 'phone') {
            goToStep('phone_setup');
        }
    }, [type, auth, goToStep, makeAuthenticator2FA]);

    // should authenticate
    useEffect(() => {
        if (!auth) {
            return;
        }

        if (type === 'phone') {
            resendCode(false);
        }

        goToStep('provider_verification');
    }, [auth, goToStep, resendCode, type]);

    return (
        <div
            className={classNames(
                'modal',
                'modal-lg',
                'modal-animated',
                'modal-2fa-setup',
                modal.loading && 'modal-loading',
                className,
            )}>
            <div className="modal-backdrop" onClick={cancel} />
            <div className="modal-window">
                {/*Select provider*/}
                {step == 'provider_select' && (
                    <div className="modal-body">
                        <div className="modal-header">
                            <div className="modal-heading">Tweefactorauthenticatie instellen</div>
                            <div className="modal-close mdi mdi-close" onClick={cancel} role="button" />
                        </div>
                        <div className="modal-section">
                            <div className="modal-section-column modal-section-column-4">
                                <div className="form">
                                    <div className="modal-text">
                                        <strong className="text-strong">
                                            Selecteer de authenticatie-app die u wilt gebruiken.
                                        </strong>
                                        <div className="form-group">
                                            <SelectControl
                                                value={provider}
                                                onChange={(provider: Auth2FAProvider) => setProvider(provider)}
                                                options={providers}
                                                allowSearch={false}
                                                optionsComponent={SelectControlOptions}
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-text">
                                        <strong className="text-strong">
                                            Als je de {provider.name} app niet hebt,{' '}
                                        </strong>
                                        Kun je deze downloaden vanuit de{' '}
                                        <strong className="text-strong">Play Store</strong> of de{' '}
                                        <strong className="text-strong">App Store</strong>.
                                    </div>
                                    {provider && (
                                        <div className="modal-text">
                                            <div className="block block-app_download form">
                                                <div className="app_download-row">
                                                    <a
                                                        className="app_download-store_icon"
                                                        href={provider.url_android}
                                                        rel="noreferrer"
                                                        target="_blank">
                                                        <img
                                                            src={assetUrl('/assets/img/icon-app/app-store-android.svg')}
                                                            alt={''}
                                                        />
                                                    </a>
                                                    <a
                                                        className="app_download-store_icon"
                                                        href={provider.url_ios}
                                                        rel="noreferrer"
                                                        target="_blank">
                                                        <img
                                                            src={assetUrl('/assets/img/icon-app/app-store-ios.svg')}
                                                            alt={''}
                                                        />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="modal-section-separator" />
                                    <div className="modal-text">
                                        <strong className="text-strong">
                                            Als je al de Google Authenticator-app hebt, volg dan de onderstaande
                                            stappen:
                                        </strong>
                                    </div>
                                    <div className="modal-text">
                                        1. In de app, selecteer{' '}
                                        <strong className="text-strong">Account instellen</strong>
                                        <br />
                                        2. Kies <strong className="text-strong">Scan een QR-code</strong> of{' '}
                                        <strong className="text-strongEnter">
                                            Voer een installatiesleutel in: {auth2FA?.secret}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-section-column modal-section-column-2">
                                {auth2FA && (
                                    <QrCode
                                        value={auth2FA.secret_url}
                                        logo={assetUrl('/assets/img/me-logo-react.png')}
                                        className={'block-qr-code-fit'}
                                        style={{ padding: '15px' }}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="modal-section modal-section-collapse">
                            {showInfoBox && <Auth2FAInfoBox className="flex-center block-info-box-borderless" />}
                        </div>
                        <div className="modal-footer">
                            <div className="button-group">
                                <button className="button button-default" type="button" onClick={cancel}>
                                    Annuleer
                                </button>
                                <button className="button button-primary" type="submit" onClick={submitAuthenticator}>
                                    Bevestigen
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/*Phone setup*/}
                {step == 'phone_setup' && (
                    <form
                        className="modal-body form"
                        onSubmit={(e) => {
                            e?.preventDefault();
                            submitPhoneNumber();
                        }}>
                        <div className="modal-header">
                            <div className="modal-heading">Tweefactorauthenticatie instellen</div>
                            <div className="modal-close mdi mdi-close" onClick={cancel} role="button" />
                        </div>

                        <div className="modal-section form">
                            <div className="row">
                                <div className="col col-sm-10 col-sm-offset-1 col-xs-12 col-xs-offset-0">
                                    <div className="modal-heading text-center">Koppel je telefoonnummer</div>
                                    <div className="modal-text text-center">
                                        Om door te gaan, voer je telefoonnummer in
                                        <div className="modal-separator" />
                                        <div className="form-group">
                                            <div className="form-label text-strong">Telefoonnummer</div>
                                        </div>
                                        <div className="form-group">
                                            <PhoneControl onChange={(value) => setPhoneNumber(value)} />
                                            <FormError error={phoneNumberError} />
                                        </div>
                                    </div>
                                    {showInfoBox && <Auth2FAInfoBox className="flex-center" />}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <div className="button-group">
                                <button className="button button-default" type="button" onClick={cancel}>
                                    Annuleer
                                </button>
                                <button className="button button-primary" type="submit">
                                    Bevestigen
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/*Authenticator setup*/}
                {step == 'provider_confirmation' && (
                    <form
                        className="modal-body"
                        onSubmit={(e) => {
                            e?.preventDefault();
                            activateProvider();
                        }}>
                        <div className="modal-header">
                            <div className="modal-heading">Tweefactorauthenticatie instellen</div>
                            <div className="modal-close mdi mdi-close" onClick={cancel} role="button" />
                        </div>
                        <div className="modal-section form">
                            <div className="modal-text text-center">
                                <strong className="text-strong">
                                    Om door te gaan, voer de tweefactorauthenticatie beveiligingscode in.
                                </strong>
                            </div>
                            <div className="modal-text text-center">
                                <div className="form-group">
                                    {type == 'phone' && (
                                        <div className="form-label">Voer de 6-cijferige SMS-code in</div>
                                    )}
                                    {type == 'authenticator' && (
                                        <div className="form-label">Voer de 6-cijferige code in vanuit de app</div>
                                    )}
                                    <PincodeControl
                                        value={confirmationCode}
                                        blockSize={3}
                                        blockCount={2}
                                        valueType={'num'}
                                        className={'block-pincode-compact'}
                                        onChange={(code) => setConfirmationCode(code)}
                                        ariaLabel={'Voer de tweefactorauthenticatiecode in'}
                                    />
                                    <FormError error={activateAuthErrors} />
                                </div>
                            </div>
                            {type == 'phone' && (
                                <div className="modal-text text-center">
                                    <button
                                        className="button button-text button-text-primary button-sm"
                                        type="button"
                                        onClick={() => resendCode()}
                                        disabled={timer?.time > 0}>
                                        <div
                                            className={`mdi mdi-refresh icon-start ${sendingCode ? 'mdi-spin' : ''}`}
                                        />
                                        Code opnieuw verzenden
                                        {timer?.time > 0 && <span>&nbsp;({timer?.time} seconde(n))</span>}
                                    </button>
                                </div>
                            )}
                            {showInfoBox && <Auth2FAInfoBox className="flex-center" />}
                        </div>
                        <div className="modal-footer">
                            <div className="button-group">
                                <button
                                    onClick={() => goToStep(type == 'phone' ? 'phone_setup' : 'provider_select')}
                                    className="button button-default"
                                    type="button">
                                    Terug
                                </button>
                                <button
                                    className="button button-primary"
                                    type="submit"
                                    disabled={confirmationCode.length !== 6}>
                                    Verifieer
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/*Provider verification*/}
                {step == 'provider_verification' && (
                    <div className="modal-body">
                        <form
                            onSubmit={(e) => {
                                e?.preventDefault();
                                verifyAuthProvider();
                            }}>
                            <div className="modal-header">
                                <div className="modal-heading">Tweefactorauthenticatie</div>
                                <div className="modal-close mdi mdi-close" onClick={cancel} role="button" />
                            </div>
                            <div className="modal-section form">
                                <div className="modal-text text-center">
                                    {auth2FA.provider_type.type == 'phone' && (
                                        <strong className="text-strong">
                                            Om door te gaan, voer alstublieft de 6-cijferige SMS-code in die naar je
                                            telefoonnummer is verzonden.
                                        </strong>
                                    )}
                                    {auth2FA.provider_type.type == 'authenticator' && (
                                        <strong className="text-strong">
                                            Om door te gaan, voer de 6-cijferige beveiligingscode in van{' '}
                                            {auth2FA.provider_type.name}.
                                        </strong>
                                    )}
                                </div>
                                <div className="modal-text text-center">
                                    <div className="form-group">
                                        {auth2FA.provider_type.type == 'phone' && (
                                            <div className="form-label">Voer de 6-cijferige SMS-code in</div>
                                        )}
                                        {auth2FA.provider_type.type == 'authenticator' && (
                                            <div className="form-label">Voer de 6-cijferige code in vanuit de app</div>
                                        )}

                                        <PincodeControl
                                            value={confirmationCode}
                                            blockSize={3}
                                            blockCount={2}
                                            valueType={'num'}
                                            className={'block-pincode-compact'}
                                            onChange={(code) => setConfirmationCode(code)}
                                            ariaLabel={'Voer de tweefactorauthenticatiecode in'}
                                        />
                                        <FormError error={verifyAuthErrors} />
                                    </div>
                                </div>
                                {type == 'phone' && (
                                    <div className="modal-text text-center">
                                        <button
                                            className="button button-text button-text-primary button-sm"
                                            type="button"
                                            onClick={() => resendCode()}
                                            disabled={timer?.time > 0}>
                                            <div
                                                className={`mdi mdi-refresh icon-start ${
                                                    sendingCode ? 'mdi-spin' : ''
                                                }`}
                                            />
                                            Code opnieuw verzenden
                                            {timer?.time > 0 && <span>&nbsp;{timer?.time} seconde(n))</span>}
                                        </button>
                                    </div>
                                )}
                                {showInfoBox && <Auth2FAInfoBox className="flex-center" />}
                            </div>
                            <div className="modal-footer">
                                <div className="button-group">
                                    <button className="button button-default" type="button" onClick={cancel}>
                                        Annuleer
                                    </button>
                                    <button
                                        type="submit"
                                        className="button button-primary"
                                        disabled={confirmationCode.length !== 6}>
                                        Verifieer
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/*Success*/}
                {step == 'success' && (
                    <div className="modal-body">
                        <div className="modal-header">
                            <div className="modal-heading">Tweefactorauthenticatie</div>
                            <div className="modal-close mdi mdi-close" onClick={cancel} role="button" />
                        </div>
                        <div className="modal-section modal-section-pad form text-center">
                            <div className="modal-icon-mdi">
                                <div className="mdi mdi-check" />
                            </div>
                            <div className="modal-heading">
                                <strong>Het is gelukt!</strong>
                            </div>
                            <div className="modal-text">
                                <small>Je bent succesvol ingelogd met tweefactorauthenticatie. Welkom terug!</small>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="button-group">
                                <button className="button button-primary" onClick={done}>
                                    Bevestigen
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
