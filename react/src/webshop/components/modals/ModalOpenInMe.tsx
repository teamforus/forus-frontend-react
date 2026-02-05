import React, { useCallback } from 'react';
import classNames from 'classnames';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import useAppConfigs from '../../hooks/useAppConfigs';
import PhoneControl from '../../../dashboard/components/elements/forms/controls/PhoneControl';
import useFormBuilder from '../../../dashboard/hooks/useFormBuilder';
import FormError from '../../../dashboard/components/elements/forms/errors/FormError';
import AppLinks from '../elements/app-links/AppLinks';
import { ResponseError } from '../../../dashboard/props/ApiResponses';
import useShareService from '../../../dashboard/services/ShareService';
import IconMeLogo from '../../../../assets/forus-webshop/resources/_webshop-common/assets/img/me-logo.svg';
import ModalAuthPincode from './ModalAuthPincode';
import useOpenModal from '../../../dashboard/hooks/useOpenModal';
import TranslateHtml from '../../../dashboard/components/elements/translate-html/TranslateHtml';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';

export default function ModalOpenInMe({ modal }: { modal: ModalState }) {
    const translate = useTranslate();
    const openModal = useOpenModal();

    const appConfigs = useAppConfigs();
    const shareService = useShareService();

    const phoneForm = useFormBuilder(
        {
            phone: '+31',
        },
        () => {
            shareService
                .sendSms({
                    phone: parseInt(phoneForm.values.phone.toString().replace(/\D/g, '') || '0'),
                    type: 'me_app_download_link',
                })
                .then(() => {
                    modal.close();
                    openModal((modal) => <ModalAuthPincode modal={modal} />);
                })
                .catch((err: ResponseError) => {
                    phoneForm.setIsLocked(false);
                    phoneForm.setErrors(err.data.errors);

                    if (err.status == 429) {
                        phoneForm.setErrors({
                            phone: [translate('sign_up.sms.error.try_later')],
                        });
                    }
                });
        },
    );

    const { update: phoneFormUpdate } = phoneForm;

    const skip = useCallback(() => {
        modal.close();
        openModal((modal) => <ModalAuthPincode modal={modal} />);
    }, [modal, openModal]);

    const onPhoneChange = useCallback(
        (phone: string) => {
            phoneFormUpdate({ phone });
        },
        [phoneFormUpdate],
    );

    return (
        <div
            className={classNames('modal', 'modal-open-in-me', 'modal-animated', !modal.loading && 'modal-loaded')}
            role="dialog">
            <div
                className="modal-backdrop"
                onClick={modal.close}
                aria-label={translate('buttons.close')}
                role="button"
            />

            <div className="modal-window">
                <form className="form f-w" onSubmit={phoneForm.submit}>
                    <div
                        className="modal-close mdi mdi-close"
                        onClick={modal.close}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        aria-label={translate('buttons.close')}
                        role="button"
                    />
                    <div className="modal-header">
                        <h2 className="modal-header-title">{translate('open_in_me.header.title')}</h2>
                    </div>
                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-section-icon">
                                <IconMeLogo />
                            </div>

                            <h2 className="modal-section-title">
                                {translate(`open_in_me.sms.title_${appConfigs.communication_type}`)}
                            </h2>

                            <div className="modal-section-description">
                                {translate(`open_in_me.sms.description_${appConfigs.communication_type}`)}
                            </div>

                            <div className="modal-section-description show-sm">
                                {translate('open_in_me.body.use_app')}
                            </div>

                            <div className="modal-open-in-me-phone-control">
                                <PhoneControl onChange={onPhoneChange} placeholder={null} />
                                <FormError error={phoneForm.errors.phone} />
                            </div>
                            <div className="modal-section-notice-block">
                                <div className="modal-section-description">
                                    <TranslateHtml
                                        i18n={`open_in_me.sms.subdescription_${appConfigs.communication_type}`}
                                    />
                                </div>
                            </div>
                            <div className="text-center show-sm">
                                <AppLinks />
                            </div>
                            <em className="modal-section-space show-sm" />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="button button-sm button-light" type="button" onClick={skip}>
                            {translate('open_in_me.sms.button.skip')}
                        </button>
                        <button className="button button-sm button-primary" type="submit">
                            {translate('open_in_me.sms.button.send')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
