// PrecheckService.ts
// Todo: update documentation
// Mock service that simulates backend calls for the chatbot.
// Includes session initialization, message-response handling, and advice generation.
// Designed for development and testing without a real backend.

import type { BotResponse, Message } from '../props/types/PrecheckChatbotTypes';
import type { Advice } from '../props/types/PrecheckAdviceTypes';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import { ResponseSimple } from '../../dashboard/props/ApiResponses';
import { useRef, useState } from 'react';
import EventStreamService from './EventStreamService';

let currentStream: EventSource | null = null;

export class PrecheckChatbotService<T = unknown> {
    public constructor(
        protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>(),
        protected eventStream: EventStreamService = new EventStreamService(),
    ) {}

    public prefix = '/platform/pre-checks';
    public attemptsRef = useRef(0);
    public maxAttempts = 5;

    // Initializes a new session
    public async start(): Promise<void> {
        const resp = await this.apiRequest.post<ResponseSimple<{ session_id: string; stream_token: string }>>(
            `${this.prefix}/sessions`,
        );
        const id = resp.headers['x-request-id'];
        console.log(id);
        sessionStorage.setItem('session_id', resp.data.session_id);
        sessionStorage.setItem('session_token', resp.data.stream_token);
    }
    //TODO: if stream fails or needs new token, fetch new token from laravel

    // starts the chat
    public stream(
        onMessage: (response: BotResponse) => void,
        onWaiting: () => void,
        onTyping: () => void,
        onClose: () => void,
        onError?: (err: { status: number }) => void,
        forceRestart = false,
    ): { stop: () => void } {
        const sessionId = sessionStorage.getItem('session_id');
        const sessionToken = sessionStorage.getItem('session_token');

        if (currentStream && forceRestart) {
            currentStream.close();
            currentStream = null;
        }
        if (currentStream) {
            return {
                stop: () => {
                    currentStream?.close();
                    currentStream = null;
                },
            };
        }

        const stream = this.eventStream.open(
            `${this.prefix}/sessions/${sessionId}/events?token=${sessionToken}`,
            false,
        );

        stream.onopen = () => {
            console.log('✅ SSE connected');
            this.attemptsRef.current = 0; // reset attempts
        };

        let lastHeartbeat = Date.now();

        const heartbeatInterval = setInterval(() => {
            const diff = Date.now() - lastHeartbeat;
            if (diff > 60000) {
                console.warn('SSE idle >30s, close stream');
                stream.close();
                onClose();
                currentStream = null;
                clearInterval(heartbeatInterval);
                onError?.({ status: 408 });
            }
        }, 10000);

        currentStream = stream;

        stream.addEventListener('typing', onTyping);

        stream.addEventListener('closing', () => {
            stream.close();
            if (currentStream === stream) currentStream = null;
            onClose();
        });

        stream.addEventListener('done', () => {
            stream.close();
            if (currentStream === stream) currentStream = null;
            onClose();
        });

        stream.addEventListener('paused', onWaiting);

        stream.onmessage = (event) => {
            if (!event.data) {
                lastHeartbeat = Date.now();
            }
            try {
                const data = JSON.parse(event.data);
                if (data.question && data.step) {
                    onMessage({
                        seq: data.seq,
                        text: data.question,
                        sender: 'Eva',
                        options: data.answer_options,
                        step: data.step,
                        slots: data.slots,
                    });
                } else if (data.question) {
                    onMessage({
                        seq: data.seq,
                        text: data.question,
                        sender: 'Eva',
                        options: data.answer_options,
                        inputType: data.input_type,
                    });
                }
                if (data.advice && data.message) {
                    onMessage({
                        seq: data.seq,
                        text: data.message,
                        step: 'advice',
                        sender: 'Eva',
                    });
                } else if (data.message) {
                    onMessage({
                        seq: data.seq,
                        text: data.message,
                        sender: 'Eva',
                    });
                }
            } catch (error) {
                console.error('Not able to parse json:', error, event.data);
            }
        };

        stream.addEventListener('error', (event) => {
            this.attemptsRef.current += 1;
            console.warn(`SSE error (attempt ${this.attemptsRef.current})`);

            if (this.attemptsRef.current > this.maxAttempts) {
                console.error('Max reconnect attempts reached');
                stream.close();
                if (currentStream === stream) currentStream = null;
                onClose();
                return;
            }

            let text = 'Er ging iets mis. Probeer het later opnieuw of herstart de check.';
            try {
                const raw = (event as MessageEvent).data;
                const parsed = JSON.parse(raw);
                text = parsed.message ?? raw ?? text;
            } catch {
                // fallback tekst hierboven
                console.log('Could not parse error');
            }

            onMessage({
                text,
                sender: 'Eva',
                error: true,
            });
        });

        return {
            stop: () => {
                stream.close();
                clearInterval(heartbeatInterval);
                if (currentStream === stream) currentStream = null;
            },
        };
    }

    public async send(userInput: string | boolean | number | object): Promise<void> {
        const sessionId = sessionStorage.getItem('session_id');
        const key = crypto?.randomUUID?.() ?? String(Date.now()) + Math.random();
        try {
            await this.apiRequest.post<ResponseSimple<{ status?: string }>>(
                `${this.prefix}/sessions/${sessionId}/messages`,
                { response: userInput },
                { headers: { 'Idempotency-Key': key } },
            );
        } catch (e) {
            const status = e?.response?.status ?? e?.status;
            if (status === 202) return;
            throw e;
        }
    }

    public async end(): Promise<void> {
        const sessionId = sessionStorage.getItem('session_id');
        await this.apiRequest.delete(`${this.prefix}/sessions/${sessionId}`, {});
    }

    public async history(): Promise<Message[]> {
        const sessionId = sessionStorage.getItem('session_id');

        const resp = await this.apiRequest.get<ResponseSimple<{ messages: Message[] }>>(
            `${this.prefix}/sessions/${sessionId}/messages`,
            {},
        );
        return resp.data?.messages ?? [];
    }

    public async advice(): Promise<Advice[]> {
        const sessionId = sessionStorage.getItem('session_id');

        const resp = await this.apiRequest.get<ResponseSimple<{ advice: Advice[] }>>(
            `${this.prefix}/sessions/${sessionId}/advice`,
            {},
        );
        return resp.data?.advice ?? [];
    }
}

export function usePrecheckChatbotService(): PrecheckChatbotService {
    return useState(new PrecheckChatbotService())[0];
}
