import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useEnvData from '../../hooks/useEnvData';
import Organization from '../../props/models/Organization';
import FundProviderChat from '../../props/models/FundProviderChat';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormError from '../elements/forms/errors/FormError';
import { groupBy } from 'lodash';
import FundProviderChatMessage from '../../props/models/FundProviderChatMessage';
import Fund from '../../props/models/Fund';
import FundProvider from '../../props/models/FundProvider';
import useFundProviderChatService from '../../services/FundProviderChatService';
import useSetProgress from '../../hooks/useSetProgress';
import usePushApiError from '../../hooks/usePushApiError';

export default function ModalFundProviderChatSponsor({
    modal,
    chat,
    fund,
    className,
    organization,
    fundProvider,
}: {
    modal: ModalState;
    chat: FundProviderChat;
    fund: Fund;
    className?: string;
    organization: Organization;
    fundProvider: FundProvider;
}) {
    const envData = useEnvData();

    const pushApiError = usePushApiError();
    const setProgress = useSetProgress();

    const fundProviderChatService = useFundProviderChatService();

    const [updateInterval] = useState(10000);
    const [messages, setMessages] = useState(null);
    const [timeoutValue, setTimeoutValue] = useState(null);

    const chatRootRef = useRef<HTMLDivElement>(null);

    const scrollTheChat = (forceScroll: boolean) => {
        const chatRoot = chatRootRef.current;
        const lastMessage: HTMLElement = chatRoot.querySelector('.chat-interval:last-child .chat-message:last-child');
        const threshold = lastMessage ? lastMessage.offsetHeight + 25 : 0;

        const fullHeight = chatRoot.scrollTop + chatRoot.clientHeight;
        const autoScrollThreshold = chatRoot.scrollHeight - threshold;

        if (forceScroll || fullHeight >= autoScrollThreshold) {
            chatRoot.scrollTo({ top: chatRoot.scrollHeight, behavior: 'auto' });
        }
    };

    const loadMessages = useCallback(
        (forceScroll: boolean) => {
            setProgress(0);

            fundProviderChatService
                .listMessages(organization.id, fund.id, fundProvider.id, chat.id, {
                    per_page: 100,
                })
                .then((res) => {
                    setMessages(Object.values(groupBy(res.data.data, 'date')));
                    setTimeoutValue(setTimeout(() => scrollTheChat(forceScroll), 50));
                })
                .catch(pushApiError)
                .finally(() => setProgress(100));
        },
        [fundProviderChatService, organization.id, fund.id, fundProvider.id, chat.id, setProgress, pushApiError],
    );

    const form = useFormBuilder(
        {
            message: '',
        },
        (values) => {
            fundProviderChatService
                .storeMessage(organization.id, fund.id, fundProvider.id, chat.id, values)
                .then(() => {
                    form.reset();
                    loadMessages(true);
                })
                .catch((err) => {
                    form.setErrors(err.data.errors);
                    form.setIsLocked(false);
                });
        },
    );

    useEffect(() => {
        return () => {
            if (timeoutValue) {
                window.clearTimeout(timeoutValue);
            }
        };
    }, [timeoutValue]);

    useEffect(() => {
        loadMessages(true);

        const interval = window.setInterval(() => {
            loadMessages(false);
        }, updateInterval);

        return () => {
            if (interval) {
                window.clearInterval(interval);
            }
        };
    }, [loadMessages, updateInterval]);

    return (
        <div className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading', className)}>
            <div className="modal-backdrop" onClick={modal.close} />
            <form className="modal-window form" onSubmit={form.submit}>
                <div className="modal-close mdi mdi-close" onClick={modal.close} />
                <div className="modal-header">Chat met {fundProvider.organization.name}</div>
                <div className="modal-body form">
                    <div className="modal-section modal-section-light modal-section-sm">
                        <div className="block block-chat">
                            <div className="chat-wrapper" ref={chatRootRef}>
                                {messages?.map((messages: Array<FundProviderChatMessage>, index: number) => (
                                    <div className="chat-interval" key={index}>
                                        <div className="chat-timeline">
                                            <div className="chat-timeline-value">{messages?.[0]?.date}</div>
                                        </div>

                                        {messages?.map((message) => (
                                            <div
                                                key={message.id}
                                                className={classNames(
                                                    'chat-message',
                                                    message.counterpart == 'system' && 'chat-message-system',
                                                    message.counterpart != 'system' &&
                                                        envData.client_type != message.counterpart &&
                                                        'chat-message-in',
                                                    message.counterpart != 'system' &&
                                                        envData.client_type == message.counterpart &&
                                                        'chat-message-out',
                                                )}>
                                                <div className="chat-message-time">
                                                    {message.time}
                                                    {message.counterpart == 'system' ? ' - Systeembericht' : ''}
                                                </div>
                                                <div className="chat-message-text">{message.message}</div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="modal-section modal-section-light modal-section-sm">
                        <textarea
                            className="r-n form-control"
                            placeholder="Bericht"
                            value={form.values.message}
                            onChange={(e) => form.update({ message: e.target.value })}
                        />
                        <FormError error={form.errors.message} />
                    </div>
                </div>
                <div className="modal-footer text-center">
                    <button type={'button'} className="button button-default button-sm" onClick={modal.close}>
                        Annuleer
                    </button>
                    <button type={'submit'} className="button button-primary button-sm">
                        Bevestigen
                    </button>
                </div>
            </form>
        </div>
    );
}
