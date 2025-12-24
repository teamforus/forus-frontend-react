import React, { Fragment, useCallback, useEffect, useState } from 'react';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
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
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';
import UIControlText from '../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import useEnvData from '../../../hooks/useEnvData';
import { useVoucherService } from '../../../services/VoucherService';
import Voucher from '../../../../dashboard/props/models/Voucher';
import usePayoutEligibleVouchers from '../vouchers-show/hooks/usePayoutEligibleVouchers';
import useOpenModal from '../../../../dashboard/hooks/useOpenModal';
import ModalVoucherPayout from '../../modals/ModalVoucherPayout';
import IconPayout from '../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-payout.svg';

export default function Payouts() {
    const envData = useEnvData();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();
    const openModal = useOpenModal();

    const payoutTransactionService = usePayoutTransactionService();
    const voucherService = useVoucherService();

    const [payouts, setPayoutTransactions] = useState<PaginationData<PayoutTransaction>>(null);
    const [vouchers, setVouchers] = useState<Array<Voucher>>(null);
    const payoutEligibleVouchers = usePayoutEligibleVouchers(vouchers);

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

    const fetchVouchers = useCallback(() => {
        setProgress(0);

        voucherService
            .list({ implementation_key: envData.client_key, per_page: 100, state: 'active', type: 'regular' })
            .then((res) => setVouchers(res.data.data))
            .finally(() => setProgress(100));
    }, [envData.client_key, setProgress, voucherService]);

    const openPayoutModal = useCallback(() => {
        openModal((modal) => (
            <ModalVoucherPayout modal={modal} vouchers={payoutEligibleVouchers} onCreated={() => fetchTransactions()} />
        ));
    }, [fetchTransactions, openModal, payoutEligibleVouchers]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    return (
        <BlockShowcaseProfile
            contentDusk="listPayoutsContent"
            breadcrumbItems={[
                { name: translate('payouts.breadcrumbs.home'), state: WebshopRoutes.HOME },
                { name: translate('payouts.breadcrumbs.payouts') },
            ]}
            profileHeader={
                payouts && (
                    <div className="profile-content-header clearfix">
                        <div className="profile-content-title">
                            <div className="pull-left">
                                <div className="profile-content-title-count">{payouts.meta.total}</div>
                                <h1 className="profile-content-header">{translate('payouts.title')}</h1>
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
                                <label className="form-label" htmlFor="payouts_search">
                                    {translate('payouts.search')}
                                </label>

                                <UIControlText
                                    id="payouts_search"
                                    value={filterValues.q}
                                    onChangeValue={(q) => filterUpdate({ q })}
                                    dataDusk="listPayoutsSearch"
                                    ariaLabel={translate('payouts.search')}
                                    placeholder={translate('payouts.search')}
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

                    {payouts?.data?.length > 0 && payoutEligibleVouchers?.length > 0 && (
                        <div
                            className="block block-action-card block-action-card-compact"
                            data-dusk="payoutsCreateCard">
                            <div className="block-card-logo" role="img" aria-label="">
                                <IconPayout />
                            </div>
                            <div className="block-card-details">
                                <h2 className="block-card-title">{translate('payouts.create_card.title')}</h2>
                                <div className="block-card-description">
                                    {translate('payouts.create_card.description')}
                                </div>
                            </div>

                            <div className="block-card-actions">
                                <button
                                    className="button button-primary-outline"
                                    type="button"
                                    data-dusk="payoutsCreateButton"
                                    onClick={openPayoutModal}>
                                    {translate('payouts.create_card.button')}
                                </button>
                            </div>
                        </div>
                    )}

                    {payouts?.data?.length == 0 && (
                        <EmptyBlock
                            title={translate('payouts.empty.title')}
                            description={translate('payouts.empty.subtitle')}
                            svgIcon={'payouts'}
                            hideLink={true}
                            dataDusk="payoutsEmptyBlock"
                            button={{
                                text:
                                    payoutEligibleVouchers?.length > 0
                                        ? translate('payouts.empty.button_payout')
                                        : translate('payouts.empty.button'),
                                icon: payoutEligibleVouchers?.length > 0 ? 'plus' : 'arrow-right',
                                iconEnd: payoutEligibleVouchers?.length <= 0,
                                type: 'primary',
                                onClick: (e) => {
                                    e?.preventDefault();
                                    e?.stopPropagation();

                                    if (payoutEligibleVouchers?.length > 0) {
                                        openPayoutModal();
                                        return;
                                    }

                                    navigateState(WebshopRoutes.FUNDS);
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
