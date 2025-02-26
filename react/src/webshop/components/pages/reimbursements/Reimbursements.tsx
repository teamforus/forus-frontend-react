import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import useFilter from '../../../../dashboard/hooks/useFilter';
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

    const filters = useFilter({
        fund_id: null,
        archived: 0,
        state: 'all',
    });

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
                ...filters.activeValues,
                state: filters.activeValues.archived
                    ? null
                    : filters.activeValues.state === 'all'
                      ? null
                      : filters.activeValues.state,
            })
            .then((res) => setReimbursements(res.data))
            .finally(() => setProgress(100));
    }, [setProgress, reimbursementService, filters.activeValues]);

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
                                    value={filters.values.fund_id}
                                    options={funds}
                                    multiline={true}
                                    allowSearch={true}
                                    onChange={(fund_id?: number) => filters.update({ fund_id })}
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
                            {!filters.values.archived && (
                                <div className="label-tab-set">
                                    {states?.map((state) => (
                                        <div
                                            key={state.key}
                                            role="button"
                                            className={classNames(
                                                `label-tab label-tab-sm`,
                                                filters.values.state == state.key && 'active',
                                            )}
                                            onClick={() => filters.update({ state: state.key })}
                                            onKeyDown={clickOnKeyEnter}
                                            tabIndex={0}
                                            aria-pressed={filters.values.state == state.key}>
                                            {state.name}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="label-tab-set">
                                <div
                                    className={`label-tab label-tab-sm ${!filters.values.archived ? 'active' : ''}`}
                                    role="button"
                                    data-dusk="reimbursementsFilterActive"
                                    onClick={() => filters.update({ archived: 0 })}
                                    aria-pressed={!filters.values.archived}>
                                    {translate('reimbursements.types.active')}
                                </div>
                                <div
                                    className={`label-tab label-tab-sm ${filters.values.archived ? 'active' : ''}`}
                                    onClick={() => filters.update({ archived: 1 })}
                                    role="button"
                                    data-dusk="reimbursementsFilterArchived"
                                    aria-pressed={!!filters.values.archived}>
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
                                    filters={filters.values}
                                    updateFilters={filters.update}
                                />
                            </div>
                        </div>
                    </Fragment>
                )
            )}
        </BlockShowcaseProfile>
    );
}
