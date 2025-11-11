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
// TODO: refactor name to Window
export default function ChatbotInterface() {
    const { resetChat, messages, setShouldStart } = useChatbotProvider();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as NavigationState | null;
    const from = state?.from;
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        // TODO: refactor from any location
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
            {/*TODO: refactor to use openModal and NotificationModal*/}
            <ModalPrecheckResumeFromHome
                show={showOverlay}
                onClose={() => setShowOverlay(false)}
                onRestart={handleReset}
                onContinue={handleContinue}
            />
        </Fragment>
    );
}
