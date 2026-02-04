import React from 'react';
import SponsorVoucher from '../../../../props/models/Sponsor/SponsorVoucher';
import Organization from '../../../../props/models/Organization';
import Fund from '../../../../props/models/Fund';
import VouchersTableRow from './VouchersTableRow';
import { PaginationData } from '../../../../props/ApiResponses';
import useVoucherService from '../../../../services/VoucherService';
import { FilterModel, FilterSetter } from '../../../../modules/filter_next/types/FilterParams';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';

export default function VouchersTable({
    funds,
    loading,
    paginatorKey,
    vouchers,
    organization,
    fetchVouchers,
    filterValues,
    filterUpdate,
}: {
    funds: Array<Partial<Fund>>;
    loading: boolean;
    paginatorKey: string;
    vouchers: PaginationData<SponsorVoucher>;
    organization: Organization;
    fetchVouchers: () => void;
    filterValues: FilterModel;
    filterUpdate: FilterSetter;
}) {
    const voucherService = useVoucherService();

    return (
        <LoaderTableCard
            loading={loading}
            empty={vouchers?.meta?.total == 0}
            emptyTitle={'Geen vouchers gevonden'}
            columns={voucherService.getColumns()}
            paginator={{ key: paginatorKey, data: vouchers, filterValues, filterUpdate }}>
            {vouchers?.data?.map((voucher) => (
                <VouchersTableRow
                    funds={funds}
                    key={voucher.id}
                    voucher={voucher}
                    fetchVouchers={fetchVouchers}
                    organization={organization}
                />
            ))}
        </LoaderTableCard>
    );
}
