import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import useSetProgress from '../../../hooks/useSetProgress';
import { PaginationData } from '../../../props/ApiResponses';
import LoadingCard from '../loading-card/LoadingCard';
import FilterItemToggle from './elements/FilterItemToggle';
import CardHeaderFilter from './elements/CardHeaderFilter';
import { useEventLogService } from '../../../services/EventLogService';
import EventLog from '../../../props/models/EventLog';
import { hasPermission } from '../../../helpers/utils';
import useAppConfigs from '../../../hooks/useAppConfigs';
import Organization from '../../../props/models/Organization';
import ClickOutside from '../click-outside/ClickOutside';
import { strLimit } from '../../../helpers/string';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../hooks/useTranslate';
import TableEmptyValue from '../table-empty-value/TableEmptyValue';
import CheckboxControl from '../forms/controls/CheckboxControl';
import useEventLogsExporter from '../../../services/exporters/useEventLogsExporter';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { ArrayParam, NumberParam, StringParam } from 'use-query-params';
import FormGroup from '../forms/elements/FormGroup';
import LoaderTableCard from '../loader-table-card/LoaderTableCard';

export default function EventLogsTable({
    organization,
    loggable,
    loggableId = null,
    perPageKey = 'event_logs',
    title,
    hideFilterForm,
    hideFilterDropdown,
    hideEntity,
    fetchEventLogsRef = null,
}: {
    organization: Organization;
    loggable: Array<string>;
    loggableId?: number;
    perPageKey?: string;
    title?: string;
    hideFilterForm?: boolean;
    hideFilterDropdown?: boolean;
    hideEntity?: boolean;
    fetchEventLogsRef?: React.MutableRefObject<() => void>;
}) {
    const translate = useTranslate();

    const setProgress = useSetProgress();
    const appConfigs = useAppConfigs();

    const eventLogService = useEventLogService();
    const paginatorService = usePaginatorService();
    const eventLogsExporter = useEventLogsExporter();

    const [logs, setLogs] = useState<PaginationData<EventLog>>(null);
    const [noteTooltip, setNoteTooltip] = useState(null);
    const permissionsMap = useMemo(() => appConfigs.event_permissions, [appConfigs?.event_permissions]);

    const loggables = useMemo(() => {
        return [
            { key: 'fund', title: 'Fonds' },
            { key: 'employees', title: 'Medewerker' },
            { key: 'bank_connection', title: 'Bank integratie' },
            { key: 'voucher', title: 'Tegoeden' },
        ].filter((item) => hasPermission(organization, permissionsMap[item.key]));
    }, [organization, permissionsMap]);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        q: string;
        loggable?: Array<string>;
        per_page?: number;
        page?: number;
        order_by?: string;
        order_dir?: string;
    }>(
        {
            q: '',
            loggable: loggable,
            per_page: paginatorService.getPerPage(perPageKey),
            order_by: 'created_at',
            order_dir: 'desc',
        },
        {
            queryParams: {
                q: StringParam,
                loggable: ArrayParam,
                per_page: NumberParam,
                page: NumberParam,
                order_by: StringParam,
                order_dir: StringParam,
            },
        },
    );

    const { resetFilters: resetFilters } = filter;

    const showNoteTooltip = useCallback((e: React.MouseEvent, log: EventLog) => {
        e.stopPropagation();
        setNoteTooltip(log.id);
    }, []);

    const hideNoteTooltip = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setNoteTooltip(null);
    }, []);

    const selectLoggable = useCallback(
        (key: string, selected: boolean) => {
            const values = [...filterValuesActive.loggable];
            const index = values.indexOf(key);

            if (index !== -1 && !selected) {
                values.splice(index, 1);
            } else if (selected) {
                values.push(key);
            }

            filterUpdate({ loggable: values });
        },
        [filterUpdate, filterValuesActive.loggable],
    );

    const exportLogs = useCallback(() => {
        eventLogsExporter.exportData(organization.id, { ...filterValuesActive, loggable_id: loggableId });
    }, [organization.id, filterValuesActive, eventLogsExporter, loggableId]);

    const fetchLogs = useCallback(() => {
        setProgress(0);

        eventLogService
            .list(organization.id, { ...filterValuesActive, loggable_id: loggableId })
            .then((res) => {
                const logs = {
                    ...res.data,
                    data: res.data.data.map((item) => ({
                        ...item,
                        note_substr: item.note ? strLimit(item.note, 40) : null,
                    })),
                };

                setLogs(logs);
            })
            .finally(() => setProgress(100));
    }, [organization.id, setProgress, eventLogService, filterValuesActive, loggableId]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        if (fetchEventLogsRef) {
            fetchEventLogsRef.current = fetchLogs;
        }
    }, [fetchEventLogsRef, fetchLogs]);

    if (!logs) {
        return <LoadingCard />;
    }

    return (
        <div className="card" data-dusk="tableEventLogsContent">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {title || 'Activiteitenlogboek'} ({logs?.meta?.total})
                </div>
                <div className="card-header-filters">
                    {!hideFilterForm && (
                        <div className="block block-inline-filters">
                            {filter.show && (
                                <div className="button button-text" onClick={() => resetFilters()}>
                                    <em className="mdi mdi-close icon-start" />
                                    Wis filters
                                </div>
                            )}
                            {!filter.show && (
                                <div className="form">
                                    <FormGroup
                                        input={(id) => (
                                            <input
                                                type="search"
                                                id={id}
                                                className="form-control"
                                                value={filterValues.q}
                                                data-dusk="tableEventLogsSearch"
                                                onChange={(e) => filterUpdate({ q: e.target.value })}
                                                placeholder={translate('event_logs.labels.search')}
                                            />
                                        )}
                                    />
                                </div>
                            )}

                            {!hideFilterDropdown && (
                                <CardHeaderFilter filter={filter}>
                                    <FilterItemToggle label={translate('event_logs.labels.search')} show={true}>
                                        <input
                                            className="form-control"
                                            value={filterValues.q}
                                            onChange={(e) => filterUpdate({ q: e.target.value })}
                                            placeholder={translate('event_logs.labels.search')}
                                        />
                                    </FilterItemToggle>

                                    <FilterItemToggle label={translate('event_logs.labels.entities')}>
                                        <div>
                                            {loggables.map((loggable) => (
                                                <div key={loggable.key}>
                                                    <CheckboxControl
                                                        id={'checkbox_' + loggable.key}
                                                        checked={filterValues.loggable.indexOf(loggable.key) !== -1}
                                                        narrow={true}
                                                        onChange={(_, checked) => selectLoggable(loggable.key, checked)}
                                                        title={loggable.title}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </FilterItemToggle>

                                    <div className="form-actions">
                                        <button
                                            className="button button-primary button-wide"
                                            onClick={() => exportLogs()}
                                            data-dusk="export"
                                            disabled={logs?.meta?.total == 0}>
                                            <em className="mdi mdi-download icon-start"> </em>
                                            {translate('components.dropdown.export', {
                                                total: logs?.meta?.total,
                                            })}
                                        </button>
                                    </div>
                                </CardHeaderFilter>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <LoaderTableCard
                empty={logs?.meta?.total === 0}
                emptyTitle={'Geen logboeken gevonden'}
                columns={eventLogService.getColumns(hideEntity)}
                tableOptions={{ filter, sortable: true }}
                paginator={{ key: perPageKey, data: logs, filterValues, filterUpdate }}>
                {logs?.data?.map((log) => (
                    <tr key={log.id} data-dusk={`tableEventLogsRow${log.id}`}>
                        <td>
                            <div className="text-semibold text-primary nowrap">
                                {log.created_at_locale.split(' - ')[0]}
                            </div>
                            <div className="text-strong text-md text-muted-dark nowrap">
                                {log.created_at_locale.split(' - ')[1]}
                            </div>
                        </td>

                        {!hideEntity && <td dangerouslySetInnerHTML={{ __html: log.loggable_locale }} />}

                        <td dangerouslySetInnerHTML={{ __html: log.event_locale }} />

                        {log.identity_email ? (
                            <td>{log.identity_email}</td>
                        ) : (
                            <td className="text-muted">Geen e-mailadres bekend</td>
                        )}

                        <td>
                            {log.note && log.note != log.note_substr && (
                                <a
                                    className={classNames(
                                        'td-icon',
                                        'mdi',
                                        'mdi-information',
                                        'block',
                                        'block-tooltip-details',
                                        'pull-left',
                                        noteTooltip === log.id && 'active',
                                    )}
                                    onClick={(e) => showNoteTooltip(e, log)}>
                                    {noteTooltip && (
                                        <ClickOutside className="tooltip-content" onClickOutside={hideNoteTooltip}>
                                            <div className="tooltip-text">{log.note}</div>
                                        </ClickOutside>
                                    )}
                                    &nbsp;
                                </a>
                            )}

                            {log.note ? <div>{log.note_substr}</div> : <div className="text-muted">Geen notitie</div>}
                        </td>
                        <td className={'table-td-actions text-right'}>
                            <TableEmptyValue />
                        </td>
                    </tr>
                ))}
            </LoaderTableCard>
        </div>
    );
}
