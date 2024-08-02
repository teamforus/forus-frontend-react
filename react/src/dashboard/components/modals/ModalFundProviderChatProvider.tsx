import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useEnvData from '../../hooks/useEnvData';
import useProductChatService from '../../services/ProductChatService';
import Organization from '../../props/models/Organization';
import Product from '../../props/models/Product';
import FundProviderChat from '../../props/models/FundProviderChat';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormError from '../elements/forms/errors/FormError';
import { groupBy } from 'lodash';
import FundProviderChatMessage from '../../props/models/FundProviderChatMessage';
import classNames from 'classnames';

export default function ModalFundProviderChatProvider({
    modal,
    className,
    chat,
    product,
    providerOrganization,
    sponsorOrganization,
    onClose,
}: {
    modal: ModalState;
    className?: string;
    chat: FundProviderChat;
    product: Product;
    providerOrganization: Organization;
    sponsorOrganization: Organization;
    onClose: () => void;
}) {
    const [updateInterval] = useState(10000);
    const envData = useEnvData();
    const panelType = envData.client_type;
    const productChatService = useProductChatService();

    const [messages, setMessages] = useState(null);

    const [timeoutValue, setTimeoutValue] = useState(null);
    const [intervalValue, setIntervalValue] = useState(null);

    const chatRootRef = useRef<HTMLDivElement>(null);

    const scrollTheChat = (forceScroll: boolean) => {
        const chatRoot = chatRootRef.current;
        const lastMessage: HTMLElement = chatRoot.querySelector('.chat-interval:last-child .chat-message:last-child');
        const threshold = lastMessage ? lastMessage.offsetHeight + 25 : 0;

        const fullHeight = chatRoot.scrollTop + chatRoot.clientHeight;
        const autoScrollThreshold = chatRoot.scrollHeight - threshold;

        if (forceScroll || fullHeight >= autoScrollThreshold) {
            chatRoot.scrollTo({
                top: chatRoot.scrollHeight,
                behavior: 'auto',
            });
        }
    };

    const loadMessages = useCallback(
        (forceScroll) => {
            productChatService
                .listMessages(providerOrganization.id, product.id, chat.id, {
                    per_page: 100,
                })
                .then((res) => {
                    setMessages(Object.values(groupBy(res.data.data, 'date')));
                    setTimeoutValue(setTimeout(() => scrollTheChat(forceScroll), 50));
                }, console.error);
        },
        [chat.id, product.id, productChatService, providerOrganization.id],
    );

    const form = useFormBuilder(
        {
            message: '',
        },
        (values) => {
            productChatService
                .storeMessage(providerOrganization.id, product.id, chat.id, values)
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

    const closeModal = useCallback(() => {
        modal.close();
        clearInterval(intervalValue);
        clearTimeout(timeoutValue);
        onClose();
    }, [intervalValue, onClose, timeoutValue, modal]);

    useEffect(() => {
        loadMessages(true);
        setIntervalValue(setInterval(() => loadMessages(false), updateInterval));
    }, [loadMessages, updateInterval]);

    return (
        <div className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading', className)}>
            <div className="modal-backdrop" onClick={closeModal} />
            <form className="modal-window form" onSubmit={form.submit}>
                <div className="modal-close mdi mdi-close" onClick={closeModal} />
                <div className="modal-header">Chat met {sponsorOrganization.name}</div>
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
                                                className={`chat-message ${
                                                    'chat-message-' +
                                                    (message.counterpart == 'system'
                                                        ? 'system'
                                                        : panelType != message.counterpart
                                                          ? 'in'
                                                          : 'out')
                                                }`}>
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
                    <button type={'button'} className="button button-default button-sm" onClick={() => closeModal()}>
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
