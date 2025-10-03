import type { AnswerInputFieldProps } from '../../../../props/types/PrecheckChatbotTypes';
import { useChatbotProvider } from '../../../../contexts/ChatbotContext';
import { useState } from 'react';
import React from 'react';

export default function AnswerInputField(answerInput: AnswerInputFieldProps) {
    const { sendMessage } = useChatbotProvider();
    const [input, setInput] = useState('');

    const handleSend = async () => {
        await sendMessage(input);
    };

    return (
        <div className="answer-input-wrapper">
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
            <button onClick={handleSend} className="button button-icon answer-input-icon" aria-label={'stuur bericht'}>
                <em className={'mdi mdi-send-circle icon-right'}></em>
            </button>
        </div>
    );
}
