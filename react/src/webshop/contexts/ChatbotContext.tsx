// ChatbotProvider.tsx
// React Context provider that manages chatbot conversation state.
// Handles message flow, typing indicator, session management, and advice retrieval.
// Persists state to sessionStorage (temporary client-side persistence).

import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePrecheckChatbotService } from '../services/PrecheckChatbotService';
import type { Message, ChatbotContextType, BotResponse, AnswerOption } from '../props/types/PrecheckChatbotTypes.tsx';
import { Advice } from '../props/types/PrecheckAdviceTypes';
import { useLocation } from 'react-router';
import React from 'react';
import ApiMessage from '../props/models/PrecheckChatbotInterface';

const ChatbotContext = createContext<ChatbotContextType | null>(null);

const getInitialAdvice = () => {
    const stored = sessionStorage.getItem('advice');
    return stored ? JSON.parse(stored) : [];
};

export const ChatbotProvider = ({ children }: PropsWithChildren) => {
    const precheckChatbotService = usePrecheckChatbotService();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isThinking, setIsThinking] = useState<boolean>(false);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [advice, setAdvice] = useState<Advice[]>(getInitialAdvice);
    const [isLoadingAdvice, setIsLoadingAdvice] = useState<boolean>(false);
    const [hasAnswerOptions, setHasAnswerOptions] = useState<boolean>(false);
    const [stopStream, setStopStream] = useState<(() => void) | null>(null);
    const [incomingQueue, setIncomingQueue] = useState<BotResponse[]>([]);
    const location = useLocation();
    const [shouldStart, setShouldStart] = useState(false);
    const streamStarted = useRef(false);
    const [isLoadingStream, setIsLoadingStream] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const [hasInputType, setHasInputType] = useState<boolean>(false);

    function isAnswerOption(obj: unknown): obj is AnswerOption {
        return typeof obj === 'object' && obj !== null && 'label' in obj && 'value' in obj;
    }

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
            await precheckChatbotService.send(message);
        } catch (e) {
            console.error('send failed: ', e);
            setIsThinking(false);
            setMessages((prev) => [
                ...prev,
                {
                    type: 'ai',
                    text: 'Er is een server fout opgetreden. Probeer het later opnieuw.',
                    sender: 'Eva',
                    error: true,
                },
            ]);
        }
    };

    /**
     * Resets the entire chat session and starts a new one.
     */
    const resetChat = async () => {
        stopStream?.();
        streamStarted.current = false;
        sessionStorage.removeItem('session_id');
        sessionStorage.removeItem('advice');

        setHasAnswerOptions(false);
        setHasInputType(false);
        setAdvice([]);
        setMessages([]);
        setIsClosed(false);
        await precheckChatbotService.end();

        await start(true);
    };

    /**
     * Initializes a new chat session with the backend.
     */
    const start = useCallback(
        async (restart: boolean = false) => {
            if (!restart && streamStarted.current) {
                console.log('Stream has already started');
                return;
            }

            if (restart) {
                stopStream?.();
                streamStarted.current = false;
            }

            setIsLoadingStream(true);

            const storedSessionId = sessionStorage.getItem('session_id');
            if (!storedSessionId) {
                try {
                    await precheckChatbotService.start();
                    historyLoaded.current = true;
                } catch (e) {
                    console.error(e);
                    setMessages([
                        {
                            type: 'ai',
                            text: 'Er is een server fout opgetreden. Probeer het later opnieuw.',
                            sender: 'Eva',
                            error: true,
                        },
                    ]);
                    setIsLoadingStream(false);
                    setIsThinking(false);
                    return;
                }
            }

            const { stop } = precheckChatbotService.stream(
                (response) => {
                    setIncomingQueue((prev) => [...prev, response]);
                    setIsThinking(false);
                    setIsLoadingStream(false);
                    streamStarted.current = true;
                },
                () => {
                    console.log('received answer -- waiting');
                },
                () => {
                    setIsThinking(true);
                    setIsLoadingStream(false);
                },
                () => {
                    setIsClosed(true);
                    streamStarted.current = false;
                },
                (error) => {
                    if (error.status === 204) {
                        console.log('Conversation already ended – stream will not start');
                    } else if (error.status === 202) {
                        console.log('Needs user reply');
                    } else {
                        console.error('Stream error:', error);
                    }
                    setIsLoadingStream(false);
                    streamStarted.current = true;
                    stopStream();
                },
                restart,
            );
            setStopStream(() => stop);
        },
        [precheckChatbotService, stopStream],
    );

    useEffect(() => {
        if (!historyLoaded.current) return;
        if (incomingQueue.length === 0) return;
        if (messages.some((m) => m.inProgress)) return;

        const next = incomingQueue[0];
        const rest = incomingQueue.slice(1);

        setTimeout(() => {
            setIsThinking(false);
        }, 500);

        setIncomingQueue(rest);

        const fullText = next.text;
        setHasAnswerOptions(!!next.options);
        setHasInputType(!!next.inputType);

        setMessages((prev) => [
            ...prev,
            {
                type: 'ai',
                text: '',
                sender: next.sender,
                answerOptions: next.options,
                inputType: next.inputType,
                inProgress: true,
                step: next.step,
                slots: next.slots,
                error: next.error,
            },
        ]);

        let index = 0;
        const words = fullText.split(' ');

        const interval = setInterval(() => {
            setIsTyping(true);
            setMessages((prev) => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                if (lastIndex < 0) return updated;
                const last = updated[lastIndex];
                if (last.type === 'ai' && last.inProgress) {
                    const partial = words.slice(0, index + 1).join(' ');
                    updated[lastIndex] = { ...last, text: partial };
                }

                return updated;
            });
            index++;
            if (index >= words.length) {
                setIsTyping(false);
                clearInterval(interval);
                setMessages((prev) => {
                    const updated = [...prev];
                    const lastIndex = updated.length - 1;
                    if (lastIndex >= 0 && updated[lastIndex].inProgress) {
                        updated[lastIndex] = { ...updated[lastIndex], inProgress: false };
                    }
                    return updated;
                });
            }
        }, 100);
    }, [incomingQueue, messages]);

    /**
     * Fetches advice from the backend and stores it in session state.
     */
    const getAdvice = async () => {
        setIsLoadingAdvice(true);
        const result = await precheckChatbotService.advice();
        setAdvice(result);
        sessionStorage.setItem('advice', JSON.stringify(result));
        setIsLoadingAdvice(false);
    };

    const hasInitialized = useRef(false);
    const historyLoaded = useRef(false);

    useEffect(() => {
        const storedSessionId = sessionStorage.getItem('session_id');
        if (!storedSessionId) return;
        if (location.pathname !== '/regelingencheck') return;
        if (hasInitialized.current) return;

        const error_message: Message = {
            type: 'ai',
            text: 'Er kunnen geen berichten worden geladen, herstart de precheck.',
            sender: 'Eva',
            error: true,
        };
        setIsLoadingStream(true);
        if (document.cookie.includes('session_token=')) {
            precheckChatbotService
                .history()
                .then((history) => {
                    if (history.length === 0) {
                        setMessages([error_message]);
                    } else {
                        const formattedMessages = history.map((msg: ApiMessage) => ({
                            type: msg.type,
                            text: msg.text,
                            sender: msg.sender,
                            answerOptions: msg.answer_options || null,
                            inputType: msg.input_type || null,
                            inProgress: false,
                            answered: msg.answered,
                            selectedAnswer: (msg.selected_answer as AnswerOption) || null,
                            step: msg.step || null,
                            slots: msg.slots || null,
                            error: msg.error || null,
                        }));
                        setMessages(formattedMessages);
                    }
                    historyLoaded.current = true;
                    setIsLoadingStream(false);
                })
                .catch(() => {
                    setMessages([error_message]);
                });
        }
        hasInitialized.current = true;
    }, [location.pathname, precheckChatbotService]);

    useEffect(() => {
        if (!shouldStart) return;
        start();
    }, [shouldStart, start]);

    useEffect(() => {
        if (!historyLoaded.current) return;
        if (incomingQueue.length > 0) return;
        if (messages.length === 0) return;
        const last = messages[messages.length - 1];
        if (last && last.type === 'ai' && !last.inProgress) {
            setIsThinking(false);
            setHasAnswerOptions(last.answerOptions != null);
            setHasInputType(last.inputType != null);
            last.answered = false;
        }
    }, [messages, incomingQueue]);

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
