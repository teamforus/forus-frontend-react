import { useCallback, useEffect, useMemo, useState } from 'react';
import { useProfileService } from '../../dashboard/services/ProfileService';
import { ProfileBankAccount } from '../../dashboard/props/models/Sponsor/SponsorIdentity';
import useAuthIdentity from './useAuthIdentity';

export default function useFundRequestBankAccounts() {
    const profileService = useProfileService();
    const authIdentity = useAuthIdentity();
    const [bankAccounts, setBankAccounts] = useState<Array<ProfileBankAccount>>(null);

    const fetchProfile = useCallback(() => {
        profileService
            .profile()
            .then((res) => setBankAccounts(res.data?.bank_accounts || []))
            .catch(() => setBankAccounts([]));
    }, [profileService]);

    useEffect(() => {
        if (!authIdentity?.profile) {
            setBankAccounts([]);
            return;
        }

        fetchProfile();
    }, [authIdentity?.profile, fetchProfile]);

    const fundRequestAccounts = useMemo(() => {
        return (bankAccounts || []).filter((account) => account.type === 'fund_request');
    }, [bankAccounts]);

    return { bankAccounts, fundRequestAccounts };
}
