// ChatbotInterface.tsx
// UI wrapper for the chatbot interaction.
// Includes the message list, input field, progress bar, and reset button.
// Designed to be scrollable and responsive across screen sizes.

import MessageList from './MessageList';
import ResetButton from './ResetButton';
import ProgressBar from './ProgressBar';
import { useNavigate, useLocation } from 'react-router';
import type { NavigationState } from '../../../../props/types/PrecheckChatbotTypes';
import { Fragment, useEffect, useState } from 'react';
import { useChatbotProvider } from '../../../../contexts/ChatbotContext';
import type { NavigateOptions } from 'react-router';
import React from 'react';
import ModalPrecheckResumeFromHome from '../../../modals/ModalPrecheckResumeFromHome';

export default function ChatbotInterface() {
    const { resetChat, messages, setShouldStart } = useChatbotProvider();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as NavigationState | null;
    const from = state?.from;
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        if (from === '/home' && messages.length > 0) {
            setShowOverlay(true);
        } else {
            const options: NavigateOptions = { replace: true };
            navigate(location.pathname, options);
            setShouldStart(true);
        }
    }, [from, location, messages, navigate, setShouldStart]);

    const handleReset = async () => {
        setShowOverlay(false);
        await resetChat();
        const options: NavigateOptions = { replace: true };
        navigate(location.pathname, options);
        setShouldStart(true);
    };

    const handleContinue = (): void => {
        const options: NavigateOptions = { replace: true };
        navigate(location.pathname, options);
        setShowOverlay(false);
        setShouldStart(true);
    };

    return (
        <Fragment>
            {/* Top section: progress bar and reset button aligned horizontally */}
            <div className="chatbot-header">
                <ProgressBar percentage={40} />
                <ResetButton shouldRedirect={false} />
            </div>

            {/* Chat content area with scrollable message list and input field */}
            <div className="chatbot-messages">
                <MessageList />
            </div>

            {/* Starting overlay content */}
            {/*TODO: fix css */}
            {/*TODO: use translations*/}
            <ModalPrecheckResumeFromHome
                show={showOverlay}
                onClose={() => setShowOverlay(false)}
                onRestart={handleReset}
                onContinue={handleContinue}
            />
            {/*<Overlay show={showOverlay} onClose={() => setShowOverlay(false)}>*/}
            {/*    <h2 className="text-xl font-bold mb-2">De huidige regelcheck is nog bezig</h2>*/}
            {/*    <p className="font-semibold">*/}
            {/*        Wil je verdergaan waar je was gebleven of de check weer opnieuw opstarten?*/}
            {/*    </p>*/}
            {/*    <button*/}
            {/*        className="mt-4 bg-lime-700 text-white px-3 p-1 m-2 rounded hover:bg-lime-900"*/}
            {/*        onClick={handleReset}>*/}
            {/*        Opnieuw opstarten*/}
            {/*    </button>*/}
            {/*    <button*/}
            {/*        className="mt-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-800"*/}
            {/*        onClick={handleContinue}>*/}
            {/*        Verdergaan*/}
            {/*    </button>*/}
            {/*</Overlay>*/}
        </Fragment>
    );
}
