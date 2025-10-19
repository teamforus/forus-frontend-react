import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { PaginationData } from '../../../../dashboard/props/ApiResponses';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import { useNavigateState } from '../../../modules/state_router/Router';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import useEnvData from '../../../hooks/useEnvData';
import useAuthIdentity2FAState from '../../../hooks/useAuthIdentity2FAState';
import Reimbursement from '../../../props/models/Reimbursement';
import { useVoucherService } from '../../../services/VoucherService';
import Voucher from '../../../../dashboard/props/models/Voucher';
import { useReimbursementService } from '../../../services/ReimbursementService';
import ReimbursementCard from './elements/ReimbursementCard';
import IconReimbursement from '../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-reimbursement.svg';
import Auth2FARestriction from '../../elements/auth2fa-restriction/Auth2FARestriction';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';
import classNames from 'classnames';
import useFilterNext from '../../../../dashboard/modules/filter_next/useFilterNext';
import { createEnumParam, NumberParam, StringParam } from 'use-query-params';

export default function Reimbursements() {
    const envData = useEnvData();
    const auth2FAState = useAuthIdentity2FAState();
    const auth2faRestricted = useMemo(() => auth2FAState?.restrictions?.reimbursements?.restricted, [auth2FAState]);

    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const fundService = useFundService();
    const voucherService = useVoucherService();
    const reimbursementService = useReimbursementService();

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [vouchers, setVouchers] = useState<Array<Voucher>>(null);
    const [reimbursements, setReimbursements] = useState<PaginationData<Reimbursement>>(null);

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{
        q: string;
        state: string;
        fund_id?: number;
        archived: 0 | 1;
        page?: number;
        per_page?: number;
    }>(
        {
            q: '',
            state: 'all',
            fund_id: null,
            archived: 0,
            page: 1,
            per_page: 15,
        },
        {
            queryParams: {
                q: StringParam,
                state: StringParam,
                fund_id: NumberParam,
                archived: createEnumParam(['0', '1']),
                page: NumberParam,
                per_page: NumberParam,
            },
        },
    );

    const states = useMemo(() => {
        return [
            { key: 'all', name: translate('reimbursements.states.all') },
            { key: 'pending', name: translate('reimbursements.states.pending') },
            { key: 'approved', name: translate('reimbursements.states.approved') },
            { key: 'declined', name: translate('reimbursements.states.declined') },
            { key: 'draft', name: translate('reimbursements.states.draft') },
        ];
    }, [translate]);

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list({ per_page: 100 })
            .then((res) => setFunds([{ name: 'Alle tegoeden', id: null }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [fundService, setProgress]);

    const fetchVouchers = useCallback(() => {
        setProgress(0);

        voucherService
            .list({ allow_reimbursements: 1, implementation_key: envData.client_key, per_page: 100 })
            .then((res) => setVouchers(res.data.data))
            .finally(() => setProgress(100));
    }, [voucherService, setProgress, envData]);

    const fetchReimbursements = useCallback(() => {
        setProgress(0);

        reimbursementService
            .list({
                ...filterValuesActive,
                state: filterValuesActive.archived
                    ? null
                    : filterValuesActive.state === 'all'
                      ? null
                      : filterValuesActive.state,
            })
            .then((res) => setReimbursements(res.data))
            .finally(() => setProgress(100));
    }, [setProgress, reimbursementService, filterValuesActive]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    useEffect(() => {
        if (auth2faRestricted === false) {
            fetchReimbursements();
        }
    }, [fetchReimbursements, auth2faRestricted]);

    return (
        <BlockShowcaseProfile
            contentDusk="listReimbursementsContent"
            breadcrumbItems={[
                { name: translate('reimbursements.breadcrumbs.home'), state: 'home' },
                { name: translate('reimbursements.breadcrumbs.reimbursements') },
            ]}
            filters={
                funds && (
                    <div className="form form-compact">
                        <div className="profile-aside-block">
                            <div className="form-group">
                                <label className="form-label" htmlFor="select_fund">
                                    Tegoeden
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
                                />
                            </div>
                        </div>
                    </div>
                )
            }
            profileHeader={
                (reimbursements || auth2faRestricted) &&
                (auth2faRestricted ? (
                    <></>
                ) : (
                    <div className="profile-content-header clearfix">
                        <div className="profile-content-title">
                            <div className="pull-left">
                                <div className="profile-content-title-count">{reimbursements.meta.total}</div>
                                <h1 className="profile-content-header">{translate('reimbursements.title')}</h1>
                            </div>
                        </div>
                        <div className="block block-label-tabs form pull-right">
                            {!filterValues.archived && (
                                <div className="label-tab-set">
                                    {states?.map((state) => (
                                        <div
                                            key={state.key}
                                            role="button"
                                            className={classNames(
                                                `label-tab label-tab-sm`,
                                                filterValues.state == state.key && 'active',
                                            )}
                                            onClick={() => filterUpdate({ state: state.key })}
                                            onKeyDown={clickOnKeyEnter}
                                            tabIndex={0}
                                            data-dusk={`reimbursementsFilterState${state.key}`}
                                            aria-pressed={filterValues.state == state.key}>
                                            {state.name}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="label-tab-set">
                                <div
                                    className={`label-tab label-tab-sm ${!filterValues.archived ? 'active' : ''}`}
                                    role="button"
                                    data-dusk="reimbursementsFilterActive"
                                    onClick={() => filterUpdate({ archived: 0 })}
                                    aria-pressed={!filterValues.archived}>
                                    {translate('reimbursements.types.active')}
                                </div>
                                <div
                                    className={`label-tab label-tab-sm ${filterValues.archived ? 'active' : ''}`}
                                    onClick={() => filterUpdate({ archived: 1 })}
                                    role="button"
                                    data-dusk="reimbursementsFilterArchived"
                                    aria-pressed={!!filterValues.archived}>
                                    {translate('reimbursements.types.archived')}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            }>
            {auth2faRestricted ? (
                <Auth2FARestriction
                    type="reimbursements"
                    items={auth2FAState.restrictions.reimbursements.funds}
                    itemName="name"
                    itemThumbnail="logo.sizes.thumbnail"
                    defaultThumbnail="fund-thumbnail"
                />
            ) : (
                reimbursements && (
                    <Fragment>
                        {reimbursements.data.length > 0 && (
                            <div className="block block-reimbursements" data-dusk="reimbursementsList">
                                {reimbursements?.data?.map((reimbursement) => (
                                    <ReimbursementCard
                                        key={reimbursement.id}
                                        reimbursement={reimbursement}
                                        onDelete={() => fetchReimbursements()}
                                    />
                                ))}
                            </div>
                        )}

                        {reimbursements?.data?.length > 0 && vouchers?.length > 0 && (
                            <div className="block block-action-card block-action-card-compact">
                                <div className="block-card-logo" role="img" aria-label="">
                                    <IconReimbursement />
                                </div>
                                <div className="block-card-details">
                                    <h2 className="block-card-title">
                                        {translate('reimbursements.create_card.title')}
                                    </h2>
                                </div>

                                <div className="block-card-actions">
                                    <StateNavLink name="reimbursements-create">
                                        <div className="button button-primary-outline">
                                            {translate('reimbursements.create_card.button')}
                                        </div>
                                    </StateNavLink>
                                </div>
                            </div>
                        )}

                        {reimbursements?.data?.length == 0 && (
                            <EmptyBlock
                                dataDusk="reimbursementsEmptyBlock"
                                title={translate('reimbursements.empty.title')}
                                description={translate('reimbursements.empty.description')}
                                svgIcon={'reimbursements'}
                                hideLink={true}
                                button={
                                    vouchers?.length
                                        ? {
                                              text: translate('reimbursements.empty.button'),
                                              icon: 'plus',
                                              type: 'primary',
                                              onClick: (e) => {
                                                  e?.preventDefault();
                                                  e?.stopPropagation();
                                                  navigateState('reimbursements-create');
                                              },
                                          }
                                        : null
                                }
                            />
                        )}

                        <div className="card" hidden={reimbursements?.meta?.last_page < 2}>
                            <div className="card-section">
                                <Paginator
                                    meta={reimbursements.meta}
                                    filters={filterValues}
                                    updateFilters={filterUpdate}
                                />
                            </div>
                        </div>
                    </Fragment>
                )
            )}
        </BlockShowcaseProfile>
    );
}
