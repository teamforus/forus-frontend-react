// PrecheckService.ts
// Todo: update documentation
// Mock service that simulates backend calls for the chatbot.
// Includes session initialization, message-response handling, and advice generation.
// Designed for development and testing without a real backend.

import type { BotResponse, Message } from '../props/types/PrecheckChatbotTypes';
import type { Advice } from '../props/types/PrecheckAdviceTypes';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import { ResponseSimple } from '../../dashboard/props/ApiResponses';

let currentStream: EventSource | null = null;

export class PrecheckService<T = unknown> {
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    public prefix = '/platform/pre-checks';

    // Initializes a new session
    public async start(): Promise<{ sessionId?: string }> {
        const sessionId = crypto.randomUUID();
        await this.apiRequest.get(`${this.prefix}/start`);
        return { sessionId: sessionId };
    }

    // starts the chat
    public stream(
        onMessage: (response: BotResponse) => void,
        onTyping: () => void,
        onClose: () => void,
        onError?: (err: { status: number }) => void,
        forceRestart = false,
    ): { stop: () => void } {
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

        const stream = new EventSource(`${this.prefix}/chat/stream`, { withCredentials: true });

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

        stream.addEventListener('paused', () => {
            console.info('Stream paused – waiting for user input.');
            stream.close();
            if (currentStream === stream) currentStream = null;
            onClose();
        });

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
    public async send(userInput: string | boolean | number | object): Promise<'resume' | undefined> {
        const resp = await this.apiRequest.post<ResponseSimple<{ status?: string }>>(`${this.prefix}/chat/answer`, {
            response: userInput,
        });
        if (resp.status === 202 && resp.data?.status === 'resume_required') {
            return 'resume';
        }
    }

    public async end(): Promise<void> {
        await this.apiRequest.post(`${this.prefix}/end`, {});
    }

    public async history(): Promise<Message[]> {
        const resp = await this.apiRequest.post<ResponseSimple<{ messages: Message[] }>>(
            `${this.prefix}/chat/history`,
            {},
        );
        return resp.data?.messages ?? [];
    }

    public async advice(): Promise<Advice[]> {
        const resp = await this.apiRequest.post<ResponseSimple<{ advice: Advice[] }>>(`${this.prefix}/advice`, {});
        return resp.data?.advice ?? [];
    }
}
