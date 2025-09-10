// PrecheckService.ts
// Todo: update documentation
// Mock service that simulates backend calls for the chatbot.
// Includes session initialization, message-response handling, and advice generation.
// Designed for development and testing without a real backend.

import type { BotResponse, Message } from '../props/types/PrecheckChatbotTypes';
import type { Advice } from '../props/types/PrecheckAdviceTypes';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import { ResponseSimple } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import EventStreamService from './EventStreamService';

let currentStream: EventSource | null = null;

export class PrecheckChatbotService<T = unknown> {
    public constructor(
        protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>(),
        protected eventStream: EventStreamService = new EventStreamService(),
    ) {}

    public prefix = '/platform/pre-checks';

    // Initializes a new session
    public async start(): Promise<void> {
        const resp = await this.apiRequest.post<ResponseSimple<{ session_id: string; session_token: string }>>(
            `${this.prefix}/sessions`,
        );
        sessionStorage.setItem('session_id', resp.data.session_id);
    }

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

        const stream = this.eventStream.open(`${this.prefix}/sessions/${sessionId}/events`, false);

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
            try {
                const data = JSON.parse(event.data);
                if (data.question && data.step) {
                    onMessage({
                        text: data.question,
                        sender: 'Eva',
                        options: data.answer_options,
                        step: data.step,
                        slots: data.slots,
                    });
                } else if (data.question) {
                    onMessage({
                        text: data.question,
                        sender: 'Eva',
                        options: data.answer_options,
                        inputType: data.input_type,
                    });
                }
                if (data.advice && data.message) {
                    onMessage({
                        text: data.message,
                        step: 'advice',
                        sender: 'Eva',
                    });
                } else if (data.message) {
                    onMessage({
                        text: data.message,
                        sender: 'Eva',
                    });
                }
            } catch (error) {
                console.error('Not able to parse json:', error, event.data);
            }
        };

        stream.addEventListener('error', (event) => {
            try {
                const raw = (event as MessageEvent).data;
                const parsed = JSON.parse(raw);
                onMessage({
                    text:
                        parsed.message ??
                        raw ??
                        'Er is een fout opgetreden, probeer het later opnieuw of herstart de check.',
                    sender: 'Eva',
                    error: true,
                });
            } catch {
                onMessage({
                    text: 'Er is een fout opgetreden. Controleer je verbinding of probeer het later opnieuw.',
                    sender: 'Eva',
                    error: true,
                });
            }

            if (currentStream) {
                currentStream.close();
                onClose();
                currentStream = null;
            }
            onError?.({ status: 500 });
        });

        stream.onerror = (err) => {
            console.error('SSE stream error:', err);
            onMessage({
                text: 'Er ging iets mis. Probeer het later opnieuw of herstart de check.',
                sender: 'Eva',
                error: true,
            });
            if (currentStream) {
                currentStream.close();
                onClose();
                currentStream = null;
            }
            onError?.({ status: 204 });
        };

        return {
            stop: () => {
                stream.close();
                if (currentStream === stream) currentStream = null;
            },
        };
    }

    // Simulates sending user input to the backend and returns a conditional bot response
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
    // if (resp.status === 202 && resp.data?.status === 'resume_required') return 'resume';

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
