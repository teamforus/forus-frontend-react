import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigateState } from '../../../modules/state_router/Router';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useEnvData from '../../../hooks/useEnvData';
import useAppConfigs from '../../../hooks/useAppConfigs';
import Tag from '../../../../dashboard/props/models/Tag';
import Fund from '../../../props/models/Fund';
import Voucher from '../../../../dashboard/props/models/Voucher';
import Organization from '../../../../dashboard/props/models/Organization';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import { useFundService } from '../../../services/FundService';
import { useTagService } from '../../../../dashboard/services/TagService';
import useFilter from '../../../../dashboard/hooks/useFilter';
import { PaginationData } from '../../../../dashboard/props/ApiResponses';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import { useOrganizationService } from '../../../../dashboard/services/OrganizationService';
import FundsListItem from '../../elements/lists/funds-list/FundsListItem';
import { useVoucherService } from '../../../services/VoucherService';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import useSetTitle from '../../../hooks/useSetTitle';
import BlockShowcaseList from '../../elements/block-showcase/BlockShowcaseList';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import UIControlText from '../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import usePayoutTransactionService from '../../../services/PayoutTransactionService';
import PayoutTransaction from '../../../../dashboard/props/models/PayoutTransaction';

export default function Funds() {
    const envData = useEnvData();
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();

    const setTitle = useSetTitle();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const tagService = useTagService();
    const fundService = useFundService();
    const voucherService = useVoucherService();
    const organizationService = useOrganizationService();
    const payoutTransactionService = usePayoutTransactionService();

    const [tags, setTags] = useState<Array<Partial<Tag>>>(null);
    const [funds, setFunds] = useState<PaginationData<Fund>>(null);
    const [payouts, setPayouts] = useState<Array<PayoutTransaction>>(null);
    const [vouchers, setVouchers] = useState<Array<Voucher>>(null);
    const [organizations, setOrganizations] = useState<Array<Partial<Organization>>>(null);

    const filter = useFilter({
        q: '',
        tag_id: null,
        organization_id: null,
        per_page: 10,
        with_external: 1,
        check_criteria: 1,
        order_by: 'order',
        order_dir: 'asc',
    });

    const countFiltersApplied = useMemo(() => {
        let count = 0;

        if (filter.values.q) {
            count++;
        }

        if (filter.values.tag_id) {
            count++;
        }

        if (filter.values.organization_id) {
            count++;
        }

        return count;
    }, [filter.values.organization_id, filter.values.q, filter.values.tag_id]);

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list(filter.activeValues)
            .then((res) => setFunds(res.data))
            .finally(() => setProgress(100));
    }, [filter.activeValues, fundService, setProgress]);

    const fetchTags = useCallback(() => {
        setProgress(0);

        tagService
            .list({ type: 'funds', per_page: 1000 })
            .then((res) => setTags([{ id: null, name: translate('funds.filters.all_tags') }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [tagService, setProgress, translate]);

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

    const fetchOrganizations = useCallback(() => {
        setProgress(0);

        organizationService
            .list({ type: 'sponsor' })
            .then((res) =>
                setOrganizations([{ id: null, name: translate('funds.filters.all_organizations') }, ...res.data.data]),
            )
            .finally(() => setProgress(100));
    }, [organizationService, setProgress, translate]);

    useEffect(() => {
        fetchTags();
        fetchOrganizations();
    }, [fetchTags, fetchVouchers, fetchOrganizations]);

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
            return navigateState('home');
        }
    }, [appConfigs.funds.list, navigateState]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

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
                { name: translate(`funds.breadcrumbs.home`), state: 'home' },
                { name: translate(`funds.funds.${envData.client_key}.title`, {}, 'funds.header.title') },
            ]}
            aside={
                organizations &&
                tags && (
                    <div className="showcase-aside-block">
                        <div className="form-group">
                            <label className="form-label" htmlFor="search">
                                {translate('funds.labels.search')}
                            </label>
                            <UIControlText
                                id="search"
                                value={filter.values.q}
                                onChangeValue={(q) => filter.update({ q })}
                                ariaLabel="Zoeken"
                                dataDusk="listFundsSearch"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" id="select_organization_label" htmlFor="select_organization">
                                {translate('funds.labels.organization')}
                            </label>
                            <SelectControl
                                id="select_organization"
                                propKey={'id'}
                                value={filter.values.organization_id}
                                allowSearch={true}
                                onChange={(organization_id: number) => filter.update({ organization_id })}
                                options={organizations || []}
                                multiline={true}
                                ariaLabelledby="select_organization_label"
                                dusk="selectControlOrganizations"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" id="select_category_label" htmlFor="select_category">
                                {translate('funds.labels.category')}
                            </label>
                            <SelectControl
                                id="select_category"
                                propKey={'id'}
                                value={filter.values.tag_id}
                                allowSearch={true}
                                onChange={(tag_id: number) => filter.update({ tag_id })}
                                options={tags || []}
                                multiline={true}
                                ariaLabelledby="select_category_label"
                                dusk="selectControlTags"
                            />
                        </div>
                    </div>
                )
            }>
            {envData && appConfigs && funds && (!authIdentity || vouchers) && (
                <Fragment>
                    <div className="showcase-content-header">
                        <h1 className="showcase-filters-title">
                            {translate(`funds.funds.${envData.client_key}.title`, {}, 'funds.header.title')}
                            <div className="showcase-filters-title-count" data-nosnippet="true">
                                {funds?.meta?.total}
                            </div>
                        </h1>
                    </div>

                    {appConfigs.pages.funds && <CmsBlocks page={appConfigs.pages.funds} />}

                    {funds?.data?.length > 0 && (
                        <div className="block block-funds-list" id="funds_list">
                            {funds?.data.map((fund) => (
                                <FundsListItem
                                    key={fund.id}
                                    display={'list'}
                                    fund={fund}
                                    funds={funds.data}
                                    vouchers={vouchers || []}
                                    payouts={payouts}
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
                                filters={filter.values}
                                count-buttons={5}
                                updateFilters={filter.update}
                            />
                        </div>
                    </div>
                </Fragment>
            )}
        </BlockShowcaseList>
    );
}
