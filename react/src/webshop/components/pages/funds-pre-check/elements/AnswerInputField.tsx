import type { AnswerInputFieldProps } from '../../../../props/types/PrecheckChatbotTypes';
import { useChatbotProvider } from '../../../../contexts/ChatbotContext';
import { useState } from 'react';
// import { CircleChevronRight } from 'lucide-react';
import React from 'react';

export default function AnswerInputField(answerInput: AnswerInputFieldProps) {
    const { sendMessage } = useChatbotProvider();
    const [input, setInput] = useState('');
    // TODO: fix css
    // const divClass =
    // 'flex w-2/3 justify-items-start items-center text-sm sm:text-base rounded-md border-3 border-gray-400 bg-gray-100';
    // const inputClass = 'w-full focus:outline-none text-center';

    const handleSend = async () => {
        await sendMessage(input);
    };

    const sendButtonClass = 'hover:text-gray-600 text-gray-400';

    return (
        <div className="answer-input-wrapper font">
            <input
                className="form form-control answer-input"
                placeholder="Typ hier..."
                type={answerInput.inputType}
                min={answerInput.inputType === 'number' ? '0' : undefined}
                onChange={(e) => setInput(e.currentTarget.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleSend();
                    }
                }}
            />
            <button onClick={handleSend} className={sendButtonClass} aria-label={'stuur bericht'}>
                {/* <CircleChevronRight />*/}
                {/* TODO: add icon */}
            </button>
        </div>
    );
}
