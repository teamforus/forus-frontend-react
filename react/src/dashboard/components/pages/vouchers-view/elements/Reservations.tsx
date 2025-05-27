import React, { useCallback, useEffect, useState } from 'react';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import useSetProgress from '../../../../hooks/useSetProgress';
import { PaginationData } from '../../../../props/ApiResponses';
import useProductReservationService from '../../../../services/ProductReservationService';
import Reservation from '../../../../props/models/Reservation';
import useTranslate from '../../../../hooks/useTranslate';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import Organization from '../../../../props/models/Organization';
import ReservationsTable from '../../reservations/elements/ReservationsTable';
import Voucher from '../../../../props/models/Voucher';

export default function Reservations({
    voucher,
    organization,
    fetchReservationsRef = null,
}: {
    voucher: Voucher;
    organization: Organization;
    fetchReservationsRef?: React.MutableRefObject<() => void>;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();

    const productReservationService = useProductReservationService();

    const [paginatorKey] = useState('reservations');
    const [loading, setLoading] = useState(true);
    const [reservations, setReservations] = useState<PaginationData<Reservation>>(null);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        per_page: number;
        order_by: string;
        order_dir: string;
        archived: number;
    }>({
        per_page: 20,
        order_by: 'created_at',
        order_dir: 'desc',
        archived: 0,
    });

    const fetchReservations = useCallback(() => {
        setLoading(true);
        setProgress(0);

        productReservationService
            .listSponsor(organization.id, {
                ...filterValuesActive,
                voucher_id: voucher.id,
            })
            .then((res) => setReservations(res.data))
            .finally(() => {
                setLoading(false);
                setProgress(100);
            });
    }, [organization.id, voucher.id, filterValuesActive, productReservationService, setProgress]);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    useEffect(() => {
        if (fetchReservationsRef) {
            fetchReservationsRef.current = fetchReservations;
        }
    }, [fetchReservations, fetchReservationsRef]);

    if (!reservations) {
        return <LoadingCard />;
    }

    return (
        <div className="card" data-dusk="tableReservationContent">
            <div className="card-header">
                <div className="card-title flex flex-grow" data-dusk="reservationsTitle">
                    {translate('reservations.header.title')}
                    {!loading && ` (${reservations.meta.total})`}
                </div>
            </div>

            <ReservationsTable
                loading={loading}
                paginatorKey={paginatorKey}
                reservations={reservations}
                organization={organization}
                filter={filter}
                filterValues={filterValues}
                filterUpdate={filterUpdate}
                fetchReservations={fetchReservations}
            />
        </div>
    );
}
