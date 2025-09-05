// MessageList.tsx
// Displays the list of chat messages from the chatbot context.
// Automatically scrolls to the latest message and shows a typing indicator if the bot is responding.

import { useChatbotProvider } from '../../../../contexts/ChatbotContext';
import MessageItem from './MessageItem';
import { useRef } from 'react';
import { useAutoScrollToBottom } from '../../../../hooks/useAutoScrollToBottom';
import React from 'react';

export default function MessageList() {
    const { messages, isThinking, isLoadingStream } = useChatbotProvider();
    const bottomRef = useRef<HTMLDivElement>(null);
    useAutoScrollToBottom(bottomRef, messages);

    return (
        <div className="h-full px-1 sm:px-2">
            {isLoadingStream && <div>Loading...</div>}

            {/* Render each message using MessageItem component */}
            {messages.map((m, k) => (
                <MessageItem key={k} message={m} />
            ))}

            {/* Typing indicator shown while bot is responding */}
            {isThinking && <div className="flex justify-start text-sm text-gray-500">🤖 Aan het denken...</div>}

            {/* Invisible anchor for auto-scrolling */}
            <div ref={bottomRef} />
        </div>
    );
}
