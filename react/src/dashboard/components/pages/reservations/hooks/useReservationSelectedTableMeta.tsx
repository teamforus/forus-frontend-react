import { useMemo } from 'react';
import Reservation from '../../../../props/models/Reservation';

export default function useReservationSelectedTableMeta(
    reservations: Reservation[],
    selectedIds?: number[],
): {
    selected: Reservation[];
    selected_acceptable: Reservation[];
    selected_rejectable: Reservation[];
    selected_archivable: Reservation[];
    selected_archived: Reservation[];
    hasActions: boolean;
} | null {
    return useMemo<{
        selected: Reservation[];
        selected_acceptable: Reservation[];
        selected_rejectable: Reservation[];
        selected_archivable: Reservation[];
        selected_archived: Reservation[];
        hasActions: boolean;
    } | null>(() => {
        const list = reservations.filter((item) => selectedIds?.includes(item.id));

        const acceptable = list.filter((item) => item.acceptable);
        const rejectable = list.filter((item) => item.rejectable);
        const archivable = list.filter((item) => item.archivable);
        const archived = list.filter((item) => item.archived);

        const selected_acceptable = acceptable.length === list.length ? acceptable : [];
        const selected_rejectable = rejectable.length === list.length ? rejectable : [];
        const selected_archivable = archivable.length === list.length ? archivable : [];
        const selected_archived = archived.length === list.length ? archived : [];

        const hasActions =
            selected_acceptable.length > 0 ||
            selected_rejectable.length > 0 ||
            selected_archivable.length > 0 ||
            selected_archived.length > 0;

        return {
            selected: list,
            selected_acceptable,
            selected_rejectable,
            selected_archivable,
            selected_archived,
            hasActions,
        };
    }, [reservations, selectedIds]);
}
