import { Dispatch, SetStateAction, useEffect } from 'react';
import { BotResponse, Message } from '../props/types/PrecheckChatbotTypes';

const TYPING_DELAY = 100;

export function useMessageQueue(
    incomingQueue: BotResponse[],
    setIncomingQueue: Dispatch<SetStateAction<BotResponse[]>>,
    setMessages: Dispatch<SetStateAction<Message[]>>,
    setIsTyping: Dispatch<SetStateAction<boolean>>,
    messages: Message[],
    loadingHistory: boolean,
    setIsThinking: Dispatch<SetStateAction<boolean>>,
    setHasAnswerOptions: Dispatch<SetStateAction<boolean>>,
    setHasInputType: Dispatch<SetStateAction<boolean>>,
) {
    useEffect(() => {
        console.log(incomingQueue);
        if (loadingHistory) return;
        if (incomingQueue.length === 0) return;

        const next = incomingQueue[0];
        const rest = incomingQueue.slice(1);

        setTimeout(() => {
            setIsThinking(false);
        }, 500);

        setIncomingQueue(rest);

        next.options ? setHasAnswerOptions(true) : setHasAnswerOptions(false);
        next.inputType ? setHasInputType(true) : setHasInputType(false);

        console.log('Adding AI message from queue', next);
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

        const words = next.text.split(' ');
        let index = 0;

        const interval = setInterval(() => {
            setIsTyping(true);
            setMessages((prev: Message[]) => {
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
                clearInterval(interval);
                setIsTyping(false);
                setMessages((prev: Message[]) => {
                    const updated = [...prev];
                    const lastIndex = updated.length - 1;
                    if (lastIndex >= 0 && updated[lastIndex].inProgress) {
                        updated[lastIndex] = { ...updated[lastIndex], inProgress: false };
                    }
                    return updated;
                });
            }
        }, TYPING_DELAY);

        return () => clearInterval(interval);
    }, [incomingQueue, messages]);
}
