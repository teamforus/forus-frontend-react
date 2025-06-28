import React, { useCallback } from 'react';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import Organization from '../../../../props/models/Organization';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalFundProviderChatSponsor from '../../../modals/ModalFundProviderChatSponsor';
import ModalFundProviderChatMessage from '../../../modals/ModalFundProviderChatMessage';
import FundProviderChat from '../../../../props/models/FundProviderChat';
import FundProvider from '../../../../props/models/FundProvider';
import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';
import Fund from '../../../../props/models/Fund';

export default function useProductChat(fund: Fund, fundProvider: FundProvider, organization: Organization) {
    const openModal = useOpenModal();
    const pushSuccess = usePushSuccess();

    const openProductChat = useCallback(
        (fundProviderProductChat: FundProviderChat, onClosed: () => void) => {
            openModal(
                (modal) => (
                    <ModalFundProviderChatSponsor
                        modal={modal}
                        fund={fund}
                        chat={fundProviderProductChat}
                        organization={organization}
                        fundProvider={fundProvider}
                    />
                ),
                { onClosed },
            );
        },
        [organization, fund, fundProvider, openModal],
    );

    const makeProductChat = useCallback(
        (product: SponsorProduct, onClosed: () => void) => {
            openModal((modal) => (
                <ModalFundProviderChatMessage
                    modal={modal}
                    product={product}
                    fund={fund}
                    fundProvider={fundProvider}
                    organization={organization}
                    onSubmit={() => {
                        pushSuccess('Opgeslagen!');
                        onClosed();
                    }}
                />
            ));
        },
        [organization, fund, fundProvider, openModal, pushSuccess],
    );

    return {
        openProductChat: openProductChat,
        makeProductChat: makeProductChat,
    };
}
