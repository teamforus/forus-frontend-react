// MessageItem.tsx
// Renders a single chat message with conditional layout based on sender (user vs AI).
// For AI messages, it includes an avatar, optional answer buttons, and a link to the advice page.

import Avatar from './Avatar';
import AnswerOptionButton from './AnswerOptionButton';
import type { MessageProps } from '../../../../props/types/PrecheckChatbotTypes';
// import { button, buttonNav } from '../../styles/classnames.tsx';
// import { useGoToPage } from '../../hooks/useGoToPage.tsx';
import { useChatbotProvider } from '../../../../contexts/ChatbotContext';
import type { AnswerOption } from '../../../../props/types/PrecheckChatbotTypes';
import AnswerInputField from './AnswerInputField';
import React from 'react';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';

export default function MessageItem({ message }: MessageProps) {
    // const goToPage = useGoToPage('advies');
    // TODO: refactor goToPage to StateNavLink
    const { isLoadingAdvice } = useChatbotProvider(); //getAdvice,
    // const referToAdvice = async () => {
    //     await getAdvice();
    //     // goToPage();
    // };
    // const [selectedOption, setSelectedOption] = useState<string | number | boolean| null>(null);

    const selectOption = (option: AnswerOption) => {
        message.selectedAnswer = option;
    };
    const translate = useTranslate();

    if (message.type === 'ai') {
        return (
            <div className="message-wrapper">
                <div className="message-avatar">
                    <Avatar name={message.sender} />
                </div>
                <div className="message-content">
                    <div
                        className={`message-item message-item--bot
                            ${message.error ? 'message-item--error' : ''}
                            ${message.inProgress ? 'message-item--in-progress' : ''}
                    `}>
                        <p>{message.text}</p>
                    </div>
                    {message.slots && (
                        <div
                            className={`message-item message-item--bot
                                ${message.inProgress ? 'message-item--in-progress' : ''}
                        `}>
                            {/* Show slots when it's the 'confirm_data' step */}
                            {message.step === 'confirm_data' && message.slots && !message.inProgress && (
                                <ul>
                                    {message.slots.map((item) => (
                                        <li key={item.slot}>{item.message_slot}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <div>
                        {/* Render answer buttons if available */}
                        {!message.inProgress && message.answerOptions && (
                            <div className="answer-options">
                                {message.answerOptions.map((option, k) => (
                                    <AnswerOptionButton
                                        key={k}
                                        option={option}
                                        disabled={message.answered}
                                        isSelected={message.selectedAnswer?.value === option.value}
                                        onSelect={() => {
                                            selectOption(option);
                                        }}
                                        step={message.step}
                                        slots={message.slots}
                                    />
                                ))}
                            </div>
                        )}
                        {!message.inProgress && !message.answered && message.inputType && (
                            <AnswerInputField inputType={message.inputType} key={message.text} />
                        )}
                        {/* Show CTA button when it's the 'advice' step */}
                        {message.step === 'advice' && (
                            <button className="advice-button" disabled={isLoadingAdvice}>
                                {' '}
                                {/* onClick={referToAdvice} */}
                                {isLoadingAdvice
                                    ? translate('precheck_chatbot.advice_button.loading')
                                    : translate('precheck_chatbot.advice_button.done')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    // For user messages: simple right-aligned bubble
    return (
        <div className="message-item message-item--user ">
            <p>{message.text}</p>
        </div>
    );
}
