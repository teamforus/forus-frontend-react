import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import PincodeControl from '../elements/forms/controls/PincodeControl';
import { useIdentityService } from '../../services/IdentityService';
import ModalNotification from './ModalNotification';
import useOpenModal from '../../hooks/useOpenModal';
import useAssetUrl from '../../hooks/useAssetUrl';
import { ResponseError } from '../../props/ApiResponses';
import useTranslate from '../../hooks/useTranslate';
import classNames from 'classnames';
import FormGroup from '../elements/forms/elements/FormGroup';

export default function ModalAuthPincode({ modal }: { modal: ModalState }) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const openModal = useOpenModal();
    const identityService = useIdentityService();

    const form = useFormBuilder({ pin_code: '' }, (values) => {
        identityService.authorizeAuthCode(values.pin_code.toString()).then(
            () => {
                modal.close();

                openModal((modal) => (
                    <ModalNotification
                        modal={modal}
                        title={translate('popup_auth.pin_code.confirmation.title')}
                        description={translate('popup_auth.pin_code.confirmation.description')}
                        buttonSubmit={{
                            text: translate('popup_auth.pin_code.confirmation.buttons.confirm'),
                            onClick: () => modal.close(),
                        }}
                        buttonCancel={{
                            text: translate('popup_auth.pin_code.confirmation.buttons.try_again'),
                            onClick: () => openModal((modal) => <ModalAuthPincode modal={modal} />),
                        }}
                    />
                ));
            },
            (res: ResponseError) => {
                form.setErrors({
                    ...res.data.errors,
                    ...(res.status == 404 ? { auth_code: ['Onbekende autorisatie code'] } : {}),
                });

                form.setIsLocked(false);
            },
        );
    });

    return (
        <div
            className={classNames('modal', 'modal-pin-code', 'modal-animated', modal.loading && 'modal-loading')}
            aria-describedby="pinCodeDialogSubtitle"
            aria-labelledby="pinCodeDialogTitle"
            role="dialog">
            <div className="modal-backdrop" onClick={modal.close} aria-label="Sluiten" role="button" />

            <form className="modal-window form" onSubmit={form.submit}>
                <div className="modal-close mdi mdi-close" onClick={modal.close} aria-label="Sluiten" role="button" />

                <div className="modal-header">
                    <h2 className="modal-title">Log in op de app</h2>
                </div>
                <div className="modal-body">
                    <div className="app-instructions">
                        <div className="app-instructions-container">
                            <div className="app-instructions-step">
                                <div className="step-item-img">
                                    <img
                                        src={assetUrl('/assets/img/icon-auth/download-me-app.svg')}
                                        alt="Me-app aanmeldscherm schermafbeelding"
                                    />
                                </div>
                                <h2 className="step-title">Stap 1</h2>
                                <div className="step-description">
                                    Open <strong>me app</strong>
                                </div>
                            </div>
                            <div className="app-instructions-separator">
                                <img src={assetUrl('/assets/img/icon-auth/icon-app-step-separator.svg')} alt={''} />
                            </div>
                            <div className="app-instructions-step">
                                <div className="step-item-img">
                                    <img
                                        src={assetUrl('/assets/img/icon-auth/pair-me-app.svg')}
                                        alt="Me-app aanmeldscherm schermafbeelding, kies koppelen"
                                    />
                                </div>
                                <h2 className="step-title">Stap 2</h2>
                                <div className="step-description">
                                    Kies “<strong>Koppelen</strong>”
                                </div>
                            </div>
                        </div>
                        <div className="app-instructions-devider">
                            <div className="divider-line" />
                            <div className="divider-arrow" />
                        </div>
                        <div className="app-instructions-form">
                            <div className="app-instructions-icon">
                                <img src={assetUrl('/assets/img/icon-auth/me-app-fill-pin-code.svg')} alt={''} />
                            </div>
                            <h2 className="app-instructions-title" id="pinCodeDialogTitle">
                                {`Stap 3: ${translate('open_in_me.app_header.title')}`}
                            </h2>
                            <div className="app-instructions-subtitle" id="pinCodeDialogSubtitle">
                                {translate('open_in_me.app_header.subtitle')}
                            </div>
                            <FormGroup
                                error={form.errors.auth_code}
                                input={() => (
                                    <PincodeControl
                                        value={form.values.pin_code.toString()}
                                        onChange={(pin_code) => form.update({ pin_code })}
                                        ariaLabel={'Voer de koppelcode van de Me-app in'}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div className="modal-footer text-center">
                    <button className="button button-default" type="button" onClick={modal.close}>
                        {translate('modal.buttons.cancel')}
                    </button>
                    <button
                        className="button button-primary"
                        type="submit"
                        disabled={form.isLocked || !form.values.pin_code}>
                        {translate('open_in_me.authorize.submit')}
                    </button>
                </div>
            </form>
        </div>
    );
}
