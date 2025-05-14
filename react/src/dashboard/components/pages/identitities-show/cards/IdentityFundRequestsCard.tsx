import React, { useCallback, useEffect, useState } from 'react';
import Organization from '../../../../props/models/Organization';
import { PaginationData } from '../../../../props/ApiResponses';
import SponsorIdentity from '../../../../props/models/Sponsor/SponsorIdentity';
import useSetProgress from '../../../../hooks/useSetProgress';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import Card from '../../../elements/card/Card';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import FundRequestsTable from '../../fund-requests/elements/FundRequestsTable';
import FundRequest from '../../../../props/models/FundRequest';
import { FundRequestTotals, useFundRequestValidatorService } from '../../../../services/FundRequestValidatorService';
import usePushApiError from '../../../../hooks/usePushApiError';

export default function IdentityFundRequestsCard({
    organization,
    identity,
}: {
    organization: Organization;
    identity: SponsorIdentity;
}) {
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const fundRequestService = useFundRequestValidatorService();

    const [loading, setLoading] = useState<boolean>(false);
    const [fundRequests, setFundRequests] = useState<PaginationData<FundRequest, { totals: FundRequestTotals }>>(null);
    const [paginatorKey] = useState('fund_requests');

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext({
        order_by: 'created_at',
        order_dir: 'desc',
        per_page: 10,
        identity_id: identity.id,
    });

    const fetchFundRequests = useCallback(() => {
        setProgress(0);
        setLoading(true);

        fundRequestService
            .index(organization.id, filterValuesActive)
            .then((res) => setFundRequests(res.data))
            .catch(pushApiError)
            .finally(() => {
                setProgress(100);
                setLoading(false);
            });
    }, [setProgress, fundRequestService, organization.id, filterValuesActive, pushApiError]);

    useEffect(() => {
        fetchFundRequests();
    }, [fetchFundRequests]);

    if (!fundRequests) {
        return <LoadingCard />;
    }

    return (
        <Card title={`Aanvragen (${fundRequests?.meta?.total || 0})`} section={false} dusk="fundRequestsPageContent">
            <FundRequestsTable
                filter={filter}
                loading={loading}
                paginatorKey={paginatorKey}
                organization={organization}
                fundRequests={fundRequests}
                filterUpdate={filterUpdate}
                filterValues={filterValues}
            />
        </Card>
    );
}
