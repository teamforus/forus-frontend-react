// PrecheckPage.tsx
// Main page for the chatbot interaction.
// Contains the ChatbotInterface and a header button to return to the start page.

import React from 'react';
// import { useGoToPage } from '../hooks/useGoToPage.tsx';
import ChatbotInterface from './elements/ChatbotInterface';
// import StateNavLink from "../../../modules/state_router/StateNavLink";
export default function FundsPrecheckPage() {
    // const goToPage = useGoToPage('');

    return (
        <div className="flex justify-center h-screen w-full p-4 sm:p-8 bg-gray-100">
            <main className="flex flex-col w-full lg:w-3/4 2xl:w-1/2 bg-red-200 rounded-lg p-2">
                {/*<StateNavLink name={}*/}
                {/*<button className="block-title" onClick={goToPage}>*/}
                {/*    Regelingencheck*/}
                {/*</button>*/}
                <ChatbotInterface />
            </main>
        </div>
    );
}
