import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import Translate from '../../i18n/elements/Translate';
import { useTranslation } from 'react-i18next';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormError from '../elements/forms/errors/FormError';
import PincodeControl from '../elements/forms/controls/PincodeControl';
import { useIdentityService } from '../../services/IdentityService';
import ModalNotification from './ModalNotification';
import useOpenModal from '../../hooks/useOpenModal';
import useAssetUrl from '../../hooks/useAssetUrl';

export default function ModalAuthPincode({ modal }: { modal: ModalState }) {
    const openModal = useOpenModal();
    const assetUrl = useAssetUrl();
    const identityService = useIdentityService();

    const { t } = useTranslation();

    const form = useFormBuilder({ pin_code: '' }, (values) => {
        identityService.authorizeAuthCode(values.pin_code.toString()).then(
            () => {
                modal.close();

                openModal((modal) => (
                    <ModalNotification
                        modal={modal}
                        title={t('popup_auth.pin_code.confirmation.title')}
                        description={t('popup_auth.pin_code.confirmation.description')}
                        buttonSubmit={{
                            text: t('popup_auth.pin_code.confirmation.buttons.confirm'),
                            onClick: () => modal.close(),
                        }}
                        buttonCancel={{
                            text: t('popup_auth.pin_code.confirmation.buttons.try_again'),
                            onClick: () => openModal((modal) => <ModalAuthPincode modal={modal} />),
                        }}
                    />
                ));
            },
            (res) => {
                form.setErrors({
                    ...res.data.errors,
                    ...(res.status == 404 ? { auth_code: ['Onbekende autorisatie code'] } : {}),
                });

                form.setIsLocked(false);
            },
        );
    });

    return (
        <div className={classList(['modal', 'modal-auth', 'modal-animated', modal.loading ? 'modal-loading' : null])}>
            <div className="modal-backdrop" onClick={modal.close} />
            <div className="modal-window">
                <div className="modal-close mdi mdi-close" onClick={modal.close} />
                <div className="modal-body">
                    <div className="modal-section">
                        <div className="block block-app-instruction">
                            <div className="step-items">
                                <div className="step-item">
                                    <div className="step-item-title">Stap 1</div>
                                    <div className="step-item-subtitle">
                                        <Translate i18n={'open_in_me.app_instruction.step_1'} />
                                    </div>
                                    <img src={assetUrl('/assets/img/screen1.png')} alt="" />
                                </div>
                                <div className="step-item">
                                    <div className="step-item-title">Stap 2</div>

                                    <div className="step-item-subtitle">
                                        <Translate i18n={'open_in_me.app_instruction.step_2'} />
                                    </div>
                                    <img src={assetUrl('/assets/img/screen2.png')} alt="" />
                                </div>
                            </div>

                            <div className="divider-img">
                                <img src={assetUrl('/assets/img/Base7.png')} alt="" />
                            </div>
                        </div>
                        <div className="modal-title">{t('open_in_me.app_header.title')}</div>
                        <div className="modal-subtitle">{t('open_in_me.app_header.subtitle')}</div>

                        <form className="form f-w with-instructions" onSubmit={form.submit}>
                            <div className="form-group">
                                <PincodeControl
                                    value={form.values.pin_code.toString()}
                                    onChange={(pin_code) => form.update({ pin_code })}
                                />
                                <div className="text-center">
                                    <FormError error={form.errors.auth_code} />
                                </div>
                            </div>

                            <div className="form-group text-center">
                                <button className="button button-primary" type="submit" disabled={form.isLocked}>
                                    {t('open_in_me.authorize.submit')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
