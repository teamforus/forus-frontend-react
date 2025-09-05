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

export default function MessageItem({ message }: MessageProps) {
    let className =
        ' p-2 rounded-t-lg w-fit max-w sm:max-w-4/5  lg:max-w-3/5 mb-2 sm:mb-1 place-self-start wrap-break-word whitespace-pre-line text-sm mr-2 sm:mr-0 sm:text-base sm:font-semibold ';
    className += message.error ? 'bg-red-200 border-2 border-red-700 text-red-700 ' : '';
    className +=
        message.type === 'user'
            ? 'bg-violet-200 ml-auto text-right rounded-bl-lg'
            : 'text-left bg-indigo-200 rounded-br-lg';
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

    if (message.type === 'ai') {
        return (
            <div className="flex flex-row mb-2">
                <div className="mr-2 ">
                    <Avatar name={message.sender} />
                </div>
                <div className="justify-items-start w-full ">
                    <div className={`${className} ${message.inProgress ? 'italic text-gray-500' : ''}`}>
                        {message.text}
                    </div>
                    {message.slots && (
                        <div className={`${className} ${message.inProgress ? 'italic text-gray-500' : ''}`}>
                            {/* Show slots when it's the 'confirm_data' step */}
                            {message.step === 'confirm_data' && message.slots && !message.inProgress && (
                                <div>
                                    {message.slots.map((item) => (
                                        <li key={item.slot}>{item.message_slot}</li>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        {/* Render answer buttons if available */}
                        {!message.inProgress && message.answerOptions && (
                            <div className={'flex flex-col lg:flex-row'}>
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
                            <button
                                className={`mt-2 ml-0 `} //${buttonNav} ${button}
                                disabled={isLoadingAdvice}>
                                {' '}
                                {/* onClick={referToAdvice} */}{' '}
                                {isLoadingAdvice ? 'Bezig met laden...' : 'Bekijk je advies'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    // For user messages: simple right-aligned bubble
    return <div className={className}>{message.text}</div>;
}
