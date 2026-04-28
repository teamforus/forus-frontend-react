import React, { useCallback, useEffect, useState } from 'react';
import Organization from '../../../../props/models/Organization';
import { PaginationData } from '../../../../props/ApiResponses';
import SponsorIdentity from '../../../../props/models/Sponsor/SponsorIdentity';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import Card from '../../../elements/card/Card';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import ReimbursementsTable from '../../reimbursements/elements/ReimbursementsTable';
import { useReimbursementsService } from '../../../../services/ReimbursementService';
import Reimbursement from '../../../../props/models/Reimbursement';
import useLatestRequestWithProgress from '../../../../hooks/useLatestRequestWithProgress';

export default function IdentityReimbursementsCard({
    organization,
    identity,
}: {
    organization: Organization;
    identity: SponsorIdentity;
}) {
    const reimbursementService = useReimbursementsService();
    const runLatestRequest = useLatestRequestWithProgress();

    const [loading, setLoading] = useState<boolean>(false);
    const [paginatorKey] = useState('reimbursements');
    const [reimbursements, setReimbursements] = useState<PaginationData<Reimbursement>>(null);

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext({
        per_page: 10,
        identity_address: identity.address,
    });

    const fetchReimbursements = useCallback(() => {
        runLatestRequest((config) => reimbursementService.list(organization.id, filterValuesActive, config), {
            onStart: () => setLoading(true),
            onSuccess: (res) => setReimbursements(res.data),
            onFinally: () => setLoading(false),
        });
    }, [runLatestRequest, organization.id, filterValuesActive, reimbursementService]);

    useEffect(() => {
        fetchReimbursements();
    }, [fetchReimbursements]);

    if (!reimbursements) {
        return <LoadingCard />;
    }

    return (
        <Card
            title={`Declaraties (${reimbursements?.meta?.total || 0})`}
            section={false}
            dusk="reimbursementsPageContent">
            <ReimbursementsTable
                loading={loading}
                paginatorKey={paginatorKey}
                reimbursements={reimbursements}
                organization={organization}
                filterValues={filterValues}
                filterUpdate={filterUpdate}
            />
        </Card>
    );
}
