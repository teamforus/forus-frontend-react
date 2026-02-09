import React, { useCallback } from 'react';
import classNames from 'classnames';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import useAppConfigs from '../../hooks/useAppConfigs';
import PincodeControl from '../../../dashboard/components/elements/forms/controls/PincodeControl';
import FormError from '../../../dashboard/components/elements/forms/errors/FormError';
import useOpenModal from '../../../dashboard/hooks/useOpenModal';
import useAssetUrl from '../../hooks/useAssetUrl';
import { useIdentityService } from '../../../dashboard/services/IdentityService';
import useFormBuilder from '../../../dashboard/hooks/useFormBuilder';
import ModalNotification from '../../components/modals/ModalNotification';
import { ResponseError } from '../../../dashboard/props/ApiResponses';
import ModalOpenInMe from './ModalOpenInMe';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';

export default function ModalAuthPincode({ modal }: { modal: ModalState }) {
    const appConfigs = useAppConfigs();
    const translate = useTranslate();

    const openModal = useOpenModal();
    const assetUrl = useAssetUrl();
    const identityService = useIdentityService();

    const form = useFormBuilder({ pin_code: '' }, (values) => {
        identityService
            .authorizeAuthCode(values.pin_code.toString())
            .then(() => {
                modal.close();

                openModal((modal) => (
                    <ModalNotification
                        modal={modal}
                        type={'confirm'}
                        title={translate('modal_pin_code.login')}
                        description={translate('popup_auth.pin_code.confirmation.description')}
                        header={translate(`popup_auth.pin_code.confirmation.title_${appConfigs?.communication_type}`)}
                        mdiIconType={'success'}
                        mdiIconClass={'check-circle-outline'}
                        confirmBtnText={translate('popup_auth.pin_code.confirmation.buttons.confirm')}
                        onConfirm={() => modal.close()}
                        cancelBtnText={translate('popup_auth.pin_code.confirmation.buttons.try_again')}
                        onCancel={() => openModal((modal) => <ModalAuthPincode modal={modal} />)}
                    />
                ));
            })
            .catch((res: ResponseError) => {
                form.setErrors({
                    ...res.data.errors,
                    ...(res.status == 404 ? { auth_code: [translate('modal_pin_code.unknown_code')] } : {}),
                });

                form.setIsLocked(false);
            });
    });

    const openInMeModal = useCallback(
        (e: React.MouseEvent) => {
            e?.preventDefault();
            modal.close();

            return openModal((modal) => <ModalOpenInMe modal={modal} />);
        },
        [modal, openModal],
    );

    return (
        <div
            className={classNames('modal', 'modal-pin-code', 'modal-animated', !modal.loading && 'modal-loaded')}
            role="dialog">
            <div
                className="modal-backdrop"
                onClick={modal.close}
                aria-label={translate('modal_pin_code.close')}
                role="button"
            />

            <form className="modal-window form" onSubmit={form.submit}>
                <div
                    className="modal-close mdi mdi-close"
                    onClick={modal.close}
                    tabIndex={0}
                    onKeyDown={clickOnKeyEnter}
                    aria-label={translate('modal_pin_code.close')}
                    role="button"
                />

                <div className="modal-header">
                    <h2 className="modal-header-title">{translate('modal_pin_code.login')}</h2>
                </div>
                <div className="modal-body">
                    <div className="app-instructions">
                        <div className="app-instructions-container">
                            <div className="app-instructions-step">
                                <div className="step-item-img">
                                    <img
                                        src={assetUrl('/assets/img/icon-auth/download-me-app.svg')}
                                        alt={translate('modal_pin_code.step1_image_alt')}
                                    />
                                </div>
                                <h2 className="step-title">{translate('modal_pin_code.step1_title')}</h2>
                                <div className="step-description">
                                    <strong>
                                        <a href="#" className="text-link" onClick={(e) => openInMeModal(e)}>
                                            {translate('modal_pin_code.download')}
                                        </a>
                                    </strong>{' '}
                                    {translate('modal_pin_code.and_open_app')}
                                </div>
                            </div>
                            <div className="app-instructions-separator">
                                <img
                                    src={assetUrl('/assets/img/icon-auth/icon-app-step-separator.svg')}
                                    className={'hide-sm'}
                                    alt={''}
                                />
                                <img
                                    src={assetUrl('/assets/img/icon-auth/icon-app-step-separator-mobile.svg')}
                                    className={'show-sm'}
                                    alt={''}
                                />
                            </div>
                            <div className="app-instructions-step">
                                <div className="step-item-img">
                                    <img
                                        src={assetUrl('/assets/img/icon-auth/pair-me-app.svg')}
                                        alt={translate('modal_pin_code.step2_image_alt')}
                                    />
                                </div>
                                <h2 className="step-title">{translate('modal_pin_code.step2_title')}</h2>
                                <div className="step-description">
                                    {translate('modal_pin_code.choose')}{' '}
                                    <strong>{translate('modal_pin_code.link')}</strong>
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
                                {translate(`open_in_me.app_header.subtitle_${appConfigs.communication_type}`)}
                            </div>

                            <div className="form-group">
                                <PincodeControl
                                    value={form.values.pin_code.toString()}
                                    onChange={(pin_code) => form.update({ pin_code })}
                                />
                                <FormError error={form.errors.auth_code} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer text-center">
                    <button className="button button-light button-sm" type="button" onClick={modal.close}>
                        {translate('modal.buttons.cancel')}
                    </button>
                    <button
                        className="button button-primary button-sm"
                        type="submit"
                        disabled={form.isLocked || !form.values.pin_code}>
                        {translate('open_in_me.authorize.submit')}
                    </button>
                </div>
            </form>
        </div>
    );
}
