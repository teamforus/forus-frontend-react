// ResetButton.tsx
// Renders a button to reset the chatbot session.
// Shows a confirmation overlay before clearing messages and advice.
// Optionally redirects to /precheck after reset.

import React from 'react';
import { useChatbotProvider } from '../../../../contexts/ChatbotContext';
// import {useGoToPage} from "../../hooks/useGoToPage.tsx";
import Overlay from './../../../elements/overlay/Overlay';
import { useState } from 'react';
// import {button} from "../../styles/classnames.tsx";

export default function ResetButton({ shouldRedirect }: { shouldRedirect: boolean }) {
    const { resetChat } = useChatbotProvider();
    const [showOverlay, setShowOverlay] = useState(false);
    // const goToPage = useGoToPage('precheck')
    // TODO: refactor goToPage to StateNavLink
    // Resets the session and optionally redirects to /precheck
    const handleReset = (): void => {
        setShowOverlay(false);
        resetChat();
        if (shouldRedirect) {
            // goToPage();
        }
    };

    return (
        <div className="reset-button">
            {/* Trigger confirmation on click */}
            <button className="button button-primary" onClick={() => setShowOverlay(true)}>
                Herstart de regelingencheck
            </button>

            {/* Confirmation overlay content: title, message, and two buttons */}
            <Overlay show={showOverlay} onClose={() => setShowOverlay(false)}>
                <h2 className="text-xl font-bold mb-2">Herstarten regelingencheck</h2>
                <p className="font-semibold">
                    Weet je zeker dat je wil herstarten? Alle berichten en advies worden dan verwijderd.
                </p>
                <button
                    className="mt-4 bg-lime-700 text-white px-3 p-1 m-2 rounded hover:bg-lime-900"
                    onClick={handleReset}>
                    Ja
                </button>
                <button
                    className="mt-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-800"
                    onClick={() => setShowOverlay(false)}>
                    Sluiten
                </button>
            </Overlay>
        </div>
    );
}
