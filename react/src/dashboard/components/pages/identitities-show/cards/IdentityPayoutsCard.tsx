import React, { useCallback, useEffect, useState } from 'react';
import Organization from '../../../../props/models/Organization';
import { PaginationData } from '../../../../props/ApiResponses';
import SponsorIdentity from '../../../../props/models/Sponsor/SponsorIdentity';
import useSetProgress from '../../../../hooks/useSetProgress';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import Card from '../../../elements/card/Card';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import usePushApiError from '../../../../hooks/usePushApiError';
import PayoutsTable from '../../payouts/elements/PayoutsTable';
import Fund from '../../../../props/models/Fund';
import PayoutTransaction from '../../../../props/models/PayoutTransaction';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import { useFundService } from '../../../../services/FundService';
import usePayoutTransactionService from '../../../../services/PayoutTransactionService';

export default function IdentityPayoutsCard({
    identity,
    organization,
}: {
    identity: SponsorIdentity;
    organization: Organization;
}) {
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const paginatorService = usePaginatorService();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const payoutTransactionService = usePayoutTransactionService();

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState<PaginationData<PayoutTransaction>>(null);

    const [paginatorTransactionsKey] = useState('payouts');

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext({
        identity_address: identity.address,
        per_page: paginatorService.getPerPage(paginatorTransactionsKey),
        order_by: 'created_at',
        order_dir: 'desc',
    });

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list(activeOrganization.id)
            .then((res) => setFunds([{ id: null, name: 'Selecteer fonds' }, ...res.data.data]))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [activeOrganization.id, fundService, setProgress, pushApiError]);

    const fetchTransactions = useCallback(
        (query = {}) => {
            setProgress(0);
            setLoading(true);

            payoutTransactionService
                .list(activeOrganization.id, { ...query })
                .then((res) => setTransactions(res.data))
                .catch(pushApiError)
                .finally(() => {
                    setProgress(100);
                    setLoading(false);
                });
        },
        [activeOrganization.id, setProgress, payoutTransactionService, pushApiError],
    );

    useEffect(() => {
        fetchTransactions(filterValuesActive);
    }, [fetchTransactions, filterValuesActive]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    if (!transactions || !funds) {
        return <LoadingCard />;
    }

    return (
        <Card title={`Uitbetalingen (${transactions?.meta?.total || 0})`} section={false}>
            <PayoutsTable
                filter={filter}
                loading={loading}
                paginatorKey={paginatorTransactionsKey}
                transactions={transactions}
                organization={organization}
                filterValues={filterValues}
                filterUpdate={filterUpdate}
                fetchTransactions={fetchTransactions}
                funds={funds}
            />
        </Card>
    );
}
