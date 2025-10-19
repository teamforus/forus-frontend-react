import React, { useCallback, useEffect, useState } from 'react';
import Organization from '../../../../props/models/Organization';
import Paginator from '../../../../modules/paginator/components/Paginator';
import Fund from '../../../../props/models/Fund';
import useProviderFundService from '../../../../services/ProviderFundService';
import useSetProgress from '../../../../hooks/useSetProgress';
import { PaginationData } from '../../../../props/ApiResponses';
import Tag from '../../../../props/models/Tag';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import UIControlCheckbox from '../../../elements/forms/ui-controls/UIControlCheckbox';
import EmptyCard from '../../../elements/empty-card/EmptyCard';
import useTranslate from '../../../../hooks/useTranslate';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import { FilterModel } from '../../../../modules/filter_next/types/FilterParams';

type FundLocal = Fund & { applied?: boolean };

export default function SignUpAvailableFunds({
    organization,
    externalFilters,
    onApply,
}: {
    organization: Organization;
    externalFilters?: FilterModel;
    onApply: () => void;
}) {
    const translate = useTranslate();

    const [tags, setTags] = useState<Array<Partial<Tag>>>([]);
    const [organizations, setOrganizations] = useState<Array<Partial<Organization>>>([]);

    const [funds, setFunds] = useState<PaginationData<FundLocal>>(null);
    const [selected, setSelected] = useState([]);

    const setProgress = useSetProgress();
    const providerFundService = useProviderFundService();
    const assetUrl = useAssetUrl();

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{
        q?: string;
        page?: number;
        tag?: string;
        per_page?: number;
        organization_id?: number;
    }>({
        q: '',
        page: 1,
        tag: null,
        per_page: 5,
        organization_id: null,
        ...(externalFilters || {}),
    });

    const toggleAll = (e: React.MouseEvent, items: Array<Fund> = []) => {
        e?.stopPropagation();
        setSelected(selected.length === items.length ? [] : items.map((item) => item.id));
    };

    const toggle = (e: React.ChangeEvent, item: Fund) => {
        e?.stopPropagation();

        setSelected((selected) => {
            return selected.includes(item.id) ? selected.filter((id) => id !== item.id) : [...selected, item.id];
        });
    };

    const fetchAvailableFunds = useCallback(
        (organization: Organization, query: object) => {
            if (!organization) {
                return;
            }

            return providerFundService.listAvailableFunds(organization.id, query);
        },
        [providerFundService],
    );

    const applyFunds = useCallback(
        (fund = null) => {
            setProgress(0);

            const fundsList = fund ? [fund] : funds.data.filter((fund) => selected.includes(fund.id));
            const promises = fundsList.map((fund) => providerFundService.applyForFund(organization.id, fund.id));

            Promise.all(promises)
                .then(() => {
                    onApply?.();
                    fundsList.forEach((fund) => (fund.applied = true));
                    setSelected([]);
                })
                .finally(() => setProgress(100));
        },
        [funds?.data, onApply, organization?.id, providerFundService, selected, setProgress],
    );

    useEffect(() => {
        setProgress(0);

        fetchAvailableFunds(organization, filterValuesActive)
            ?.then((res) => {
                setFunds(res.data);

                const allTags = { key: null, name: translate('provider_funds.filters.options.all_labels') };
                const allOrganizations = {
                    id: null,
                    name: translate('provider_funds.filters.options.all_organizations'),
                };

                setTags((tags) => {
                    return tags.length > 0 ? tags : [allTags, ...res.data.meta.tags];
                });

                setOrganizations((organizations) => {
                    return organizations.length > 0
                        ? organizations
                        : [allOrganizations, ...res.data.meta.organizations];
                });
            })
            .finally(() => setProgress(100));
    }, [fetchAvailableFunds, filterValuesActive, organization, setProgress, translate]);

    return (
        <div className="sign_up-funds-card">
            {!externalFilters?.fund_id && !externalFilters?.organization_id && !externalFilters.tag && (
                <div className="sign_up-funds-section">
                    <div className="form">
                        <div className="row">
                            <div className="form-group col col-lg-6 col-xs-12">
                                <label className="form-label">
                                    {translate('sign_up_provider.filters.labels.organizations')}
                                </label>
                                <select
                                    className="form-control"
                                    value={filterValues.organization_id || ''}
                                    onChange={(e) => {
                                        filterUpdate({ organization_id: parseInt(e.target.value) || null });
                                    }}>
                                    {organizations.map((organization) => (
                                        <option key={organization.id} value={organization.id}>
                                            {organization.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group col col-lg-6 col-xs-12">
                                <label className="form-label">
                                    {translate('sign_up_provider.filters.labels.tags')}
                                </label>
                                <select
                                    className="form-control"
                                    value={filterValues.tag || ''}
                                    onChange={(e) => {
                                        filterUpdate({ tag: e.target.value === 'all' ? null : e.target.value });
                                    }}>
                                    {tags.map((tag) => (
                                        <option key={tag.key || 'all'} value={tag.key || 'all'}>
                                            {tag.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="sign_up-funds-section">
                <div className="card-header card-header-no-line">
                    <div className="flex">
                        <div className="flex flex-grow">
                            <div className="card-title">
                                <span>{translate('sign_up_provider.funds.title')}</span>
                                {selected?.length > 0 ? (
                                    <span className="total-count">{`${selected.length}/${funds?.data.length}`}</span>
                                ) : (
                                    <span className="total-count">{funds?.meta.total}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex">
                            <div className="block block-inline-filters">
                                {selected.length > 0 && (
                                    <div className="button button-primary" onClick={() => applyFunds()}>
                                        {translate('sign_up_provider.buttons.join')}
                                    </div>
                                )}

                                {selected.length !== funds?.data.length && (
                                    <div
                                        className="button button-secondary button-sm"
                                        onClick={(e) => toggleAll(e, funds.data)}>
                                        {translate('sign_up_provider.buttons.select_all')}
                                    </div>
                                )}

                                {selected.length === funds?.data.length && (
                                    <div
                                        className="button button-secondary button-sm"
                                        onClick={(e) => toggleAll(e, funds.data)}>
                                        {translate('sign_up_provider.buttons.deselect_all')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {funds?.data.map((fund) => (
                    <div className="card" key={fund.id}>
                        <div
                            className={`card-section card-section-fund ${fund.applied ? 'applied' : ''} ${
                                selected[fund.id] ? 'selected' : ''
                            }`}>
                            <div className="card-block-checkbox">
                                <UIControlCheckbox
                                    className="ui-control-checkbox-primary"
                                    checked={selected.includes(fund.id)}
                                    onChange={(e) => toggle(e, fund)}
                                />
                            </div>
                            <div className="card-block card-block-fund">
                                <div className="fund-img">
                                    <img
                                        src={
                                            fund?.logo?.sizes?.thumbnail ||
                                            assetUrl('/assets/img/placeholders/organization-thumbnail.png')
                                        }
                                        alt=""
                                    />
                                </div>
                                <div className="fund-details">
                                    <div className="fund-title">{fund.name}</div>
                                    <div className="fund-organization">{fund.organization.name}</div>
                                </div>
                            </div>
                            <div className="card-section-actions">
                                <button className="button button-primary button-sm" onClick={() => applyFunds(fund)}>
                                    {translate(
                                        fund.applied
                                            ? 'fund_card_provider_finances.status.hold'
                                            : 'sign_up_provider.buttons.join',
                                    )}
                                </button>
                            </div>
                        </div>
                        {fund?.implementation?.url_provider_terms_page && (
                            <div className="card-section">
                                <div className="card-text">
                                    Door u aan te melden gaat u akkoord met de{' '}
                                    <a
                                        className="card-text-link"
                                        href={fund.implementation.url_provider_terms_page}
                                        target="_blank"
                                        rel="noreferrer">
                                        algemene voorwaarden
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {funds?.meta && (
                    <div className="card-section" hidden={funds?.meta?.last_page == 1}>
                        <Paginator meta={funds.meta} filters={filterValues} updateFilters={filterUpdate} />
                    </div>
                )}

                {funds?.meta?.total == 0 && (
                    <EmptyCard title="Er zijn momenteel geen actieve fondsen." type={'card-section'} />
                )}
            </div>
        </div>
    );
}
