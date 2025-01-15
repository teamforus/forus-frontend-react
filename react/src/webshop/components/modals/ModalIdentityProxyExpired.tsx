import React, { useCallback } from 'react';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import { useNavigateState } from '../../modules/state_router/Router';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';

export default function ModalIdentityProxyExpired({ modal }: { modal: ModalState }) {
    const translate = useTranslate();
    const navigateState = useNavigateState();

    const cancel = useCallback(() => {
        modal.close();
        navigateState('home');
    }, [modal, navigateState]);

    const openLoginModal = useCallback(() => {
        modal.close();
        navigateState('start');
    }, [modal, navigateState]);

    return (
        <div
            className={`modal modal-identity-proxy-expired modal-animated  ${modal.loading ? '' : 'modal-loaded'}`}
            role="dialog">
            <div
                className="modal-backdrop"
                onClick={cancel}
                aria-label={translate('expired_identity.buttons.close')}
                role="button"
            />

            <div className="modal-window">
                <div
                    className="modal-close mdi mdi-close"
                    onClick={cancel}
                    tabIndex={0}
                    onKeyDown={clickOnKeyEnter}
                    aria-label={translate('expired_identity.buttons.close')}
                    role="button"
                />
                <div className="modal-header">
                    <h2 className="modal-header-title">{translate('expired_identity.header.title')}</h2>
                </div>
                <div className="modal-body">
                    <div className="modal-section">
                        <div className="modal-section-icon">
                            <div className="mdi mdi-cancel" />
                        </div>
                        <h2 className="modal-section-title" role="heading" id="expiredIdentityDialogTitle">
                            {translate('expired_identity.title')}
                        </h2>
                        <div className="modal-section-description" id="expiredIdentityDialogDescription">
                            {translate('expired_identity.description')}
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="button button-sm button-primary" onClick={openLoginModal}>
                        {translate('expired_identity.buttons.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
}
