// chat.tsx
// Type definitions for chatbot context and messaging system.

import React from 'react';
import { Advice } from './PrecheckAdviceTypes';

export type ProgressBarProps = {
    percentage: number;
    className?: string;
};

export type AnswerOptionButtonProps = {
    option: AnswerOption;
    disabled?: boolean;
    isSelected?: boolean;
    onSelect: () => void;
    step?: string;
    slots?: SlotSummaryItem[];
};

export type AvatarProps = {
    name?: string;
};

export type MessageProps = {
    message: Message;
};

export type OverlayProps = {
    show: boolean;
    onClose: () => void;
    children?: React.ReactNode;
};

export type AdviceExplanation = {
    explanation: string;
    per_condition: string[];
};

export type AnswerInputFieldProps = {
    inputType: string;
};

export interface BotResponse {
    text: string;
    options?: AnswerOption[];
    inputType?: string;
    sender: string;
    step?: string;
    slots?: SlotSummaryItem[];
    error?: boolean;
}

export type ChatbotContextType = {
    messages: Message[];
    isThinking: boolean;
    sendMessage: (message: string | AnswerOption) => Promise<void>;
    resetChat: () => void;
    advice: Advice[];
    getAdvice: () => Promise<void>;
    isLoadingAdvice: boolean;
    hasAnswerOptions: boolean;
    setShouldStart: (value: ((prevState: boolean) => boolean) | boolean) => void;
    isLoadingStream: boolean;
    isTyping: boolean;
    isClosed: boolean;
    hasInputType: boolean;
};

export type Message = {
    type: 'user' | 'ai';
    text: string;
    sender?: string;
    answerOptions?: AnswerOption[];
    inputType?: string;
    answered?: boolean;
    step?: string;
    inProgress?: boolean;
    selectedAnswer?: AnswerOption;
    slots?: SlotSummaryItem[];
    error?: boolean;
};

export type AnswerOption = {
    label: string;
    value: string | number | boolean | Array<unknown>;
};

export type NavigationState = { from?: string };

export type SlotSummaryItem = {
    slot: string;
    label_slot: string;
    message_slot: string;
};
