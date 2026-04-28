import React, { useCallback, useEffect, useState } from 'react';
import Organization from '../../../../props/models/Organization';
import { PaginationData } from '../../../../props/ApiResponses';
import SponsorVoucher from '../../../../props/models/Sponsor/SponsorVoucher';
import useVoucherService from '../../../../services/VoucherService';
import SponsorIdentity from '../../../../props/models/Sponsor/SponsorIdentity';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import Card from '../../../elements/card/Card';
import VouchersTable from '../../vouchers/elements/VouchersTable';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import useVoucherTableOptions from '../../vouchers/hooks/useVoucherTableOptions';
import usePushApiError from '../../../../hooks/usePushApiError';
import useLatestRequestWithProgress from '../../../../hooks/useLatestRequestWithProgress';

export default function IdentityVouchersCard({
    identity,
    organization,
}: {
    identity: SponsorIdentity;
    organization: Organization;
}) {
    const pushApiError = usePushApiError();
    const runLatestRequest = useLatestRequestWithProgress();
    const voucherService = useVoucherService();

    const { funds } = useVoucherTableOptions(organization);
    const [loading, setLoading] = useState(false);
    const [vouchers, setVouchers] = useState<PaginationData<SponsorVoucher>>(null);
    const [paginatorKey] = useState<string>('vouchers');

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext({
        per_page: 10,
        type: 'all',
        source: 'all',
        order_by: 'created_at',
        order_dir: 'desc',
        identity_id: identity.id,
    });

    const fetchVouchers = useCallback(() => {
        runLatestRequest((config) => voucherService.index(organization.id, filterValuesActive, config), {
            onStart: () => setLoading(true),
            onSuccess: (res) => setVouchers(res.data),
            onError: pushApiError,
            onFinally: () => setLoading(false),
        });
    }, [filterValuesActive, organization.id, pushApiError, runLatestRequest, voucherService]);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    if (!vouchers) {
        return <LoadingCard />;
    }

    return (
        <Card title={`Tegoeden (${vouchers?.meta?.total || 0})`} section={false}>
            <VouchersTable
                funds={funds}
                loading={loading}
                vouchers={vouchers}
                paginatorKey={paginatorKey}
                organization={organization}
                fetchVouchers={fetchVouchers}
                filterValues={filterValues}
                filterUpdate={filterUpdate}
            />
        </Card>
    );
}
