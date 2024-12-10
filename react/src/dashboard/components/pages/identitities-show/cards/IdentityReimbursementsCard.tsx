import React, { useCallback, useEffect, useState } from 'react';
import Organization from '../../../../props/models/Organization';
import { PaginationData } from '../../../../props/ApiResponses';
import SponsorIdentity from '../../../../props/models/Sponsor/SponsorIdentity';
import useSetProgress from '../../../../hooks/useSetProgress';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import Card from '../../../elements/card/Card';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import ReimbursementsTable from '../../reimbursements/elements/ReimbursementsTable';
import { useReimbursementsService } from '../../../../services/ReimbursementService';
import Reimbursement from '../../../../props/models/Reimbursement';

export default function IdentityReimbursementsCard({
    organization,
    identity,
}: {
    organization: Organization;
    identity: SponsorIdentity;
}) {
    const setProgress = useSetProgress();
    const reimbursementService = useReimbursementsService();

    const [loading, setLoading] = useState<boolean>(false);
    const [paginatorKey] = useState('reimbursements');
    const [reimbursements, setReimbursements] = useState<PaginationData<Reimbursement>>(null);

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext({
        per_page: 10,
        identity_address: identity.address,
    });

    const fetchReimbursements = useCallback(() => {
        setProgress(0);
        setLoading(true);

        reimbursementService
            .list(organization.id, filterValuesActive)
            .then((res) => setReimbursements(res.data))
            .finally(() => {
                setProgress(100);
                setLoading(false);
            });
    }, [setProgress, organization.id, filterValuesActive, reimbursementService]);

    useEffect(() => {
        fetchReimbursements();
    }, [fetchReimbursements]);

    if (!reimbursements) {
        return <LoadingCard />;
    }

    return (
        <Card title={`Declaraties (${reimbursements?.meta?.total || 0})`} section={false}>
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
