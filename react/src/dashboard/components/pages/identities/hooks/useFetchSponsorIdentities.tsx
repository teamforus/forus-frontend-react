import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import { NumberParam, StringParam } from 'use-query-params';
import { useCallback, useState } from 'react';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import { PaginationData } from '../../../../props/ApiResponses';
import SponsorIdentity from '../../../../props/models/Sponsor/SponsorIdentity';
import useSetProgress from '../../../../hooks/useSetProgress';
import useSponsorIdentitiesService from '../../../../services/SponsorIdentitesService';
import Organization from '../../../../props/models/Organization';
import usePushApiError from '../../../../hooks/usePushApiError';

export default function useFetchSponsorIdentities(organization: Organization, extraFilters?: { household_id: number }) {
    const [loading, setLoading] = useState(false);
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const [identities, setIdentities] = useState<PaginationData<SponsorIdentity>>(null);
    const [extra] = useState(extraFilters ?? []);

    const paginatorService = usePaginatorService();
    const sponsorIdentitiesService = useSponsorIdentitiesService();

    const [paginatorKey] = useState('identities');

    const [states] = useState([
        { key: null, name: 'Alle' },
        { key: 'pending', name: 'In afwachting' },
        { key: 'success', name: 'Voltooid' },
    ]);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        q: string;
        state: string;
        page?: number;
        city?: string;
        has_bsn?: number;
        fund_id?: number;
        per_page?: number;
        postal_code?: string;
        municipality_name?: string;
        birth_date_to?: string;
        birth_date_from?: string;
        last_login_to?: string;
        last_login_from?: string;
        last_activity_to?: string;
        last_activity_from?: string;
        order_by?: string;
        order_dir?: string;
    }>(
        {
            q: '',
            state: states[0].key,
            fund_id: null,
            page: 1,
            city: '',
            has_bsn: null,
            postal_code: '',
            municipality_name: '',
            birth_date_to: '',
            birth_date_from: '',
            last_login_to: '',
            last_login_from: '',
            last_activity_to: '',
            last_activity_from: '',
            order_by: 'created_at',
            order_dir: 'desc',
            per_page: paginatorService.getPerPage(paginatorKey),
        },
        {
            throttledValues: ['q', 'postal_code', 'city', 'municipality_name'],
            queryParams: {
                q: StringParam,
                state: StringParam,
                page: NumberParam,
                city: StringParam,
                has_bsn: NumberParam,
                fund_id: NumberParam,
                per_page: NumberParam,
                postal_code: StringParam,
                municipality_name: StringParam,
                birth_date_to: StringParam,
                birth_date_from: StringParam,
                last_login_to: StringParam,
                last_login_from: StringParam,
                last_activity_to: StringParam,
                last_activity_from: StringParam,
                order_by: StringParam,
                order_dir: StringParam,
            },
        },
    );

    const fetchIdentities = useCallback(() => {
        setLoading(true);
        setProgress(0);

        sponsorIdentitiesService
            .list(organization.id, {
                ...filterValuesActive,
                ...extra,
            })
            .then((res) => setIdentities(res.data))
            .catch(pushApiError)
            .finally(() => {
                setLoading(false);
                setProgress(100);
            });
    }, [setProgress, sponsorIdentitiesService, organization.id, filterValuesActive, extra, pushApiError]);

    return { filter, filterValues, filterUpdate, loading, identities, fetchIdentities, paginatorKey };
}
