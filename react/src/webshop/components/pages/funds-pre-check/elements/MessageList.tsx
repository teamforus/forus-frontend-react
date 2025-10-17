// MessageList.tsx
// Displays the list of chat messages from the chatbot context.
// Automatically scrolls to the latest message and shows a typing indicator if the bot is responding.

import { useChatbotProvider } from '../../../../contexts/ChatbotContext';
import MessageItem from './MessageItem';
import { useRef } from 'react';
import { useAutoScrollToBottom } from '../../../../hooks/useAutoScrollToBottom';
import React from 'react';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';

export default function MessageList() {
    const { messages, isThinking, isLoadingStream } = useChatbotProvider();
    const translate = useTranslate();

    const bottomRef = useRef<HTMLDivElement>(null);
    useAutoScrollToBottom(bottomRef, messages);

    return (
        <div className="message-list">
            {isLoadingStream && (
                <div>
                    <p>{translate('precheck_chatbot.stream.loading')}</p>
                </div>
            )}

            {/* Render each message using MessageItem component */}
            {messages.map((m, k) => (
                <MessageItem key={k} message={m} />
            ))}

            {/* Typing indicator shown while bot is responding */}
            {isThinking && (
                <div>
                    <p>{translate('precheck_chatbot.stream.thinking')}</p>
                </div>
            )}

            {/* Invisible anchor for auto-scrolling */}
            <div ref={bottomRef} />
        </div>
    );
}
