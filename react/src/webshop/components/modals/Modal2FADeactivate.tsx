import React, { useCallback, useEffect, useState } from 'react';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import Identity2FA from '../../../dashboard/props/models/Identity2FA';
import { useIdentity2FAService } from '../../../dashboard/services/Identity2FAService';
import usePushDanger from '../../../dashboard/hooks/usePushDanger';
import usePushSuccess from '../../../dashboard/hooks/usePushSuccess';
import useTimer from '../../../dashboard/hooks/useTimer';
import FormError from '../../../dashboard/components/elements/forms/errors/FormError';
import PincodeControl from '../../../dashboard/components/elements/forms/controls/PincodeControl';
import BlockAuth2FAInfoBox from '../elements/block-auth-2fa-info-box/BlockAuth2FAInfoBox';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';
import classNames from 'classnames';
import useTranslate from '../../../dashboard/hooks/useTranslate';

export default function Modal2FADeactivate({
    modal,
    className,
    onReady,
    onCancel,
    auth2FA,
}: {
    modal: ModalState;
    className?: string;
    onReady: () => void;
    onCancel: () => void;
    auth2FA: Identity2FA;
}) {
    const [type] = useState(auth2FA.provider_type.type);
    const [errorCode, setErrorCode] = useState(null);

    const [step, setStep] = useState<string>('confirmation');
    const identity2FAService = useIdentity2FAService();

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const translate = useTranslate();
    const timer = useTimer();
    const { setTimer } = timer;

    const [sendingCode, setSendingCode] = useState(null);
    const [deactivating, setDeactivating] = useState(null);

    const [confirmationCode, setConfirmationCode] = useState('');

    const blockResend = useCallback(() => {
        setTimer(10);
    }, [setTimer]);

    const resendCode = useCallback(
        (notify = true) => {
            setSendingCode(true);
            blockResend();

            identity2FAService
                .send(auth2FA.uuid)
                .then(
                    () =>
                        notify
                            ? pushSuccess(translate('push.success'), translate('modal_2fa_deactivate.code_resent'))
                            : false,
                    (res) => pushDanger(translate('push.error'), res?.data?.message),
                )
                .then(() => setSendingCode(false));
        },
        [auth2FA?.uuid, blockResend, identity2FAService, pushDanger, pushSuccess, translate],
    );

    const deactivateProvider = useCallback(
        (e?: React.FormEvent) => {
            e?.preventDefault();

            if (deactivating) {
                return;
            }

            setDeactivating(true);

            identity2FAService
                .deactivate(auth2FA.uuid, {
                    key: auth2FA.provider_type.key,
                    code: confirmationCode,
                })
                .then(() => {
                    setStep('success');
                    setErrorCode(null);
                })
                .catch((res) => {
                    setErrorCode(res?.data?.errors?.code || null);
                    pushDanger(
                        translate('push.error'),
                        res.status === 404
                            ? translate('modal_2fa_deactivate.error_404')
                            : res.data?.message || translate('modal_2fa_deactivate.unknown_error'),
                    );
                })
                .finally(() => window.setTimeout(() => setDeactivating(false), 1000));
        },
        [
            auth2FA.provider_type.key,
            auth2FA.uuid,
            confirmationCode,
            deactivating,
            identity2FAService,
            pushDanger,
            translate,
        ],
    );

    const cancel = useCallback(() => {
        onCancel?.();
        modal.close();
    }, [modal, onCancel]);

    const done = useCallback(() => {
        onReady?.();
        modal.close();
    }, [modal, onReady]);

    const onKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter' && step == 'success') {
                done();
            }
        },
        [step, done],
    );

    useEffect(() => {
        if (auth2FA.provider_type.type == 'phone') {
            resendCode(false);
        }
    }, [auth2FA, resendCode]);

    useEffect(() => {
        document.body.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.removeEventListener('keydown', onKeyDown);
        };
    }, [onKeyDown]);

    return (
        <div
            className={classNames(
                'modal',
                'modal-animated',
                'modal-2fa-setup',
                modal.loading ? '' : 'modal-loaded',
                className,
            )}>
            <div className="modal-backdrop" onClick={cancel} />

            {step == 'confirmation' && (
                <form className="modal-window form" onSubmit={deactivateProvider}>
                    <div className="modal-header">
                        <div className="modal-heading">{translate('modal_2fa_deactivate.disable_2fa')}</div>
                        <div
                            className="modal-close mdi mdi-close"
                            onClick={cancel}
                            tabIndex={0}
                            onKeyDown={clickOnKeyEnter}
                            role="button"
                        />
                    </div>

                    <div className="modal-body text-center">
                        <div className="modal-section">
                            <div className="modal-section-title">
                                {translate('modal_2fa_deactivate.enter_2fa_code')}
                            </div>

                            {type == 'phone' && (
                                <div className="modal-section-description">
                                    {translate('modal_2fa_deactivate.enter_sms_code')}
                                </div>
                            )}

                            {type == 'authenticator' && (
                                <div className="modal-section-description">
                                    {translate('modal_2fa_deactivate.enter_app_code')}
                                </div>
                            )}

                            <div className="modal-section-space" />
                            <div className="modal-section-space" />

                            <div className="form-group">
                                <div className="form-group-offset">
                                    <PincodeControl
                                        value={confirmationCode}
                                        onChange={setConfirmationCode}
                                        className={'block-pincode-compact'}
                                        valueType={'num'}
                                        blockSize={3}
                                        blockCount={2}
                                        ariaLabel={translate('modal_2fa_deactivate.enter_2fa_code_deactivation')}
                                    />

                                    <FormError error={errorCode} />
                                </div>

                                {type == 'phone' && (
                                    <div className="text-center">
                                        <button
                                            className="button button-text button-text-primary button-sm"
                                            type="button"
                                            onClick={() => resendCode()}
                                            disabled={timer?.time > 0}>
                                            <div
                                                className={`mdi mdi-refresh icon-start ${sendingCode ? 'mdi-spin' : ''}`}
                                            />
                                            {translate('modal_2fa_deactivate.resend_code')}
                                            {timer?.time > 0 && (
                                                <span>
                                                    &nbsp;(
                                                    {translate('modal_2fa_deactivate.seconds', { time: timer?.time })})
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-section modal-section-collapsed">
                            <BlockAuth2FAInfoBox className="flex-center block-info-box-borderless" />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="button-group flex-grow">
                            <button
                                className="button button-light button-sm flex-center"
                                type="button"
                                onClick={cancel}>
                                {translate('modal_2fa_deactivate.cancel')}
                            </button>
                            <div className="flex flex-grow hide-sm">&nbsp;</div>
                            <button
                                className="button button-primary button-sm flex-center"
                                type="submit"
                                disabled={confirmationCode?.length !== 6}>
                                {translate('modal_2fa_deactivate.verify')}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {step == 'success' && (
                <form className="modal-window form" onSubmit={done}>
                    <div
                        className="modal-close mdi mdi-close"
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        onClick={cancel}
                        role="button"
                    />
                    <div className="modal-header">
                        <h2 className="modal-header-title">{translate('modal_2fa_deactivate.disable_2fa')}</h2>
                    </div>
                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-section-icon modal-section-icon-success">
                                <div className="mdi mdi-check-circle-outline" />
                            </div>
                            <div className="modal-section-title">{translate('modal_2fa_deactivate.2fa_disabled')}</div>
                            <div className="modal-section-description">
                                {translate('modal_2fa_deactivate.2fa_disabled_description')}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <div className="button-group flex-grow flex-center">
                            <div className="button button-primary button-sm flex-center" onClick={done}>
                                {translate('modal_2fa_deactivate.confirm')}
                            </div>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
