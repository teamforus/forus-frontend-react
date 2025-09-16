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
import { ProblemJson } from '../hooks/useParseProblemJson';

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

        const claims = this.parseJwt(resp.data.stream_token);
        if (claims.exp) {
            sessionStorage.setItem('session_token_exp', String(claims.exp));
        }
    }

    // starts the chat
    public async stream(
        onMessage: (response: BotResponse) => void,
        onWaiting: () => void,
        onTyping: () => void,
        onClose: () => void,
        onError?: (err: ProblemJson) => void,
        forceRestart = false,
        lastEventId: number = 0,
    ): Promise<{ stop: () => void }> {
        const sessionId = sessionStorage.getItem('session_id');
        let sessionToken = sessionStorage.getItem('session_token');

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

        if (!sessionToken || this.isTokenExpired()) {
            console.log('stream token expired');
            sessionToken = await this.refreshToken();
        }

        const stream = this.eventStream.open(
            `${this.prefix}/sessions/${sessionId}/events?token=${sessionToken}&lastEventId=${lastEventId}`,
            false,
        );

        stream.onopen = () => {
            console.log('✅ SSE connected');
            this.attemptsRef.current = 0; // reset attempts
        };
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
                console.debug('🔄 keep-alive');
                return;
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
            let text = 'Er ging iets mis. Probeer het later opnieuw of herstart de check.';
            onMessage({
                text,
                sender: 'Eva',
                error: true,
            });

            this.attemptsRef.current += 1;
            console.warn(`SSE error (attempt ${this.attemptsRef.current})`);
            if (this.attemptsRef.current > this.maxAttempts) {
                console.error('Max reconnect attempts reached');
                stream.close();
                if (currentStream === stream) currentStream = null;
                onClose();
                onError?.({
                    title: 'Verbinding verbroken',
                    detail: 'Maximaal aantal pogingen om opnieuw te verbinden bereikt.',
                    status: 500,
                });
                return;
            }
            let status = 500;
            try {
                const raw = (event as MessageEvent).data;
                const parsed = JSON.parse(raw);
                text = parsed.message ?? parsed.content ?? raw ?? text;
                status = parsed.status ?? 500;
            } catch {
                // fallback tekst hierboven
                console.log('Could not parse error');
            }

            onError?.({
                title: 'Streamfout',
                detail: text,
                status: status,
            });
        });

        return {
            stop: () => {
                stream.close();
                if (currentStream === stream) currentStream = null;
            },
        };
    }

    public async send(userInput: string | boolean | number | object): Promise<'resume' | undefined> {
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
            const data = e?.response?.data ?? e?.data;
            if (status === 202 && data?.status === 'resume_required') {
                return 'resume';
            }
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

    public async refreshToken(): Promise<string> {
        const sessionId = sessionStorage.getItem('session_id');
        if (!sessionId) throw new Error('No session');

        const resp = await this.apiRequest.post<ResponseSimple<{ stream_token: string }>>(
            `${this.prefix}/sessions/${sessionId}/token`,
        );

        const token = resp.data.stream_token;
        sessionStorage.setItem('session_token', token);

        const claims = this.parseJwt(token);
        if (claims.exp) {
            sessionStorage.setItem('session_token_exp', String(claims.exp));
        }
        return token;
    }

    private parseJwt(token: string): { exp?: number } {
        try {
            const base64 = token.split('.')[1];
            return JSON.parse(atob(base64));
        } catch {
            return {};
        }
    }

    private isTokenExpired(): boolean {
        const exp = Number(sessionStorage.getItem('session_token_exp'));
        if (!exp) return true;
        const now = Math.floor(Date.now() / 1000); // seconden
        return now >= exp;
    }
}

export function usePrecheckChatbotService(): PrecheckChatbotService {
    return useState(new PrecheckChatbotService())[0];
}
