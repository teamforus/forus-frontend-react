import { useCallback } from 'react';
import useConfirmBankConnectionAction from './useConfirmBankConnectionAction';

export default function useConfirmBankNewConnection() {
    const confirmBankConnectionAction = useConfirmBankConnectionAction();

    return useCallback(() => {
        return confirmBankConnectionAction(
            'U heeft al een actieve verbinding met uw bank',
            [
                'U staat op het punt om opnieuw toestemming te geven en daarmee de verbinding opnieuw tot stand te brengen.',
                'Weet u zeker dat u verder wilt gaan?',
            ].join('\n'),
        );
    }, [confirmBankConnectionAction]);
}
