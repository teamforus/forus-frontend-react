import { Dispatch, MutableRefObject, SetStateAction, useEffect, useState } from 'react';
import { type AnswerOption, Message } from '../../props/types/PrecheckChatbotTypes';
import ApiMessage from '../../props/models/PrecheckChatbotInterface';
import { PrecheckChatbotService } from '../../services/PrecheckChatbotService';
import { useLocation } from 'react-router';

export function useChatHistory(
    precheckChatbotService: PrecheckChatbotService,
    setMessages: Dispatch<SetStateAction<Message[]>>,
    lastSeenSeqRef: MutableRefObject<number>,
) {
    const [loadingHistory, setLoadingHistory] = useState(false);
    const location = useLocation();
    // TODO: fix this because it stopped working
    useEffect(() => {
        if (loadingHistory) return;
        const storedSessionId = sessionStorage.getItem('session_id');
        if (!storedSessionId || location.pathname !== '/regelingencheck') return;

        setLoadingHistory(true);

        const error_message: Message = {
            type: 'ai',
            text: 'Er kunnen geen berichten worden geladen, herstart de precheck.',
            sender: 'Eva',
            error: true,
        };

        precheckChatbotService
            .history()
            .then((history) => {
                if (history.length === 0) {
                    setMessages([error_message]);
                } else {
                    lastSeenSeqRef.current = Math.max(...history.map((m: ApiMessage) => m.seq ?? 0));
                    setMessages(history.map(toMessage));
                }
            })
            .catch(() => setMessages([error_message]))
            .finally(() => setLoadingHistory(false));
        //     TODO: try to find solution so disable is not necessary
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    return { loadingHistory };
}

const toMessage = (msg: ApiMessage): Message => ({
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
});
