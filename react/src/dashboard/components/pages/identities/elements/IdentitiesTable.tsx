import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import useSetProgress from '../../../../hooks/useSetProgress';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import { useFundService } from '../../../../services/FundService';
import Fund from '../../../../props/models/Fund';
import FilterItemToggle from '../../../elements/tables/elements/FilterItemToggle';
import SelectControl from '../../../elements/select-control/SelectControl';
import CardHeaderFilter from '../../../elements/tables/elements/CardHeaderFilter';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useTranslate from '../../../../hooks/useTranslate';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import SelectControlOptionsFund from '../../../elements/select-control/templates/SelectControlOptionsFund';
import usePushApiError from '../../../../hooks/usePushApiError';
import useSponsorIdentitiesService from '../../../../services/SponsorIdentitesService';
import useIdentityExporter from '../../../../services/exporters/useIdentityExporter';
import DatePickerControl from '../../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../../helpers/dates';
import IdentitiesTableRowItems from './IdentitiesTableRowItems';
import TableRowActions from '../../../elements/tables/TableRowActions';
import useFetchSponsorIdentities from '../hooks/useFetchSponsorIdentities';
import { ProfileRecordType } from '../../../../props/models/Sponsor/SponsorIdentity';
import RecordType from '../../../../props/models/RecordType';
import { useRecordTypeService } from '../../../../services/RecordTypeService';
import useEditProfileRecords from '../../identitities-show/hooks/useEditProfileRecords';
import TableRowActionItem from '../../../elements/tables/TableRowActionItem';
import { hasPermission } from '../../../../helpers/utils';
import { Permission } from '../../../../props/models/Organization';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function IdentitiesTable() {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const identityExporter = useIdentityExporter();
    const sponsorIdentitiesService = useSponsorIdentitiesService();

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);

    const [hasBsnOptions] = useState([
        { key: 1, name: 'Ja' },
        { key: 0, name: 'Nee' },
        { key: null, name: 'Alle' },
    ]);

    const { filter, filterValues, filterUpdate, loading, identities, fetchIdentities, paginatorKey } =
        useFetchSponsorIdentities(activeOrganization);

    const { setShow } = filter;

    const exportIdentities = useCallback(() => {
        setShow(false);

        identityExporter.exportData(activeOrganization.id, {
            ...filter.activeValues,
            per_page: null,
        });
    }, [activeOrganization.id, filter.activeValues, identityExporter, setShow]);

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list(activeOrganization.id)
            .then((res) => setFunds([{ id: null, name: 'Selecteer fonds' }, ...res.data.data]))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [activeOrganization.id, fundService, setProgress, pushApiError]);

    const [recordTypes, setRecordTypes] = useState<Array<RecordType & { key: ProfileRecordType }>>(null);

    const recordTypeService = useRecordTypeService();

    const editProfileRecords = useEditProfileRecords(activeOrganization, recordTypes);

    const createProfile = useCallback(
        (fetchProfiles: () => void) => {
            editProfileRecords(null, 'Voeg een nieuw persoon toe', 'personal', fetchProfiles);
        },
        [editProfileRecords],
    );

    const fetchRecordTypes = useCallback(() => {
        setProgress(0);

        recordTypeService
            .list<RecordType & { key: ProfileRecordType }>()
            .then((res) => setRecordTypes(res.data))
            .finally(() => setProgress(100));
    }, [recordTypeService, setProgress]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    useEffect(() => {
        fetchIdentities();
    }, [fetchIdentities]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    if (!identities || !funds) {
        return <LoadingCard />;
    }

    return (
        <div className="card" data-dusk="tableProfilesContent">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {translate('identities.header.title')} ({identities?.meta?.total})
                </div>

                <div className={'card-header-filters'}>
                    <div className="block block-inline-filters">
                        {activeOrganization?.allow_profiles_create &&
                            hasPermission(activeOrganization, Permission.MANAGE_IDENTITIES) && (
                                <button
                                    type="button"
                                    className="button button-primary button-sm"
                                    onClick={() => createProfile(fetchIdentities)}
                                    data-dusk="uploadTransactionsBatchButton">
                                    <em className="mdi mdi-plus-circle" />
                                    Aanmaken
                                </button>
                            )}

                        <div className="form">
                            <div className="form-group">
                                <SelectControl
                                    className="form-control inline-filter-control"
                                    propKey={'id'}
                                    options={funds}
                                    value={filter.activeValues.fund_id}
                                    placeholder={translate('vouchers.labels.fund')}
                                    allowSearch={false}
                                    onChange={(fund_id: number) => filter.update({ fund_id })}
                                    optionsComponent={SelectControlOptionsFund}
                                />
                            </div>
                        </div>

                        {filter.show && (
                            <div className="button button-text" onClick={() => filter.resetFilters()}>
                                <em className="mdi mdi-close icon-start" />
                                Wis filters
                            </div>
                        )}

                        {!filter.show && (
                            <div className="form">
                                <div className="form-group">
                                    <input
                                        className="form-control"
                                        data-dusk="tableProfilesSearch"
                                        value={filterValues.q}
                                        onChange={(e) => filterUpdate({ q: e.target.value })}
                                        placeholder={translate('payouts.labels.search')}
                                    />
                                </div>
                            </div>
                        )}

                        <CardHeaderFilter filter={filter}>
                            <FilterItemToggle label={translate('payouts.labels.search')} show={true}>
                                <input
                                    className="form-control"
                                    value={filterValues.q}
                                    onChange={(e) => filterUpdate({ q: e.target.value })}
                                    placeholder={translate('payouts.labels.search')}
                                />
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('sponsor_products.filters.birth_date_from')}>
                                <DatePickerControl
                                    value={dateParse(filterValues.birth_date_from)}
                                    placeholder={translate('dd-MM-yyyy')}
                                    onChange={(from: Date) => filterUpdate({ birth_date_from: dateFormat(from) })}
                                />
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('sponsor_products.filters.birth_date_to')}>
                                <DatePickerControl
                                    value={dateParse(filterValues.birth_date_to)}
                                    placeholder={translate('dd-MM-yyyy')}
                                    onChange={(to: Date) => filterUpdate({ birth_date_to: dateFormat(to) })}
                                />
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('sponsor_products.filters.postal_code')}>
                                <input
                                    className="form-control"
                                    value={filterValues.postal_code}
                                    onChange={(e) => filterUpdate({ postal_code: e.target.value })}
                                    placeholder={translate('sponsor_products.filters.postal_code')}
                                />
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('sponsor_products.filters.municipality')}>
                                <input
                                    className="form-control"
                                    value={filterValues.municipality_name}
                                    onChange={(e) => filterUpdate({ municipality_name: e.target.value })}
                                    placeholder={translate('sponsor_products.filters.municipality')}
                                />
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('sponsor_products.filters.city')}>
                                <input
                                    className="form-control"
                                    value={filterValues.city}
                                    onChange={(e) => filterUpdate({ city: e.target.value })}
                                    placeholder={translate('sponsor_products.filters.city')}
                                />
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('sponsor_products.filters.last_activity_from')}>
                                <DatePickerControl
                                    value={dateParse(filterValues.last_activity_from)}
                                    placeholder={translate('dd-MM-yyyy')}
                                    onChange={(from: Date) => filterUpdate({ last_activity_from: dateFormat(from) })}
                                />
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('sponsor_products.filters.last_activity_to')}>
                                <DatePickerControl
                                    value={dateParse(filterValues.last_activity_to)}
                                    placeholder={translate('dd-MM-yyyy')}
                                    onChange={(to: Date) => filterUpdate({ last_activity_to: dateFormat(to) })}
                                />
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('sponsor_products.filters.last_login_from')}>
                                <DatePickerControl
                                    value={dateParse(filterValues.last_login_from)}
                                    placeholder={translate('dd-MM-yyyy')}
                                    onChange={(from: Date) => filterUpdate({ last_login_from: dateFormat(from) })}
                                />
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('sponsor_products.filters.last_login_to')}>
                                <DatePickerControl
                                    value={dateParse(filterValues.last_login_to)}
                                    placeholder={translate('dd-MM-yyyy')}
                                    onChange={(to: Date) => filterUpdate({ last_login_to: dateFormat(to) })}
                                />
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('sponsor_products.filters.has_bsn')}>
                                <SelectControl
                                    className="form-control"
                                    propKey={'key'}
                                    allowSearch={false}
                                    value={filterValues.has_bsn}
                                    options={hasBsnOptions}
                                    onChange={(has_bsn: number) => filterUpdate({ has_bsn })}
                                />
                            </FilterItemToggle>

                            <div className="form-actions">
                                <button
                                    className="button button-primary button-wide"
                                    onClick={exportIdentities}
                                    data-dusk="export"
                                    disabled={identities?.meta?.total == 0}>
                                    <em className="mdi mdi-download icon-start" />
                                    {translate('components.dropdown.export', { total: identities?.meta?.total })}
                                </button>
                            </div>
                        </CardHeaderFilter>
                    </div>
                </div>
            </div>

            <LoaderTableCard
                loading={loading}
                empty={identities?.meta?.total == 0}
                emptyTitle={'Geen personen gevonden'}
                columns={sponsorIdentitiesService.getColumns(activeOrganization)}
                tableOptions={{ filter, sortable: true, hasTooltips: true }}
                paginator={{ key: paginatorKey, data: identities, filterValues, filterUpdate }}>
                {identities?.data?.map((identity) => (
                    <StateNavLink
                        key={identity.id}
                        name={DashboardRoutes.IDENTITY}
                        dataDusk={`tableProfilesRow${identity.id}`}
                        params={{ organizationId: activeOrganization.id, id: identity.id }}
                        className={'tr-clickable'}
                        customElement={'tr'}>
                        <IdentitiesTableRowItems
                            actions={
                                <TableRowActions
                                    content={() => (
                                        <div className="dropdown dropdown-actions">
                                            <TableRowActionItem
                                                type={'link'}
                                                name={DashboardRoutes.IDENTITY}
                                                params={{
                                                    organizationId: activeOrganization.id,
                                                    id: identity.id,
                                                }}>
                                                <em className="mdi mdi-eye icon-start" /> Bekijken
                                            </TableRowActionItem>
                                        </div>
                                    )}
                                />
                            }
                            identity={identity}
                            organization={activeOrganization}
                        />
                    </StateNavLink>
                ))}
            </LoaderTableCard>
        </div>
    );
}
