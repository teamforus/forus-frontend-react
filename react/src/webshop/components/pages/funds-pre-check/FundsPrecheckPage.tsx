// PrecheckPage.tsx
// Main page for the chatbot interaction.
// Contains the ChatbotInterface and a header button to return to the start page.

import React from 'react';
import ChatbotInterface from './elements/ChatbotInterface';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import Section from '../../elements/sections/Section';

export default function FundsPrecheckPage() {
    const translate = useTranslate();

    return (
        <BlockShowcase
            breadcrumbItems={[{ name: translate('products.breadcrumbs.home'), state: 'home' }, { name: 'Chatbot' }]}>
            <Section type={`pre-check`}>
                <div className="block block-fund-pre-check-chatbot">
                    <h1 className="block-title">Regelingencheck</h1>
                    <ChatbotInterface />
                </div>
            </Section>
        </BlockShowcase>
    );
}
