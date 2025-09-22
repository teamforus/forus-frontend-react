// ChatbotProvider.tsx
// React Context provider that manages chatbot conversation state.
// Handles message flow, typing indicator, session management, and advice retrieval.
// Persists state to sessionStorage (temporary client-side persistence).

import React, { createContext, type PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { usePrecheckChatbotService } from '../services/PrecheckChatbotService';
import type { AnswerOption, ChatbotContextType, Message } from '../props/types/PrecheckChatbotTypes.tsx';
import { Advice } from '../props/types/PrecheckAdviceTypes';
import { useStreamHandler } from '../hooks/useStreamHandler';
import { useMessageQueue } from '../hooks/useMessageQueue';
import { useChatHistory } from './hooks/useChatHistory';
import { parseProblemJson, ProblemJson } from '../hooks/useParseProblemJson';

const ChatbotContext = createContext<ChatbotContextType | null>(null);

function isAnswerOption(obj: unknown): obj is AnswerOption {
    return typeof obj === 'object' && obj !== null && 'label' in obj && 'value' in obj;
}

const getInitialAdvice = () => {
    const stored = sessionStorage.getItem('advice');
    return stored ? JSON.parse(stored) : [];
};

export const ChatbotProvider = ({ children }: PropsWithChildren) => {
    const precheckChatbotService = usePrecheckChatbotService();

    const [messages, setMessages] = useState<Message[]>([]);
    const [advice, setAdvice] = useState<Advice[]>(getInitialAdvice);
    const [isThinking, setIsThinking] = useState<boolean>(false);
    const [isTyping, setIsTyping] = useState<boolean>(false);

    const lastSeenSeq = useRef<number | null>(null);

    const [isLoadingAdvice, setIsLoadingAdvice] = useState<boolean>(false);
    const [hasAnswerOptions, setHasAnswerOptions] = useState<boolean>(false);
    const [shouldStart, setShouldStart] = useState(false);
    const [hasInputType, setHasInputType] = useState<boolean>(false);

    const { loadingHistory } = useChatHistory(precheckChatbotService, setMessages, lastSeenSeq);

    const { startStream, stopStream, isLoadingStream, isClosed, incomingQueue, setIncomingQueue, resetStream } =
        useStreamHandler(precheckChatbotService, lastSeenSeq, {
            onResponse: () => setIsThinking(false),
            onWaiting: () => console.log('Waiting on user input...'),
            onTyping: () => setIsThinking(true),
            onClosed: () => console.log('Closed...'),
            onError: (problem: ProblemJson) => {
                console.error('Stream error:', problem.title);
                setMessages((prev) => [
                    ...prev,
                    {
                        type: 'ai',
                        text: `${problem.title ?? 'Fout'}: ${problem.detail ?? ''} `,
                        sender: 'Eva',
                        error: true,
                    },
                ]);
                setIsThinking(false);
            },
        });

    useMessageQueue(
        incomingQueue,
        setIncomingQueue,
        setMessages,
        setIsTyping,
        messages,
        loadingHistory,
        setIsThinking,
        setHasAnswerOptions,
        setHasInputType,
    );

    useEffect(() => {
        if (shouldStart) startStream();
    }, [shouldStart]);

    useEffect(() => {
        return () => stopStream();
    }, [stopStream]);

    useEffect(() => {
        if (loadingHistory) return;
        if (incomingQueue.length > 0) return;
        if (messages.length === 0) return;
        const last = messages[messages.length - 1];
        if (last && last.type === 'ai' && !last.inProgress) {
            setIsThinking(false);
            setHasAnswerOptions(last.answerOptions != null);
            setHasInputType(last.inputType != null);
            last.answered = false;
        }
    }, [messages, incomingQueue, loadingHistory]);

    /**
     * Resets the entire chat session and starts a new one.
     */
    const resetChat = async () => {
        stopStream?.();
        setHasAnswerOptions(false);
        setHasInputType(false);
        setAdvice([]);
        setMessages([]);
        setIncomingQueue([]);
        await precheckChatbotService.end();
        resetStream();
        await startStream(true);
    };

    const getAdvice = async () => {
        setIsLoadingAdvice(true);
        const result = await precheckChatbotService.advice();
        setAdvice(result);
        sessionStorage.setItem('advice', JSON.stringify(result));
        setIsLoadingAdvice(false);
    };

    /**
     * Sends a user message to the chatbot, handles AI response and updates chat state.
     */
    const sendMessage = async (message: string | AnswerOption) => {
        await new Promise((resolve) => setTimeout(resolve, 200));

        setMessages((prev) => {
            const lastIndex = prev.map((m) => m.type).lastIndexOf('ai');

            const updated = prev.map((msg, i) => {
                if (i === lastIndex) {
                    return { ...msg, answered: true };
                }
                return msg;
            });
            const humanMessage = isAnswerOption(message) ? message.label : message;

            return [...updated, { type: 'user', text: humanMessage }];
        });

        setHasAnswerOptions(false);
        setHasInputType(false);
        setIsThinking(true);
        try {
            const res = await precheckChatbotService.send(message);
            if (res === 'resume') {
                console.log('Continue stream');
                await startStream(true);
            }
        } catch (e) {
            const problem = parseProblemJson(e);
            console.error('send failed: ', e);
            setIsThinking(false);
            setMessages((prev) => [
                ...prev,
                {
                    type: 'ai',
                    text: `${problem.title ?? 'Fout'}: ${problem.detail ?? ''}`,
                    sender: 'Eva',
                    error: true,
                },
            ]);
        }
    };

    return (
        <ChatbotContext.Provider
            value={{
                messages,
                sendMessage,
                isThinking,
                resetChat,
                advice,
                getAdvice,
                isLoadingAdvice,
                hasAnswerOptions,
                setShouldStart,
                isLoadingStream,
                isTyping,
                isClosed,
                hasInputType,
            }}>
            {children}
        </ChatbotContext.Provider>
    );
};

/**
 * Custom hook to consume the chatbot context.
 * Must be used within a ChatbotProvider.
 */
export const useChatbotProvider = () => {
    const context = useContext(ChatbotContext);
    if (!context) {
        throw new Error('useChatbotProvider must be used within a ChatbotProvider');
    }
    return context;
};
