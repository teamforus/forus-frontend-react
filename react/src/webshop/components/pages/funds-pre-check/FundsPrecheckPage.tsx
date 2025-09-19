// PrecheckPage.tsx
// Main page for the chatbot interaction.
// Contains the ChatbotInterface and a header button to return to the start page.

import React from 'react';
// import { useGoToPage } from '../hooks/useGoToPage.tsx';
import ChatbotInterface from './elements/ChatbotInterface';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import Section from '../../elements/sections/Section';
// import StateNavLink from "../../../modules/state_router/StateNavLink";
export default function FundsPrecheckPage() {
    // const goToPage = useGoToPage('');
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
    // <div className="showcase-layout flex justify-center h-screen w-full p-4 sm:p-8 bg-gray-100">
    {
        /*<main className="flex flex-col w-full lg:w-3/4 2xl:w-1/2 bg-red-200 rounded-lg p-2">*/
    }
    {
        /*<StateNavLink name={}*/
    }
    {
        /*<button className="block-title" onClick={goToPage}>*/
    }
    {
        /*    Regelingencheck*/
    }
    {
        /*</button>*/
    }
    {
        /*<ChatbotInterface />*/
    }
    {
        /*</main>*/
    }
    {
        /*</div>*/
    }
    // );
}
