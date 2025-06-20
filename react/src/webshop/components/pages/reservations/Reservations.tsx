import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import { PaginationData } from '../../../../dashboard/props/ApiResponses';
import useFilter from '../../../../dashboard/hooks/useFilter';
import Organization from '../../../../dashboard/props/models/Organization';
import { useOrganizationService } from '../../../../dashboard/services/OrganizationService';
import Reservation from '../../../../dashboard/props/models/Reservation';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import ReservationCard from './elements/ReservationCard';
import { useProductReservationService } from '../../../services/ProductReservationService';
import UIControlText from '../../../../dashboard/components/elements/forms/ui-controls/UIControlText';

export default function Reservations() {
    const translate = useTranslate();
    const setProgress = useSetProgress();

    const fundService = useFundService();
    const organizationService = useOrganizationService();
    const productReservationService = useProductReservationService();

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [organizations, setOrganizations] = useState<Array<Partial<Organization>>>(null);
    const [reservations, setReservations] = useState<PaginationData<Reservation>>(null);

    const states = useMemo(() => {
        return [
            { value: 'all', name: translate('reservations.states.all') },
            { value: 'pending', name: translate('reservations.states.pending') },
            { value: 'accepted', name: translate('reservations.states.accepted') },
            { value: 'rejected', name: translate('reservations.states.rejected') },
            { value: 'canceled', name: translate('reservations.states.canceled') },
        ];
    }, [translate]);

    const filters = useFilter({
        state: 'all',
        fund_id: null,
        organization_id: null,
        archived: 0,
    });

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list({ per_page: 100 })
            .then((res) => {
                setFunds([{ name: translate('reservations.filters.all_funds'), id: null }, ...res.data.data]);
            })
            .finally(() => setProgress(100));
    }, [fundService, setProgress, translate]);

    const fetchOrganizations = useCallback(() => {
        setProgress(0);

        organizationService
            .list({ type: 'provider', has_reservations: 1, per_page: 300 })
            .then((res) =>
                setOrganizations([
                    { name: translate('reservations.filters.all_providers'), id: null },
                    ...res.data.data,
                ]),
            )
            .finally(() => setProgress(100));
    }, [organizationService, setProgress, translate]);

    const fetchReservations = useCallback(() => {
        setProgress(0);

        productReservationService
            .list({
                ...filters.activeValues,
                state: filters.activeValues?.state === 'all' ? null : filters.activeValues?.state,
            })
            .then((res) => setReservations(res.data))
            .finally(() => setProgress(100));
    }, [filters.activeValues, productReservationService, setProgress]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        fetchOrganizations();
    }, [fetchOrganizations]);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    return (
        <BlockShowcaseProfile
            breadcrumbItems={[
                { name: translate('reservations.breadcrumbs.home'), state: 'home' },
                { name: translate('reservations.breadcrumbs.reservations') },
            ]}
            filters={
                <div className="form form-compact">
                    <div className="profile-aside-block">
                        <div className="form-group">
                            <label className="form-label" htmlFor="products_search">
                                {translate('reservations.filters.search')}
                            </label>

                            <UIControlText
                                id="products_search"
                                value={filters.values.q}
                                onChangeValue={(q) => filters.update({ q })}
                                ariaLabel={translate('reservations.filters.search_aria_label')}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="select_fund">
                                {translate('reservations.filters.fund')}
                            </label>

                            <SelectControl
                                id="select_fund"
                                propKey={'id'}
                                value={filters.values.fund_id}
                                options={funds}
                                multiline={true}
                                allowSearch={true}
                                onChange={(fund_id?: number) => filters.update({ fund_id })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="select_provider">
                                {translate('reservations.filters.provider')}
                            </label>

                            <SelectControl
                                id="select_provider"
                                value={filters.values.organization_id}
                                propKey={'id'}
                                options={organizations}
                                onChange={(organization_id?: number) => filters.update({ organization_id })}
                                multiline={true}
                                allowSearch={true}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="select_state">
                                {translate('reservations.filters.state')}
                            </label>

                            <SelectControl
                                id="select_state"
                                value={filters.values.state}
                                propKey={'value'}
                                options={states}
                                onChange={(state?: string) => filters.update({ state })}
                                multiline={true}
                                allowSearch={true}
                            />
                        </div>
                    </div>
                </div>
            }
            profileHeader={
                reservations && (
                    <Fragment>
                        <div className="profile-content-header clearfix">
                            <div className="profile-content-title">
                                <div className="pull-left">
                                    <div className="profile-content-title-count">{reservations.meta.total}</div>
                                    <h1 className="profile-content-header" data-dusk="reservationsTitle">
                                        {translate('reservations.title')}
                                    </h1>
                                </div>
                            </div>

                            <div className="block block-label-tabs form pull-right">
                                <div className="label-tab-set">
                                    <div
                                        className={`label-tab label-tab-sm ${!filters.values.archived ? 'active' : ''}`}
                                        onClick={() => filters.update({ archived: 0 })}
                                        aria-pressed={!filters.values.archived}
                                        role="button">
                                        {translate('reservations.types.active')}
                                    </div>
                                    <div
                                        className={`label-tab label-tab-sm ${filters.values.archived ? 'active' : ''}`}
                                        onClick={() => filters.update({ archived: 1 })}
                                        aria-pressed={!!filters.values.archived}
                                        role="button">
                                        {translate('reservations.types.archived')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="profile-content-header">
                            <div className="profile-content-subtitle">{translate('reservations.subtitle')}</div>
                        </div>
                    </Fragment>
                )
            }>
            {reservations && (
                <Fragment>
                    {reservations.data?.length > 0 && (
                        <div className="block block-reservations">
                            {reservations.data?.map((reservation) => (
                                <ReservationCard
                                    key={reservation.id}
                                    reservation={reservation}
                                    onDelete={() => fetchReservations()}
                                />
                            ))}
                        </div>
                    )}

                    {reservations.meta?.total == 0 && (
                        <EmptyBlock
                            svgIcon="reimbursements"
                            title={translate('reservations.empty.title')}
                            description={translate('reservations.empty.subtitle')}
                            hideLink={true}
                        />
                    )}

                    <div className="card" hidden={reservations?.meta?.last_page < 2}>
                        <div className="card-section">
                            <Paginator
                                meta={reservations.meta}
                                filters={filters.values}
                                updateFilters={filters.update}
                            />
                        </div>
                    </div>
                </Fragment>
            )}
        </BlockShowcaseProfile>
    );
}
