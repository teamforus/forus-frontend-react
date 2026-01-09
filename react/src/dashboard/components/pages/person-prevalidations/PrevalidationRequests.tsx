import React, { useState, useCallback, useEffect } from 'react';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import useTranslate from '../../../hooks/useTranslate';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { hasPermission } from '../../../helpers/utils';
import useSetProgress from '../../../hooks/useSetProgress';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptionsFund from '../../elements/select-control/templates/SelectControlOptionsFund';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useOpenModal from '../../../hooks/useOpenModal';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import { PaginationData } from '../../../props/ApiResponses';
import PrevalidationRequest from '../../../props/models/PrevalidationRequest';
import useConfigurableTable from '../vouchers/hooks/useConfigurableTable';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import ClickOutside from '../../elements/click-outside/ClickOutside';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../helpers/dates';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import { strLimit } from '../../../helpers/string';
import TableEmptyValue from '../../elements/table-empty-value/TableEmptyValue';
import Paginator from '../../../modules/paginator/components/Paginator';
import { createEnumParam, NumberParam, StringParam } from 'use-query-params';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import { Permission } from '../../../props/models/Organization';
import { usePrevalidationRequestService } from '../../../services/PrevalidationRequestService';
import ModalPrevalidationRequestsUpload from '../../modals/ModalPrevalidationRequestsUpload';
import RecordType from '../../../props/models/RecordType';
import { useRecordTypeService } from '../../../services/RecordTypeService';
import PrevalidationRequestStateLabels from '../../elements/resource-states/PrevalidationRequestStateLabels';
import TableRowActions from '../../elements/tables/TableRowActions';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushApiError from '../../../hooks/usePushApiError';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import { useNavigateState } from '../../../modules/state_router/Router';
import ModalDangerZone from '../../modals/ModalDangerZone';

export default function PrevalidationRequests() {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const pushSuccess = usePushSuccess();
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const paginatorService = usePaginatorService();
    const recordTypeService = useRecordTypeService();
    const prevalidationRequestService = usePrevalidationRequestService();

    const [funds, setFunds] = useState<Array<Fund>>([]);
    const [paginatorKey] = useState('prevalidation_requests');

    const [recordTypes, setRecordTypes] = useState<Array<RecordType>>(null);
    const [prevalidationRequests, setPrevalidationRequests] = useState<
        PaginationData<PrevalidationRequest> & { meta: { failed_count?: number } }
    >(null);

    const [states] = useState([
        { key: null, name: translate('prevalidation_requests.states.all') },
        { key: 'pending', name: translate('prevalidation_requests.states.pending') },
        { key: 'success', name: translate('prevalidation_requests.states.success') },
        { key: 'fail', name: translate('prevalidation_requests.states.fail') },
    ]);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        q?: string;
        to?: string;
        from?: string;
        state?: string;
        fund_id?: number;
        page?: number;
        per_page?: number;
    }>(
        {
            q: '',
            fund_id: null,
            state: null,
            from: null,
            to: null,
            page: 1,
            per_page: paginatorService.getPerPage(paginatorKey, 10),
        },
        {
            queryParams: {
                q: StringParam,
                fund_id: NumberParam,
                state: createEnumParam(['pending', 'success', 'fail']),
                from: StringParam,
                to: StringParam,
                per_page: NumberParam,
                page: NumberParam,
            },
        },
    );

    const { headElement, configsElement } = useConfigurableTable(prevalidationRequestService.getColumns());

    const fetchPrevalidationRequests = useCallback(() => {
        if (activeOrganization?.allow_prevalidation_requests) {
            setProgress(0);

            prevalidationRequestService
                .list(activeOrganization.id, { ...filterValuesActive })
                .then((res) => setPrevalidationRequests(res.data))
                .finally(() => setProgress(100));
        }
    }, [
        activeOrganization?.allow_prevalidation_requests,
        activeOrganization.id,
        setProgress,
        prevalidationRequestService,
        filterValuesActive,
    ]);

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list(activeOrganization?.id, { state: 'active_paused_and_closed', per_page: 100 })
            .then((res) => {
                setFunds(res.data.data.filter((fund) => hasPermission(fund.organization, Permission.VALIDATE_RECORDS)));
            })
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization?.id]);

    const uploadPrevalidationRequests = useCallback(
        (funds: Array<Fund>, fundId: number, onCreate?: () => void) => {
            openModal((modal) => (
                <ModalPrevalidationRequestsUpload
                    modal={modal}
                    funds={funds}
                    fundId={fundId}
                    onCompleted={onCreate}
                    recordTypes={recordTypes}
                />
            ));
        },
        [openModal, recordTypes],
    );

    const resubmitRequest = useCallback(
        (request: PrevalidationRequest) => {
            prevalidationRequestService
                .resubmit(activeOrganization?.id, request.id)
                .then(() => {
                    pushSuccess('Gelukt!', 'Verzoek opnieuw verzonden.');
                    fetchPrevalidationRequests();
                })
                .catch(pushApiError);
        },
        [activeOrganization?.id, fetchPrevalidationRequests, prevalidationRequestService, pushApiError, pushSuccess],
    );

    const resubmitFailedRequest = useCallback(() => {
        prevalidationRequestService
            .resubmitFailed(activeOrganization?.id)
            .then(() => {
                pushSuccess('Gelukt!', 'Verzoek opnieuw verzonden.');
                fetchPrevalidationRequests();
            })
            .catch(pushApiError);
    }, [activeOrganization?.id, fetchPrevalidationRequests, prevalidationRequestService, pushApiError, pushSuccess]);

    const deleteRequest = useCallback(
        (request: PrevalidationRequest) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('modals.danger_zone.remove_prevalidation_request.title')}
                    description={translate('modals.danger_zone.remove_prevalidation_request.description')}
                    buttonCancel={{
                        onClick: modal.close,
                        text: translate('modals.danger_zone.remove_prevalidation_request.buttons.cancel'),
                    }}
                    buttonSubmit={{
                        onClick: () => {
                            prevalidationRequestService
                                .destroy(activeOrganization?.id, request.id)
                                .then(() => {
                                    pushSuccess('Gelukt!', 'Verzoek verwijderd.');
                                    fetchPrevalidationRequests();
                                    modal.close();
                                })
                                .catch(pushApiError);
                        },
                        text: translate('modals.danger_zone.remove_prevalidation_request.buttons.confirm'),
                    }}
                />
            ));
        },
        [
            openModal,
            translate,
            activeOrganization?.id,
            fetchPrevalidationRequests,
            prevalidationRequestService,
            pushApiError,
            pushSuccess,
        ],
    );

    const fetchRecordTypes = useCallback(() => {
        setProgress(0);

        recordTypeService
            .list()
            .then((res) => setRecordTypes(res.data))
            .finally(() => setProgress(100));
    }, [recordTypeService, setProgress]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    useEffect(() => {
        fetchPrevalidationRequests();
    }, [fetchPrevalidationRequests]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        if (!activeOrganization?.allow_prevalidation_requests) {
            navigateState(DashboardRoutes.ORGANIZATIONS);
        }
    }, [activeOrganization?.allow_prevalidation_requests, navigateState]);

    if (funds?.length === 0) {
        return <EmptyCard title={'Geen fondsen gevonden'} />;
    }

    if (!prevalidationRequests) {
        return <LoadingCard />;
    }

    return (
        <div className="card form" data-dusk="tablePrevalidationRequestContent">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {translate('prevalidation_requests.header.title')} ({prevalidationRequests?.meta?.total})
                </div>
                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        {prevalidationRequests.meta.failed_count > 0 && (
                            <button className="button button-primary" onClick={() => resubmitFailedRequest()}>
                                <em className="mdi mdi-restart icon-start" />
                                {translate('prevalidation_requests.buttons.resubmit_failed')}
                            </button>
                        )}

                        <button
                            id="prevalidations_upload_csv"
                            className="button button-primary"
                            data-dusk="uploadPrevalidationRequestsBatchButton"
                            onClick={() => {
                                uploadPrevalidationRequests(
                                    funds,
                                    filterValuesActive?.fund_id,
                                    fetchPrevalidationRequests,
                                );
                            }}>
                            <em className="mdi mdi-upload icon-start" />
                            {translate('prevalidation_requests.buttons.upload')}
                        </button>

                        <div className="form-group">
                            <SelectControl
                                className="form-control inline-filter-control"
                                propKey={'id'}
                                options={[{ id: null, name: 'Selecteer fonds' }, ...funds]}
                                value={filter.activeValues.fund_id}
                                placeholder={translate('prevalidation_requests.labels.fund')}
                                allowSearch={false}
                                onChange={(fund_id: number) => filter.update({ fund_id })}
                                optionsComponent={SelectControlOptionsFund}
                                dusk="prevalidationsSelectFund"
                            />
                        </div>

                        {filter.show && (
                            <div className="button button-text" onClick={() => filter.resetFilters()}>
                                <em className="mdi mdi-close icon-start" />
                                Wis filters
                            </div>
                        )}

                        {!filter.show && (
                            <div className="form">
                                <div className="form-group">
                                    <input
                                        className="form-control"
                                        type="text"
                                        data-dusk="tablePrevalidationRequestSearch"
                                        placeholder={translate('prevalidation_requests.labels.search')}
                                        value={filter.values.q}
                                        onChange={(e) => filter.update({ q: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form inline-filters-dropdown pull-right">
                            <ClickOutside onClickOutside={() => filter.setShow(false)}>
                                {filter.show && (
                                    <div className="inline-filters-dropdown-content">
                                        <div className="arrow-box bg-dim">
                                            <em className="arrow" />
                                        </div>

                                        <div className="form">
                                            <FilterItemToggle
                                                label={translate('prevalidation_requests.labels.search')}
                                                show={true}>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={filter.values.q}
                                                    placeholder={translate('prevalidation_requests.labels.search')}
                                                    onChange={(e) => filter.update({ q: e.target.value })}
                                                />
                                            </FilterItemToggle>

                                            <FilterItemToggle label={translate('prevalidation_requests.labels.state')}>
                                                <SelectControl
                                                    className="form-control"
                                                    propKey={'key'}
                                                    allowSearch={true}
                                                    options={states}
                                                    value={filter.values.state}
                                                    onChange={(state: string) => filter.update({ state })}
                                                />
                                            </FilterItemToggle>

                                            <FilterItemToggle label={translate('prevalidation_requests.labels.from')}>
                                                <DatePickerControl
                                                    value={dateParse(filter.values.from)}
                                                    dateFormat="dd-MM-yyyy"
                                                    placeholder={'dd-MM-jjjj'}
                                                    onChange={(from: Date) => filter.update({ from: dateFormat(from) })}
                                                />
                                            </FilterItemToggle>

                                            <FilterItemToggle label={translate('prevalidation_requests.labels.to')}>
                                                <DatePickerControl
                                                    value={dateParse(filter.values.to)}
                                                    dateFormat="dd-MM-yyyy"
                                                    placeholder={'dd-MM-jjjj'}
                                                    onChange={(to: Date) => filter.update({ to: dateFormat(to) })}
                                                />
                                            </FilterItemToggle>
                                        </div>
                                    </div>
                                )}

                                <button
                                    className="button button-default button-icon"
                                    data-dusk="showFilters"
                                    onClick={() => filter.setShow(!filter.show)}>
                                    <em className="mdi mdi-filter-outline" />
                                </button>
                            </ClickOutside>
                        </div>
                    </div>
                </div>
            </div>

            <LoaderTableCard
                loading={!prevalidationRequests.meta}
                empty={prevalidationRequests.meta.total == 0}
                emptyTitle={translate('prevalidation_requests.empty.title')}
                emptyDescription={translate('prevalidation_requests.empty.description')}>
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {prevalidationRequests.data.map((row) => (
                                        <tr key={row.id} data-dusk={`tablePrevalidationRequestRow${row.id}`}>
                                            <td className="text-primary text-strong">{row.bsn}</td>

                                            <td>
                                                <div className="text-primary text-semibold">
                                                    {row.fund ? strLimit(row.fund?.name, 32) : <TableEmptyValue />}
                                                </div>

                                                <div className="text-strong text-md text-muted-dark">
                                                    {row.fund ? (
                                                        strLimit(row.fund?.implementation?.name, 32)
                                                    ) : (
                                                        <TableEmptyValue />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-primary text-strong">
                                                {row.employee?.email || 'Onbekend'}
                                            </td>
                                            <td>
                                                <PrevalidationRequestStateLabels request={row} />
                                            </td>
                                            <td>
                                                {row.state === 'fail' && row.failed_reason ? (
                                                    row.failed_reason_locale
                                                ) : (
                                                    <TableEmptyValue />
                                                )}
                                            </td>

                                            <td className={'table-td-actions text-right'}>
                                                {row.state === 'fail' ? (
                                                    <TableRowActions
                                                        dataDusk={'btnPrevalidationRequestMenu'}
                                                        content={({ close }) => (
                                                            <div className="dropdown dropdown-actions">
                                                                <div
                                                                    className="dropdown-item"
                                                                    data-dusk={`btnPrevalidationRequestResubmit${row.id}`}
                                                                    onClick={() => {
                                                                        resubmitRequest(row);
                                                                        close();
                                                                    }}>
                                                                    <em className="mdi mdi-restart icon-start" />{' '}
                                                                    {translate(
                                                                        'prevalidation_requests.buttons.resubmit',
                                                                    )}
                                                                </div>
                                                                <div
                                                                    className="dropdown-item"
                                                                    data-dusk={`btnPrevalidationRequestDelete${row.id}`}
                                                                    onClick={() => {
                                                                        deleteRequest(row);
                                                                        close();
                                                                    }}>
                                                                    <em className="mdi mdi-close icon-start" />{' '}
                                                                    {translate('prevalidation_requests.buttons.delete')}
                                                                </div>
                                                            </div>
                                                        )}
                                                    />
                                                ) : (
                                                    <TableEmptyValue />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableTopScroller>
                    </div>
                </div>

                {prevalidationRequests?.meta.total > 0 && (
                    <div className="card-section">
                        <Paginator
                            meta={prevalidationRequests.meta}
                            filters={filterValues}
                            updateFilters={filterUpdate}
                            perPageKey={paginatorKey}
                        />
                    </div>
                )}
            </LoaderTableCard>
        </div>
    );
}
