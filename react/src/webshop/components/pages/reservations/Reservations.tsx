import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import { PaginationData } from '../../../../dashboard/props/ApiResponses';
import Organization from '../../../../dashboard/props/models/Organization';
import { useOrganizationService } from '../../../../dashboard/services/OrganizationService';
import Reservation from '../../../../dashboard/props/models/Reservation';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import ReservationCard from './elements/ReservationCard';
import { useProductReservationService } from '../../../services/ProductReservationService';
import UIControlText from '../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';
import useFilterNext from '../../../../dashboard/modules/filter_next/useFilterNext';
import { createEnumParam, NumberParam, StringParam } from 'use-query-params';

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

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{
        q: string;
        state: string;
        fund_id?: number;
        organization_id?: number;
        archived: 0 | 1;
        page?: number;
        per_page?: number;
    }>(
        {
            q: '',
            state: 'all',
            fund_id: null,
            organization_id: null,
            archived: 0,
            page: 1,
            per_page: 15,
        },
        {
            queryParams: {
                q: StringParam,
                state: StringParam,
                fund_id: NumberParam,
                organization_id: NumberParam,
                archived: createEnumParam(['0', '1']),
                page: NumberParam,
                per_page: NumberParam,
            },
        },
    );

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
            .list({ type: 'provider', has_reservations: 1, per_page: 300, order_by: 'name' })
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
                ...filterValuesActive,
                state: filterValuesActive?.state === 'all' ? null : filterValuesActive?.state,
            })
            .then((res) => setReservations(res.data))
            .finally(() => setProgress(100));
    }, [filterValuesActive, productReservationService, setProgress]);

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
            contentDusk="listReservationsContent"
            breadcrumbItems={[
                { name: translate('reservations.breadcrumbs.home'), state: WebshopRoutes.HOME },
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
                                value={filterValues.q}
                                onChangeValue={(q) => filterUpdate({ q })}
                                dataDusk="listReservationsSearch"
                                ariaLabel={translate('reservations.filters.search_aria_label')}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="select_fund" id="fund_select">
                                {translate('reservations.filters.fund')}
                            </label>

                            <SelectControl
                                id="select_fund"
                                propKey={'id'}
                                value={filterValues.fund_id}
                                options={funds}
                                multiline={true}
                                allowSearch={true}
                                dusk="selectControlFunds"
                                onChange={(fund_id?: number) => filterUpdate({ fund_id })}
                                ariaLabelledby="fund_select"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="select_provider" id="provider_select">
                                {translate('reservations.filters.provider')}
                            </label>

                            <SelectControl
                                id="select_provider"
                                value={filterValues.organization_id}
                                propKey={'id'}
                                options={organizations}
                                onChange={(organization_id?: number) => filterUpdate({ organization_id })}
                                multiline={true}
                                allowSearch={true}
                                dusk="selectControlOrganizations"
                                ariaLabelledby="provider_select"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="select_state" id="state_select">
                                {translate('reservations.filters.state')}
                            </label>

                            <SelectControl
                                id="select_state"
                                value={filterValues.state}
                                propKey={'value'}
                                options={states}
                                onChange={(state?: string) => filterUpdate({ state })}
                                multiline={true}
                                allowSearch={true}
                                dusk="selectControlStates"
                                ariaLabelledby="state_select"
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
                                        className={classNames(
                                            'label-tab',
                                            'label-tab-sm',
                                            !filterValues.archived && 'active',
                                        )}
                                        onClick={() => filterUpdate({ archived: 0 })}
                                        aria-pressed={!filterValues.archived}
                                        data-dusk="reservationsFilterActive"
                                        role="button">
                                        {translate('reservations.types.active')}
                                    </div>
                                    <div
                                        className={classNames(
                                            'label-tab',
                                            'label-tab-sm',
                                            filterValues.archived && 'active',
                                        )}
                                        onClick={() => filterUpdate({ archived: 1 })}
                                        aria-pressed={!!filterValues.archived}
                                        data-dusk="reservationsFilterArchived"
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
                            <Paginator meta={reservations.meta} filters={filterValues} updateFilters={filterUpdate} />
                        </div>
                    </div>
                </Fragment>
            )}
        </BlockShowcaseProfile>
    );
}
