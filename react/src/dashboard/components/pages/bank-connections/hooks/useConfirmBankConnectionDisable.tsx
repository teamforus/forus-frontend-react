import { useCallback } from 'react';
import useConfirmBankConnectionAction from './useConfirmBankConnectionAction';

export default function useConfirmBankConnectionDisable() {
    const confirmBankConnectionAction = useConfirmBankConnectionAction();

    return useCallback(() => {
        return confirmBankConnectionAction(
            'Verbinding met uw bank stopzetten',
            [
                'U staat op het punt om de verbinding vanuit Forus met uw bank stop te zetten. Hierdoor stopt Forus met het uitlezen van de rekeninginformatie en het initiëren van transacties.',
                'Weet u zeker dat u verder wilt gaan?',
            ].join('\n'),
        );
    }, [confirmBankConnectionAction]);
}
