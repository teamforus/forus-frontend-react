import React, { ReactNode, useMemo } from 'react';
import { PaginationData } from '../../../../props/ApiResponses';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import TableCheckboxControl from '../../../elements/tables/elements/TableCheckboxControl';
import Paginator from '../../../../modules/paginator/components/Paginator';
import Organization from '../../../../props/models/Organization';
import { FilterModel, FilterScope, FilterSetter } from '../../../../modules/filter_next/types/FilterParams';
import Reservation from '../../../../props/models/Reservation';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import useProductReservationService from '../../../../services/ProductReservationService';
import ReservationsTableRowProvider from './ReservationsTableRowProvider';
import ReservationsTableRowSponsor from './ReservationsTableRowSponsor';

export default function ReservationsTable({
    fetchReservations,
    loading,
    paginatorKey,
    reservations,
    organization,
    filter,
    filterValues,
    filterUpdate,
    selected = null,
    toggleAll = null,
    toggle = null,
    children = null,
    type,
}: {
    fetchReservations: () => void;
    loading: boolean;
    paginatorKey: string;
    reservations: PaginationData<Reservation>;
    organization: Organization;
    filter: FilterScope<FilterModel>;
    filterValues: FilterModel;
    filterUpdate: FilterSetter;
    selected?: Array<number>;
    toggleAll?: (e: React.MouseEvent<HTMLElement>, items: { id: number }[]) => void;
    toggle?: (e: React.MouseEvent<HTMLElement>, item: { id: number }) => void;
    children?: ReactNode;
    type: 'sponsor' | 'provider';
}) {
    const productReservationService = useProductReservationService();

    const showExtraPayments = useMemo(() => {
        const hasExtraPaymentsOnPage =
            reservations?.data.filter((reservation) => {
                return reservation.extra_payment !== null;
            }).length > 0;

        return organization.can_view_provider_extra_payments || hasExtraPaymentsOnPage;
    }, [organization, reservations]);

    const { headElement, configsElement } = useConfigurableTable(
        productReservationService.getColumns(showExtraPayments, type === 'sponsor'),
        {
            filter: filter,
            sortable: true,
            trPrepend: toggleAll ? (
                <th className="th-narrow">
                    <TableCheckboxControl
                        checked={selected.length == reservations?.data?.length}
                        onClick={(e) => toggleAll(e, reservations?.data)}
                    />
                </th>
            ) : null,
        },
    );

    return (
        <LoaderTableCard loading={loading} empty={reservations.meta.total == 0} emptyTitle={'Geen reserveringen.'}>
            {reservations.meta.total > 0 && (
                <div className="card-section card-section-padless">
                    {configsElement}

                    <TableTopScroller>
                        <table className="table form">
                            {headElement}

                            <tbody>
                                {reservations.data?.map((reservation) =>
                                    type === 'sponsor' ? (
                                        <ReservationsTableRowSponsor
                                            key={reservation.id}
                                            organization={organization}
                                            reservation={reservation}
                                            showExtraPayments={showExtraPayments}
                                            selected={selected}
                                            toggle={toggle}
                                        />
                                    ) : (
                                        <ReservationsTableRowProvider
                                            key={reservation.id}
                                            reservation={reservation}
                                            fetchReservations={fetchReservations}
                                            organization={organization}
                                            showExtraPayments={showExtraPayments}
                                            selected={selected}
                                            toggle={toggle}
                                        />
                                    ),
                                )}
                            </tbody>
                        </table>
                    </TableTopScroller>
                </div>
            )}

            {children}

            {reservations?.meta && (
                <div className="card-section">
                    <Paginator
                        meta={reservations.meta}
                        filters={filterValues}
                        updateFilters={filterUpdate}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}
        </LoaderTableCard>
    );
}
