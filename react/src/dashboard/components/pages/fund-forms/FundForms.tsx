import React, { useCallback, useEffect, useState } from 'react';
import { PaginationData } from '../../../props/ApiResponses';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useSetProgress from '../../../hooks/useSetProgress';
import ClickOutside from '../../elements/click-outside/ClickOutside';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import useImplementationService from '../../../services/ImplementationService';
import Implementation from '../../../props/models/Implementation';
import { strLimit } from '../../../helpers/string';
import TableRowActions from '../../elements/tables/TableRowActions';
import Paginator from '../../../modules/paginator/components/Paginator';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import useTranslate from '../../../hooks/useTranslate';
import TableEmptyValue from '../../elements/table-empty-value/TableEmptyValue';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import useConfigurableTable from '../vouchers/hooks/useConfigurableTable';
import TableEntityMain from '../../elements/tables/elements/TableEntityMain';
import usePushApiError from '../../../hooks/usePushApiError';
import BlockLabelTabs from '../../elements/block-label-tabs/BlockLabelTabs';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { useFundFormService } from '../../../services/FundFormService';
import FundForm from '../../../props/models/FundForm';
import FundFormStateLabels from '../../elements/resource-states/FundFormStateLabels';
import TableDateTime from '../../elements/tables/elements/TableDateTime';
import { NumberParam, StringParam } from 'use-query-params';

export default function FundForms() {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();
    const pushApiError = usePushApiError();

    const fundFormService = useFundFormService();
    const paginatorService = usePaginatorService();
    const implementationService = useImplementationService();

    const [loading, setLoading] = useState(false);
    const [paginatorKey] = useState<string>('organization_fund_forms');
    const [implementations, setImplementations] = useState<Array<Partial<Implementation>>>(null);
    const [fundForms, setFundForms] = useState<PaginationData<FundForm>>(null);

    const [statesOptions] = useState([
        { value: null, label: `Alle` },
        { value: 'active', label: `Actief` },
        { value: 'archived', label: `Archief` },
    ]);

    const { headElement, configsElement } = useConfigurableTable(fundFormService.getColumns());

    const [filterValues, filterActiveValues, filterUpdate, filter] = useFilterNext<{
        q: string;
        state: string;
        implementation_id: number;
        per_page: number;
        page: number;
    }>(
        {
            q: '',
            page: 1,
            state: null,
            implementation_id: null,
            per_page: paginatorService.getPerPage(paginatorKey),
        },
        {
            throttledValues: ['q'],
            queryParams: {
                q: StringParam,
                state: StringParam,
                page: NumberParam,
                per_page: NumberParam,
                implementation_id: NumberParam,
            },
        },
    );

    const fetchFunds = useCallback(() => {
        setProgress(0);
        setLoading(true);

        fundFormService
            .list(activeOrganization.id, filterActiveValues)
            .then((res) => setFundForms(res.data))
            .catch(pushApiError)
            .finally(() => {
                setProgress(100);
                setLoading(false);
            });
    }, [activeOrganization.id, filterActiveValues, fundFormService, setProgress, pushApiError]);

    const fetchImplementations = useCallback(() => {
        setProgress(0);

        implementationService
            .list(activeOrganization.id, { per_page: 100 })
            .then((res) => setImplementations([{ id: null, name: 'Alle implementaties' }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, implementationService, setProgress]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        fetchImplementations();
    }, [fetchImplementations]);

    if (!fundForms) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow" data-dusk="fundsTitle">
                    E-formulieren ({fundForms.meta.total})
                </div>

                <div className="card-header-filters">
                    <div className="block block-inline-filters form">
                        <BlockLabelTabs
                            value={filterValues.state}
                            setValue={(value) => filterUpdate({ state: value })}
                            tabs={statesOptions}
                        />

                        <div className="flex">
                            {filter.show && (
                                <div className="button button-text" onClick={filter.resetFilters}>
                                    <em className="mdi mdi-close icon-start" />
                                    Wis filters
                                </div>
                            )}

                            {!filter.show && (
                                <div className="form">
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Zoeken"
                                            value={filterValues.q}
                                            onChange={(e) => filterUpdate({ q: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <ClickOutside className="form" onClickOutside={() => filter.setShow(false)}>
                                <div className="inline-filters-dropdown pull-right">
                                    {filter.show && (
                                        <div className="inline-filters-dropdown-content">
                                            <div className="arrow-box bg-dim">
                                                <div className="arrow" />
                                            </div>

                                            <div className="form">
                                                <FilterItemToggle
                                                    show={true}
                                                    label={translate(
                                                        'components.organization_funds_forms.filters.search',
                                                    )}>
                                                    <input
                                                        className="form-control"
                                                        value={filterValues.q}
                                                        onChange={(e) => filterUpdate({ q: e.target.value })}
                                                        placeholder={translate(
                                                            'components.organization_funds_forms.filters.search',
                                                        )}
                                                    />
                                                </FilterItemToggle>

                                                <FilterItemToggle
                                                    label={translate(
                                                        'components.organization_funds_forms.filters.state',
                                                    )}>
                                                    <SelectControl
                                                        className="form-control"
                                                        propKey={'value'}
                                                        propValue={'label'}
                                                        allowSearch={false}
                                                        value={filterValues.state}
                                                        options={statesOptions}
                                                        optionsComponent={SelectControlOptions}
                                                        onChange={(state: string) => filterUpdate({ state })}
                                                    />
                                                </FilterItemToggle>

                                                <FilterItemToggle
                                                    label={translate(
                                                        'components.organization_funds_forms.filters.implementation',
                                                    )}>
                                                    <SelectControl
                                                        className="form-control"
                                                        propKey={'id'}
                                                        allowSearch={false}
                                                        value={filterValues.implementation_id}
                                                        options={implementations}
                                                        optionsComponent={SelectControlOptions}
                                                        onChange={(implementation_id: number) =>
                                                            filterUpdate({ implementation_id })
                                                        }
                                                    />
                                                </FilterItemToggle>
                                            </div>
                                        </div>
                                    )}

                                    <div
                                        className="button button-default button-icon"
                                        onClick={() => filter.setShow(!filter.show)}>
                                        <em className="mdi mdi-filter-outline" />
                                    </div>
                                </div>
                            </ClickOutside>
                        </div>
                    </div>
                </div>
            </div>

            {!loading && fundForms.meta.total > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {fundForms.data.map((fundForm) => (
                                        <StateNavLink
                                            key={fundForm.id}
                                            name={'fund-form'}
                                            params={{ organizationId: activeOrganization.id, id: fundForm.id }}
                                            customElement={'tr'}
                                            className={'tr-clickable'}>
                                            <td>
                                                <TableEntityMain
                                                    title={fundForm.name}
                                                    subtitle={`#${fundForm.id}`}
                                                    mediaPlaceholder={'form'}
                                                    mediaRound={false}
                                                    mediaBorder={false}
                                                    media={null}
                                                />
                                            </td>

                                            <td>
                                                <TableDateTime value={fundForm.created_at_locale} />
                                            </td>

                                            <td>
                                                <TableEntityMain
                                                    title={strLimit(fundForm.fund.name, 50)}
                                                    subtitle={fundForm?.fund.organization?.name}
                                                    mediaPlaceholder={'fund'}
                                                    media={fundForm?.fund?.logo}
                                                />
                                            </td>

                                            <td className="text-strong text-muted-dark">
                                                {fundForm.fund.implementation?.name || <TableEmptyValue />}
                                            </td>

                                            <td className="text-strong text-muted-dark">
                                                {fundForm?.steps || <TableEmptyValue />}
                                            </td>

                                            <td>
                                                <FundFormStateLabels fundForm={fundForm} />
                                            </td>

                                            <td className={'table-td-actions text-right'}>
                                                <TableRowActions
                                                    content={() => (
                                                        <div className="dropdown dropdown-actions">
                                                            <StateNavLink
                                                                name={'fund-form'}
                                                                params={{
                                                                    organizationId: activeOrganization.id,
                                                                    id: fundForm.id,
                                                                }}
                                                                className="dropdown-item">
                                                                <em className="mdi mdi-eye icon-start" /> Bekijken
                                                            </StateNavLink>
                                                        </div>
                                                    )}
                                                />
                                            </td>
                                        </StateNavLink>
                                    ))}
                                </tbody>
                            </table>
                        </TableTopScroller>
                    </div>
                </div>
            )}

            {!loading && fundForms.meta.total == 0 && <EmptyCard type={'card-section'} title={'Geen formulieren'} />}

            {loading && <LoadingCard type={'card-section'} />}

            {!loading && fundForms.meta.total > 0 && (
                <div className="card-section">
                    <Paginator
                        meta={fundForms.meta}
                        filters={filterValues}
                        updateFilters={filterUpdate}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}
        </div>
    );
}
