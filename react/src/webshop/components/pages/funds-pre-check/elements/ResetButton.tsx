// ResetButton.tsx
// Renders a button to reset the chatbot session.
// Shows a confirmation overlay before clearing messages and advice.
// Optionally redirects to /precheck after reset.

import React, { useCallback } from 'react';
import { useChatbotProvider } from '../../../../contexts/ChatbotContext';
// import {useGoToPage} from "../../hooks/useGoToPage.tsx";
import ModalNotification from '../../../modals/ModalNotification';
import useOpenModal from '../../../../../dashboard/hooks/useOpenModal';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';

export default function ResetButton({ shouldRedirect }: { shouldRedirect: boolean }) {
    const { resetChat } = useChatbotProvider();
    const openModal = useOpenModal();
    const translate = useTranslate();

    // const goToPage = useGoToPage('precheck')

    // TODO: refactor goToPage to StateNavLink
    // Resets the session and optionally redirects to /precheck
    const handleReset = useCallback((): void => {
        resetChat();
        if (shouldRedirect) {
            // goToPage();
        }
    }, [resetChat, shouldRedirect]);

    const reset = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    type={'confirm'}
                    onConfirm={handleReset}
                    title={translate('modal_precheck.restart.title')}
                    description={translate('modal_precheck.restart.description')}
                    closeBtnText={translate('modal.cancel')}
                    confirmBtnText={translate('modal_precheck.restart.confirm')}
                />
            ));
        },
        [handleReset, openModal, translate],
    );

    return (
        <div className="reset-button">
            {/* Trigger confirmation on click */}
            <button className="button button-primary" onClick={reset}>
                {translate('precheck_chatbot.reset_button')}
            </button>
        </div>
    );
}
