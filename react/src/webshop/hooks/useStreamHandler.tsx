// useStreamHandler.ts
import { MutableRefObject, useCallback, useRef, useState } from 'react';
import type { BotResponse } from '../props/types/PrecheckChatbotTypes';
import { PrecheckChatbotService } from '../services/PrecheckChatbotService';
import { parseProblemJson } from './useParseProblemJson';

export function useStreamHandler(
    precheckChatbotService: PrecheckChatbotService,
    lastSeenSeqRef: MutableRefObject<number>,
    { onResponse, onWaiting, onTyping, onClosed, onError },
) {
    const [isLoadingStream, setIsLoadingStream] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const [incomingQueue, setIncomingQueue] = useState<BotResponse[]>([]);
    const stopStreamRef = useRef<(() => void) | null>(null);
    const streamStarted = useRef(false);

    const startStream = useCallback(
        async (restart: boolean = false) => {
            if (restart) {
                stopStreamRef.current?.();
                streamStarted.current = false;
            }
            if (streamStarted.current) return;

            setIsLoadingStream(true);

            const storedSessionId = sessionStorage.getItem('session_id');
            if (!storedSessionId) {
                try {
                    await precheckChatbotService.start();
                } catch (e) {
                    onError?.(e);
                    setIsLoadingStream(false);
                    return;
                }
            }

            const { stop } = await precheckChatbotService.stream(
                (response) => {
                    if (!response.seq) return;

                    if (response.seq <= lastSeenSeqRef.current) return;

                    lastSeenSeqRef.current = response.seq;
                    setIncomingQueue((prev) => [...prev, response]);
                    onResponse?.(response);
                    setIsLoadingStream(false);
                    streamStarted.current = true;
                },
                () => onWaiting?.(),
                () => onTyping?.(),
                () => {
                    setIsClosed(true);
                    streamStarted.current = false;
                    onClosed?.();
                },
                (error) => {
                    const problem = parseProblemJson(error);
                    if (problem.status === 401) {
                        try {
                            precheckChatbotService.refreshToken();
                            console.log('Token refreshed after 401');
                        } catch (e) {
                            console.error('Token refresh failed', e);
                        }
                    }
                    onError?.(problem);
                    setIsLoadingStream(false);
                    streamStarted.current = true;
                    stopStreamRef.current?.();
                },
                restart,
                lastSeenSeqRef.current ?? 0,
            );
            stopStreamRef.current = stop;
        },
        [], // eslint-disable-line react-hooks/exhaustive-deps
    );

    const resetStream = useCallback(() => {
        streamStarted.current = false;
        setIsClosed(false);
        sessionStorage.removeItem('session_id');
        sessionStorage.removeItem('advice');
    }, []);

    const stopStream = useCallback(() => {
        stopStreamRef.current?.();
        streamStarted.current = false;
        setIsClosed(true);
    }, []);

    return {
        startStream,
        stopStream,
        isLoadingStream,
        isClosed,
        incomingQueue,
        setIncomingQueue,
        resetStream, // geef door zodat provider of queuehook hem kan legen
    };
}
