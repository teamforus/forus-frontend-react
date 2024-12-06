import React from 'react';
import Voucher from '../../../../props/models/Voucher';
import Organization from '../../../../props/models/Organization';
import Fund from '../../../../props/models/Fund';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import VouchersTableRow from './VouchersTableRow';
import Paginator from '../../../../modules/paginator/components/Paginator';
import { PaginationData } from '../../../../props/ApiResponses';
import useConfigurableTable from '../hooks/useConfigurableTable';
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
    vouchers: PaginationData<Voucher>;
    organization: Organization;
    fetchVouchers: () => void;
    filterValues: FilterModel;
    filterUpdate: FilterSetter;
}) {
    const voucherService = useVoucherService();

    const { headElement, configsElement } = useConfigurableTable(voucherService.getColumns(), {
        hasTooltips: true,
    });

    return (
        <LoaderTableCard loading={loading} empty={vouchers.meta.total == 0} emptyTitle={'Geen vouchers gevonden'}>
            {!loading && vouchers.data.length > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {vouchers.data.map((voucher) => (
                                        <VouchersTableRow
                                            funds={funds}
                                            key={voucher.id}
                                            voucher={voucher}
                                            fetchVouchers={fetchVouchers}
                                            organization={organization}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </TableTopScroller>
                    </div>
                </div>
            )}

            {vouchers.meta && (
                <div className="card-section">
                    <Paginator
                        meta={vouchers.meta}
                        filters={filterValues}
                        updateFilters={filterUpdate}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}
        </LoaderTableCard>
    );
}
