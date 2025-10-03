// ResetButton.tsx
// Renders a button to reset the chatbot session.
// Shows a confirmation overlay before clearing messages and advice.
// Optionally redirects to /precheck after reset.

import React from 'react';
import { useChatbotProvider } from '../../../../contexts/ChatbotContext';
// import {useGoToPage} from "../../hooks/useGoToPage.tsx";
import { useState } from 'react';
import ModalPrecheckRestart from '../../../modals/ModalPrecheckRestart';

export default function ResetButton({ shouldRedirect }: { shouldRedirect: boolean }) {
    const { resetChat } = useChatbotProvider();
    const [showModal, setShowModal] = useState(false);
    // const goToPage = useGoToPage('precheck')
    // TODO: refactor goToPage to StateNavLink
    // Resets the session and optionally redirects to /precheck
    const handleReset = (): void => {
        setShowModal(false);
        resetChat();
        if (shouldRedirect) {
            // goToPage();
        }
    };

    return (
        <div className="reset-button">
            {/* Trigger confirmation on click */}
            <button className="button button-primary" onClick={() => setShowModal(true)}>
                Herstart de regelingencheck
            </button>

            {/* Confirmation overlay content: title, message, and two buttons */}
            <ModalPrecheckRestart show={showModal} onClose={() => setShowModal(false)} onRestart={handleReset} />
        </div>
    );
}
