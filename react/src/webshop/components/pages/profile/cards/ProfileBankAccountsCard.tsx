import React, { useCallback } from 'react';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import BlockKeyValueList from '../../../elements/block-key-value-list/BlockKeyValueList';
import { ProfileBankAccount } from '../../../../../dashboard/props/models/Sponsor/SponsorIdentity';
import { WebshopRoutes } from '../../../../modules/state_router/RouterBuilder';
import StateNavLink from '../../../../modules/state_router/StateNavLink';

export default function ProfileBankAccountsCard({ bankAccounts }: { bankAccounts: Array<ProfileBankAccount> }) {
    const translate = useTranslate();

    const renderBankAccountSource = useCallback((bank_account: ProfileBankAccount) => {
        const label = bank_account.type_id
            ? `${bank_account.created_by_locale} #${bank_account.type_id}`
            : bank_account.created_by_locale;

        if (!bank_account.type_id || bank_account.type === 'profile_bank_account') {
            return label;
        }

        if (bank_account.type === 'fund_request') {
            return (
                <StateNavLink name={WebshopRoutes.FUND_REQUEST_SHOW} params={{ id: bank_account.type_id }}>
                    {label}
                </StateNavLink>
            );
        }

        if (bank_account.type === 'reimbursement') {
            return (
                <StateNavLink name={WebshopRoutes.REIMBURSEMENT} params={{ id: bank_account.type_id }}>
                    {label}
                </StateNavLink>
            );
        }

        if (bank_account.type === 'payout') {
            return <StateNavLink name={WebshopRoutes.PAYOUTS}>{label}</StateNavLink>;
        }

        return label;
    }, []);

    if (!bankAccounts?.length) {
        return null;
    }

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">{translate('profile.bank_accounts.title')}</h2>
            </div>
            <div className="card-section">
                <div className="flex flex-vertical flex-gap">
                    {bankAccounts.map((bank_account, index) => {
                        const items = [
                            {
                                label: translate('profile.bank_accounts.iban'),
                                value: bank_account.iban,
                            },
                            {
                                label: translate('profile.bank_accounts.name'),
                                value: bank_account.name,
                            },
                            ...(bank_account.type !== 'profile_bank_account'
                                ? [
                                      {
                                          label: translate('profile.bank_accounts.source'),
                                          value: renderBankAccountSource(bank_account),
                                      },
                                  ]
                                : []),
                        ];

                        return (
                            <div className="card-section-pane" key={index}>
                                <BlockKeyValueList items={items} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
