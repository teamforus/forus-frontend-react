// TextInput.tsx
// Renders the text input field for user messages in the chatbot.
// Disables input if the bot is typing or if predefined answer options are shown.
// Sends the message on Enter key or send button click.

import { useChatbotProvider } from '../../../../contexts/ChatbotContext';
// import { Send } from 'lucide-react';
import React from 'react';
import { useState } from 'react';

export default function TextInput() {
    const { sendMessage, isThinking, hasAnswerOptions, isTyping, isClosed, hasInputType } = useChatbotProvider();
    const [input, setInput] = useState('');

    // Prevent sending empty messages and clear the input after sending
    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed) return;
        await sendMessage(trimmed);
        setInput('');
    };

    // Disable input if the bot is currently typing or if answer options are shown
    const disabled = isThinking || hasAnswerOptions || isTyping || isClosed || hasInputType;

    // Dynamic styles for input container
    let divClass =
        'flex flex-row place-self-center justify-between w-full h-fit md:w-1/2 2xl:w-2/5 text-sm sm:text-base rounded-md p-1 sm:p-2 border-3 bg-gray-100 ';
    divClass += disabled ? 'border-red-500' : 'border-gray-300';

    // Dynamic styles for input field
    let inputClass = 'w-full focus:outline-none ';
    inputClass += disabled ? 'placeholder:text-red-400' : ' ';

    // Dynamic styles for send button
    const sendButtonClass = disabled ? 'text-red-400' : 'hover:text-blue-600 text-gray-500';

    let placeholder;
    switch (true) {
        case hasAnswerOptions:
            placeholder = 'Kies een van de antwoord opties';
            break;
        case isClosed:
            placeholder = 'Er is nu geen actieve chat';
            break;
        case isTyping:
            placeholder = 'Even wachten...';
            break;
        default:
            placeholder = 'Type hier...';
    }

    return (
        <div className={divClass}>
            <input
                type="text"
                className={inputClass}
                placeholder={placeholder}
                disabled={disabled}
                onChange={(e) => setInput(e.currentTarget.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleSend();
                    }
                }}
                value={input}
            />
            <button disabled={disabled} onClick={handleSend} className={sendButtonClass} aria-label={'stuur bericht'}>
                {/* <Send /> */}
                {/* TODO: add icon */}
            </button>
        </div>
    );
}
