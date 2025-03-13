import React, { useCallback, useEffect, useState } from 'react';
import Organization from '../../../../props/models/Organization';
import { PaginationData } from '../../../../props/ApiResponses';
import Voucher from '../../../../props/models/Voucher';
import useVoucherService from '../../../../services/VoucherService';
import SponsorIdentity from '../../../../props/models/Sponsor/SponsorIdentity';
import useSetProgress from '../../../../hooks/useSetProgress';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import Card from '../../../elements/card/Card';
import VouchersTable from '../../vouchers/elements/VouchersTable';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import useVoucherTableOptions from '../../vouchers/hooks/useVoucherTableOptions';
import usePushApiError from '../../../../hooks/usePushApiError';

export default function IdentityVouchersCard({
    organization,
    identity,
}: {
    organization: Organization;
    identity: SponsorIdentity;
}) {
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const voucherService = useVoucherService();

    const { funds } = useVoucherTableOptions(organization);
    const [loading, setLoading] = useState(false);
    const [vouchers, setVouchers] = useState<PaginationData<Voucher>>(null);
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
        setProgress(0);
        setLoading(true);

        voucherService
            .index(organization.id, filterValuesActive)
            .then((res) => setVouchers(res.data))
            .catch(pushApiError)
            .finally(() => {
                setProgress(100);
                setLoading(false);
            });
    }, [filterValuesActive, organization.id, pushApiError, voucherService, setProgress]);

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
