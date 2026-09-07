import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useNavigateState } from '../../../modules/state_router/Router';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useEnvData from '../../../hooks/useEnvData';
import useAppConfigs from '../../../hooks/useAppConfigs';
import Fund from '../../../props/models/Fund';
import Voucher from '../../../../dashboard/props/models/Voucher';
import { useFundService } from '../../../services/FundService';
import { PaginationData, ResponseError, ResponseErrorData } from '../../../../dashboard/props/ApiResponses';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import CmsBlocksNext from '../../elements/cms-blocks-next/CmsBlocksNext';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import { useVoucherService } from '../../../services/VoucherService';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import useSetTitle from '../../../hooks/useSetTitle';
import BlockShowcaseList from '../../elements/block-showcase/BlockShowcaseList';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import usePayoutTransactionService from '../../../services/PayoutTransactionService';
import PayoutTransaction from '../../../../dashboard/props/models/PayoutTransaction';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';
import useLatestRequestWithProgress from '../../../../dashboard/hooks/useLatestRequestWithProgress';
import FundsListItem from '../../elements/lists/funds-list/templates/FundsListItem';
import useFundsPageFilters from './hooks/useFundsPageFilters';
import type { FundsPageType } from './hooks/useFundsPageFilters';
import FundsSidebarFilters from './elements/FundsSidebarFilters';
import Markdown from '../../elements/markdown/Markdown';
import Section from '../../elements/sections/Section';

export default function Funds({ pageType }: { pageType: FundsPageType }) {
    const envData = useEnvData();
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();

    const setTitle = useSetTitle();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();
    const runLatestRequest = useLatestRequestWithProgress();

    const fundService = useFundService();
    const voucherService = useVoucherService();
    const payoutTransactionService = usePayoutTransactionService();

    const [errors, setErrors] = useState<ResponseErrorData>({});
    const [funds, setFunds] = useState<PaginationData<Fund> & { searchQuery: string }>(null);
    const [payouts, setPayouts] = useState<Array<PayoutTransaction>>(null);
    const [vouchers, setVouchers] = useState<Array<Voucher>>(null);

    const {
        countFiltersApplied,
        filter,
        filterUpdate,
        filterValues,
        initialFilterValues,
        fundsQuery,
        showPartnersPage,
        tags,
        organizations,
    } = useFundsPageFilters(pageType);

    const partnerDescription =
        pageType === 'partners' && envData
            ? translate(
                  `funds.partners.${envData.client_key}.description`,
                  {},
                  'funds.header.partners_description',
              ).trim()
            : '';

    const fetchFunds = useCallback(
        (query: typeof fundsQuery) => {
            setErrors(null);
            setFunds(null);

            runLatestRequest((config) => fundService.list({ ...query, with_external: 1, check_criteria: 1 }, config), {
                onSuccess: (res) => setFunds({ ...res.data, searchQuery: query.q }),
                onError: (e: ResponseError) => setErrors(e.data?.errors),
            });
        },
        [fundService, runLatestRequest],
    );

    const fetchVouchers = useCallback(() => {
        setProgress(0);

        voucherService
            .list({})
            .then((res) => setVouchers(res.data.data))
            .finally(() => setProgress(100));
    }, [voucherService, setProgress]);

    const fetchPayouts = useCallback(() => {
        setProgress(0);

        payoutTransactionService
            .list()
            .then((res) => setPayouts(res.data.data))
            .finally(() => setProgress(100));
    }, [setProgress, payoutTransactionService]);

    useEffect(() => {
        if (authIdentity) {
            fetchPayouts();
            fetchVouchers();
        } else {
            setPayouts([]);
            setVouchers([]);
        }
    }, [authIdentity, fetchPayouts, fetchVouchers]);

    useEffect(() => {
        if (!appConfigs.funds.list) {
            return navigateState(WebshopRoutes.HOME);
        }

        if (pageType === 'partners' && !showPartnersPage) {
            return navigateState(WebshopRoutes.FUNDS);
        }
    }, [appConfigs.funds.list, navigateState, pageType, showPartnersPage]);

    useEffect(() => {
        if (pageType === 'partners' && !showPartnersPage) {
            return;
        }

        fetchFunds(fundsQuery);
    }, [fetchFunds, fundsQuery, pageType, showPartnersPage]);

    useEffect(() => {
        if (envData?.client_key == 'vergoedingen') {
            setTitle(translate('custom_page_state_titles.vergoedingen.funds'));
        }
    }, [envData, setTitle, translate]);

    return (
        <BlockShowcaseList
            dusk="listFundsContent"
            countFiltersApplied={countFiltersApplied}
            breadcrumbItems={[
                { name: translate(`funds.breadcrumbs.home`), state: WebshopRoutes.HOME },
                {
                    name:
                        pageType === 'funds'
                            ? translate(`funds.funds.${envData.client_key}.title`, {}, 'funds.header.title')
                            : translate(
                                  `funds.partners.${envData.client_key}.title`,
                                  {},
                                  'funds.header.partners_title',
                              ),
                },
            ]}
            aside={
                <FundsSidebarFilters
                    errors={errors}
                    filter={filter}
                    filterValues={filterValues}
                    filterUpdate={filterUpdate}
                    tags={tags}
                    organizations={organizations}
                    initialFilterValues={initialFilterValues}
                />
            }>
            {envData && appConfigs && funds && (!authIdentity || vouchers) && (
                <Fragment>
                    <div className="showcase-content-header">
                        <h1 className="showcase-filters-title">
                            {pageType === 'funds' &&
                                translate(`funds.funds.${envData.client_key}.title`, {}, 'funds.header.title')}

                            {pageType === 'partners' &&
                                translate(
                                    `funds.partners.${envData.client_key}.title`,
                                    {},
                                    'funds.header.partners_title',
                                )}
                            <div className="showcase-filters-title-count" data-nosnippet="true">
                                {funds?.meta?.total}
                            </div>
                        </h1>
                    </div>

                    {pageType === 'funds' && appConfigs.pages.funds && (
                        <Fragment>
                            <CmsBlocksNext page={appConfigs.pages.funds} />
                            <CmsBlocks page={appConfigs.pages.funds} />
                        </Fragment>
                    )}

                    {partnerDescription && (
                        <Section type={'cms'}>
                            <div className="block block-cms">
                                <Markdown content={partnerDescription} />
                            </div>
                        </Section>
                    )}

                    {funds?.data?.length > 0 && (
                        <div className="block block-funds" id="funds_list" data-search-query={funds.searchQuery}>
                            {funds?.data.map((fund) => (
                                <FundsListItem
                                    key={fund.id}
                                    fund={fund}
                                    funds={funds.data}
                                    vouchers={vouchers || []}
                                    payouts={payouts}
                                    forceShowImage={pageType === 'partners'}
                                />
                            ))}
                        </div>
                    )}

                    {funds?.data?.length == 0 && (
                        <EmptyBlock
                            title={translate('block_funds.labels.title')}
                            description={translate('block_funds.labels.subtitle')}
                            svgIcon="reimbursements"
                            hideLink={true}
                        />
                    )}

                    <div className="card" hidden={funds?.meta?.last_page < 2}>
                        <div className="card-section">
                            <Paginator
                                meta={funds.meta}
                                filters={filterValues}
                                count-buttons={5}
                                updateFilters={filterUpdate}
                            />
                        </div>
                    </div>
                </Fragment>
            )}
        </BlockShowcaseList>
    );
}
