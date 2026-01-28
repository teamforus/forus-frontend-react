import { useEffect, useMemo, useState } from 'react';
import useTranslate from './useTranslate';
import usePushApiError from './usePushApiError';
import useSetProgress from './useSetProgress';
import usePayoutTransactionService from '../services/PayoutTransactionService';
import PayoutBankAccount from '../props/models/PayoutBankAccount';

export type BankAccountSource = 'manual' | 'fund_request' | 'profile_bank_account' | 'reimbursement' | 'payout';

export type PayoutBankAccountOption = {
    id: number | null;
    iban?: string;
    iban_name?: string;
    label: string;
};

type UsePayoutBankAccountsParams = {
    organizationId?: number;
    fundId?: number;
    identityId?: number;
    identityRequired?: boolean;
    bankAccountSource?: BankAccountSource;
    enabled?: boolean;
    placeholderLabel: string;
};

export default function usePayoutBankAccounts({
    organizationId,
    fundId,
    identityId,
    identityRequired = false,
    bankAccountSource,
    enabled = true,
    placeholderLabel,
}: UsePayoutBankAccountsParams) {
    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const setProgress = useSetProgress();
    const payoutTransactionService = usePayoutTransactionService();

    const [bankAccounts, setBankAccounts] = useState<Array<PayoutBankAccount> | null>(null);
    const [bankAccountsLoading, setBankAccountsLoading] = useState(false);

    const bankAccountOptions = useMemo((): Array<PayoutBankAccountOption> => {
        const getTypeLabel = (type?: string): string => {
            switch (type) {
                case 'fund_request':
                    return 'Aanvraag';
                case 'profile_bank_account':
                    return 'Handmatig';
                case 'reimbursement':
                    return 'Declaratie';
                case 'payout':
                    return 'Uitbetaling';
                default:
                    return '';
            }
        };

        const options = (bankAccounts || []).map((bankAccount) => {
            const typeLabel = getTypeLabel(bankAccount.type);
            const accountId = bankAccount.type_id || bankAccount.id;
            const typePrefix = typeLabel ? `${typeLabel} #${accountId}` : `#${accountId}`;

            return {
                id: accountId,
                iban: bankAccount.iban,
                iban_name: bankAccount.iban_name,
                label: `${typePrefix} - ${bankAccount.iban} / ${bankAccount.iban_name}`,
            };
        });

        return [
            {
                id: null,
                label:
                    placeholderLabel || translate('modals.modal_payout_create.options.bank_account_select_placeholder'),
            },
            ...options,
        ];
    }, [bankAccounts, placeholderLabel, translate]);

    useEffect(() => {
        if (identityRequired && !identityId) {
            setBankAccounts([]);
            setBankAccountsLoading(false);
            return;
        }

        if (!enabled || !organizationId || !fundId || bankAccountSource === 'manual' || !bankAccountSource) {
            setBankAccounts(null);
            setBankAccountsLoading(false);
            return;
        }

        let canceled = false;

        const fetchBankAccounts = async () => {
            setProgress(0);
            setBankAccountsLoading(true);

            const collected: Array<PayoutBankAccount> = [];
            let page = 1;
            let lastPage = 1;

            try {
                do {
                    const res = await payoutTransactionService.bankAccounts(organizationId, {
                        page,
                        per_page: 1000,
                        type: bankAccountSource,
                        identity_id: identityId,
                    });

                    collected.push(...(res.data?.data || []));
                    lastPage = res.data?.meta?.last_page || page;
                    page += 1;
                } while (!canceled && page <= lastPage);

                if (!canceled) {
                    setBankAccounts(collected);
                }
            } catch (err) {
                if (!canceled) {
                    setBankAccounts([]);
                    pushApiError(err);
                }
            } finally {
                if (!canceled) {
                    setBankAccountsLoading(false);
                    setProgress(100);
                }
            }
        };

        fetchBankAccounts().then();

        return () => {
            canceled = true;
        };
    }, [
        bankAccountSource,
        enabled,
        fundId,
        identityId,
        identityRequired,
        organizationId,
        payoutTransactionService,
        pushApiError,
        setProgress,
    ]);

    return { bankAccounts, bankAccountsLoading, bankAccountOptions };
}
