import React, { Fragment, useCallback, useEffect, useState } from 'react';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import { useNavigateState } from '../../../modules/state_router/Router';
import { PaginationData } from '../../../../dashboard/props/ApiResponses';
import usePayoutTransactionService from '../../../services/PayoutTransactionService';
import PayoutTransaction from '../../../../dashboard/props/models/PayoutTransaction';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import useFilterNext from '../../../../dashboard/modules/filter_next/useFilterNext';
import PayoutCard from './elements/PayoutCard';

export default function Payouts() {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const payoutTransactionService = usePayoutTransactionService();

    const [payouts, setPayoutTransactions] = useState<PaginationData<PayoutTransaction>>(null);

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{ q: string }>(
        { q: '' },
        { throttledValues: ['q'] },
    );

    const fetchTransactions = useCallback(() => {
        setProgress(0);

        payoutTransactionService
            .list(filterValuesActive)
            .then((res) => setPayoutTransactions(res.data))
            .finally(() => setProgress(100));
    }, [setProgress, payoutTransactionService, filterValuesActive]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return (
        <BlockShowcaseProfile
            breadcrumbs={
                <div className="block block-breadcrumbs">
                    <StateNavLink name={'home'} className="breadcrumb-item">
                        Home
                    </StateNavLink>
                    <div className="breadcrumb-item active" aria-current="location">
                        {translate('payouts.header.title')}
                    </div>
                </div>
            }
            profileHeader={
                payouts && (
                    <div className="profile-content-header clearfix">
                        <div className="profile-content-title">
                            <div className="pull-left">
                                <div className="profile-content-title-count">{payouts.meta.total}</div>
                                <h1 className="profile-content-header">{translate('payouts.header.title')}</h1>
                            </div>
                        </div>
                    </div>
                )
            }
            filters={
                payouts && (
                    <div className="form form-compact">
                        <div className="profile-aside-block">
                            <div className="form-group">
                                <input
                                    type="text"
                                    className={'form-control'}
                                    value={filterValues.q}
                                    onChange={(e) => filterUpdate({ q: e.target.value })}
                                    placeholder={translate('payouts.header.search_placeholder')}
                                />
                            </div>
                        </div>
                    </div>
                )
            }>
            {payouts && (
                <Fragment>
                    {payouts?.data?.length > 0 && (
                        <div className="block block-payouts-list">
                            {payouts.data.map((payoutTransaction, index) => (
                                <PayoutCard key={index} payout={payoutTransaction} />
                            ))}
                        </div>
                    )}

                    {payouts?.data?.length == 0 && (
                        <EmptyBlock
                            title={translate('payouts.empty_block.title')}
                            description={translate('payouts.empty_block.subtitle')}
                            svgIcon={'payouts'}
                            hideLink={true}
                            button={{
                                text: translate('payouts.empty_block.cta'),
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

                    <div className="card" hidden={payouts?.meta?.last_page < 2}>
                        <div className="card-section">
                            <Paginator meta={payouts.meta} filters={filterValues} updateFilters={filterUpdate} />
                        </div>
                    </div>
                </Fragment>
            )}
        </BlockShowcaseProfile>
    );
}
