import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { PaginationData } from '../../../../dashboard/props/ApiResponses';
import FundRequest from '../../../../dashboard/props/models/FundRequest';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import { useFundRequestService } from '../../../services/FundRequestService';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import { useNavigateState } from '../../../modules/state_router/Router';
import FundRequestCard from './elements/FundRequestCard';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import useFilterNext from '../../../../dashboard/modules/filter_next/useFilterNext';
import { BooleanParam, NumberParam } from 'use-query-params';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';

export default function FundRequests() {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const fundService = useFundService();
    const fundRequestService = useFundRequestService();

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [fundRequests, setFundRequests] = useState<PaginationData<FundRequest>>(null);

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{
        page: number;
        fund_id: number;
        archived: boolean;
    }>(
        {
            page: 1,
            fund_id: null,
            archived: false,
        },
        {
            queryParams: {
                page: NumberParam,
                fund_id: NumberParam,
                archived: BooleanParam,
            },
        },
    );

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list({ per_page: 100 })
            .then((res) => {
                setFunds([{ name: translate('fund_requests.filters.all_funds'), id: null }, ...res.data.data]);
            })
            .finally(() => setProgress(100));
    }, [fundService, setProgress, translate]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        setProgress(0);

        fundRequestService
            .indexRequester({
                ...filterValuesActive,
                archived: filterValuesActive?.archived ? 1 : 0,
                per_page: 15,
                order_by: 'no_answer_clarification',
            })
            .then((res) => setFundRequests(res.data))
            .finally(() => setProgress(100));
    }, [fundRequestService, filterValuesActive, setProgress]);

    return (
        <BlockShowcaseProfile
            contentDusk="listFundRequestsContent"
            breadcrumbItems={[
                { name: translate('fund_requests.breadcrumbs.home'), state: 'home' },
                { name: translate('fund_requests.breadcrumbs.fund_requests') },
            ]}
            profileHeader={
                fundRequests && (
                    <div className="profile-content-header clearfix">
                        <div className="profile-content-title">
                            <div className="pull-left">
                                <div className="profile-content-title-count">{fundRequests.meta.total}</div>
                                <h1 className="profile-content-header">{translate('fund_requests.title')}</h1>
                            </div>
                        </div>
                        <div className="block block-label-tabs form pull-right">
                            <div className="label-tab-set">
                                <div
                                    className={`label-tab label-tab-sm ${!filterValues.archived ? 'active' : ''}`}
                                    role="button"
                                    data-dusk="fundRequestsFilterActive"
                                    onClick={() => filterUpdate({ archived: false })}
                                    onKeyDown={clickOnKeyEnter}
                                    tabIndex={0}>
                                    {translate('fund_requests.filters.active')}
                                </div>
                                <div
                                    className={`label-tab label-tab-sm ${filterValues.archived ? 'active' : ''}`}
                                    role="button"
                                    data-dusk="fundRequestsFilterArchived"
                                    onClick={() => filterUpdate({ archived: true })}
                                    onKeyDown={clickOnKeyEnter}
                                    tabIndex={0}>
                                    {translate('fund_requests.filters.archive')}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
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
                                    value={filterValues.fund_id}
                                    propKey={'id'}
                                    options={funds}
                                    multiline={true}
                                    dusk="selectControlFunds"
                                    onChange={(fund_id?: number) => filterUpdate({ fund_id })}
                                />
                            </div>
                        </div>
                    </div>
                )
            }>
            {fundRequests && (
                <Fragment>
                    {fundRequests?.data?.length > 0 && (
                        <div className="block block-fund-requests">
                            {fundRequests.data.map((fundRequest) => (
                                <FundRequestCard key={fundRequest.id} fundRequest={fundRequest} />
                            ))}
                        </div>
                    )}

                    {fundRequests?.data?.length == 0 && (
                        <EmptyBlock
                            data-dusk="fundRequestsEmptyBlock"
                            title={translate('fund_requests.empty.title')}
                            description={translate('fund_requests.empty.subtitle')}
                            svgIcon={'fund-requests'}
                            hideLink={true}
                            button={{
                                text: translate('fund_requests.empty.button'),
                                icon: 'arrow-right',
                                iconEnd: true,
                                type: 'primary',
                                onClick: (e) => {
                                    e?.preventDefault();
                                    e?.stopPropagation();
                                    navigateState('funds');
                                },
                            }}
                        />
                    )}

                    <div className="card" hidden={fundRequests?.meta?.last_page < 2}>
                        <div className="card-section">
                            <Paginator meta={fundRequests.meta} filters={filterValues} updateFilters={filterUpdate} />
                        </div>
                    </div>
                </Fragment>
            )}
        </BlockShowcaseProfile>
    );
}
