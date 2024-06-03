import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigateState } from '../../../modules/state_router/Router';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useEnvData from '../../../hooks/useEnvData';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useAppConfigs from '../../../hooks/useAppConfigs';
import Tag from '../../../../dashboard/props/models/Tag';
import Fund from '../../../props/models/Fund';
import Voucher from '../../../../dashboard/props/models/Voucher';
import Organization from '../../../../dashboard/props/models/Organization';
import UIControlSearch from '../../../../dashboard/components/elements/forms/ui-controls/UIControlSearch';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import SelectControlOptions from '../../../../dashboard/components/elements/select-control/templates/SelectControlOptions';
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
import BlockShowcasePage from '../../elements/block-showcase/BlockShowcasePage';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';

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

    const [tags, setTags] = useState<Array<Partial<Tag>>>(null);
    const [funds, setFunds] = useState<PaginationData<Fund>>(null);
    const [vouchers, setVouchers] = useState<Array<Voucher>>(null);
    const [organizations, setOrganizations] = useState<Array<Partial<Organization>>>(null);

    const filter = useFilter({
        q: '',
        tag_id: null,
        organization_id: null,
        per_page: 10,
        with_external: 1,
        check_criteria: 1,
    });

    const countFiltersApplied = useMemo(() => {
        let count = 0;

        filter.values.q && count++;
        filter.values.tag_id && count++;
        filter.values.organization_id && count++;

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
            .then((res) => setTags([{ id: null, name: 'Alle categorieën' }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [tagService, setProgress]);

    const fetchVouchers = useCallback(() => {
        setProgress(0);

        voucherService
            .list({})
            .then((res) => setVouchers(res.data.data))
            .finally(() => setProgress(100));
    }, [voucherService, setProgress]);

    const fetchOrganizations = useCallback(() => {
        setProgress(0);

        organizationService
            .list({ implementation: 1, is_employee: 0 })
            .then((res) => setOrganizations([{ id: null, name: 'Alle organisaties' }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [organizationService, setProgress]);

    useEffect(() => {
        fetchTags();
        fetchOrganizations();
    }, [fetchTags, fetchVouchers, fetchOrganizations]);

    useEffect(() => {
        authIdentity ? fetchVouchers() : setVouchers(null);
    }, [authIdentity, fetchVouchers]);

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
            setTitle('Vergoedingen');
        }
    }, [envData, setTitle]);

    return (
        <BlockShowcasePage
            countFiltersApplied={countFiltersApplied}
            breadcrumbs={
                <div className="block block-breadcrumbs">
                    <StateNavLink name={'home'} className="breadcrumb-item">
                        Home
                    </StateNavLink>
                    <div className="breadcrumb-item active">
                        {translate(`funds.funds.${envData.client_key}.title`, {}, 'funds.header.title')}
                    </div>
                </div>
            }
            aside={
                organizations &&
                tags && (
                    <div className="showcase-aside-block">
                        <div className="form-group">
                            <UIControlSearch
                                id="search"
                                value={filter.values.q}
                                onChangeValue={(q) => filter.update({ q })}
                                placeholder="Zoeken..."
                                ariaLabel="Zoeken"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="select_organization">
                                Organisatie
                            </label>
                            <SelectControl
                                optionsComponent={SelectControlOptions}
                                propKey={'id'}
                                value={filter.values.organization_id}
                                allowSearch={true}
                                onChange={(organization_id: number) => filter.update({ organization_id })}
                                options={organizations || []}
                                placeholder={organizations?.[0]?.name}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="select_category">
                                Categorie
                            </label>
                            <SelectControl
                                optionsComponent={SelectControlOptions}
                                propKey={'id'}
                                value={filter.values.tag_id}
                                allowSearch={true}
                                onChange={(tag_id: number) => filter.update({ tag_id })}
                                options={tags || []}
                                placeholder={tags?.[0]?.name}
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
                            <div className="showcase-filters-title-count">{funds?.meta?.total}</div>
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
                                buttonClass={'button-primary-outline'}
                            />
                        </div>
                    </div>
                </Fragment>
            )}
        </BlockShowcasePage>
    );
}
