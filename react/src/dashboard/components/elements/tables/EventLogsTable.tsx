import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useSetProgress from '../../../hooks/useSetProgress';
import { PaginationData } from '../../../props/ApiResponses';
import Paginator from '../../../modules/paginator/components/Paginator';
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
import useFilter from '../../../hooks/useFilter';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../hooks/useTranslate';
import EmptyCard from '../empty-card/EmptyCard';
import useConfigurableTable from '../../pages/vouchers/hooks/useConfigurableTable';
import TableTopScroller from './TableTopScroller';
import TableEmptyValue from '../table-empty-value/TableEmptyValue';

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

    const { headElement, configsElement } = useConfigurableTable(eventLogService.getColumns(hideEntity));

    const filter = useFilter({
        q: '',
        loggable: loggable,
        loggable_id: loggableId,
        per_page: paginatorService.getPerPage(perPageKey),
        order_by: 'created_at',
        order_dir: 'desc',
    });

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
            const values = filter.activeValues.loggable;
            const index = values.indexOf(key);

            if (index !== -1 && !selected) {
                values.splice(index, 1);
            } else if (selected) {
                values.push(key);
            }

            filter.update({ loggable: values });
        },
        [filter],
    );

    const fetchLogs = useCallback(() => {
        setProgress(0);

        eventLogService
            .list(organization.id, filter.activeValues)
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
    }, [organization.id, setProgress, eventLogService, filter.activeValues]);

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
        <div className="card">
            <div className="card-header card-header-next">
                <div className="card-title flex flex-grow">
                    {title || 'Activiteitenlogboek'} ({logs.meta.total})
                </div>
                <div className="card-header-filters">
                    {!hideFilterForm && (
                        <div className="block block-inline-filters">
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
                                            type="search"
                                            className="form-control"
                                            value={filter.values.q}
                                            onChange={(e) => filter.update({ q: e.target.value })}
                                            placeholder={translate('event_logs.labels.search')}
                                        />
                                    </div>
                                </div>
                            )}

                            {!hideFilterDropdown && (
                                <CardHeaderFilter filter={filter}>
                                    <FilterItemToggle label={translate('event_logs.labels.search')} show={true}>
                                        <input
                                            className="form-control"
                                            value={filter.values.q}
                                            onChange={(e) => filter.update({ q: e.target.value })}
                                            placeholder={translate('event_logs.labels.search')}
                                        />
                                    </FilterItemToggle>

                                    <FilterItemToggle label={translate('event_logs.labels.entities')}>
                                        {loggables.map((loggable) => (
                                            <div key={loggable.key}>
                                                <label
                                                    className="checkbox checkbox-narrow"
                                                    htmlFor={'checkbox_' + loggable.key}>
                                                    <input
                                                        onChange={(e) => selectLoggable(loggable.key, e.target.checked)}
                                                        id={'checkbox_' + loggable.key}
                                                        type="checkbox"
                                                        checked={
                                                            filter.activeValues.loggable.indexOf(loggable.key) !== -1
                                                        }
                                                    />
                                                    <div className="checkbox-label">
                                                        <div className="checkbox-box">
                                                            <div className="mdi mdi-check" />
                                                        </div>
                                                        {loggable.title}
                                                    </div>
                                                </label>
                                            </div>
                                        ))}
                                    </FilterItemToggle>
                                </CardHeaderFilter>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {logs.meta.total > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {logs.data.map((log) => (
                                        <tr key={log.id}>
                                            <td>
                                                <div className="text-medium text-primary nowrap">
                                                    {log.created_at_locale.split(' - ')[0]}
                                                </div>
                                                <div className="text-strong text-md text-muted-dark nowrap">
                                                    {log.created_at_locale.split(' - ')[1]}
                                                </div>
                                            </td>

                                            {!hideEntity && (
                                                <td dangerouslySetInnerHTML={{ __html: log.loggable_locale }} />
                                            )}

                                            <td dangerouslySetInnerHTML={{ __html: log.event_locale }} />

                                            {log.identity_email ? (
                                                <td>{log.identity_email}</td>
                                            ) : (
                                                <td className="text-muted">Geen e-mailadres bekend</td>
                                            )}

                                            <td>
                                                {log.note && log.note != log.note_substr && (
                                                    <a
                                                        className={`td-icon mdi mdi-information block block-tooltip-details pull-left ${
                                                            noteTooltip === log.id ? 'active' : ''
                                                        }`}
                                                        onClick={(e) => showNoteTooltip(e, log)}>
                                                        {noteTooltip && (
                                                            <ClickOutside
                                                                className="tooltip-content"
                                                                onClickOutside={hideNoteTooltip}>
                                                                <div className="tooltip-text">{log.note}</div>
                                                            </ClickOutside>
                                                        )}
                                                        &nbsp;
                                                    </a>
                                                )}

                                                {log.note ? (
                                                    <div>{log.note_substr}</div>
                                                ) : (
                                                    <div className="text-muted">Geen notitie</div>
                                                )}
                                            </td>
                                            <td className={'table-td-actions text-right'}>
                                                <TableEmptyValue />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableTopScroller>
                    </div>
                </div>
            )}

            {logs.meta.total === 0 ? (
                <EmptyCard title={'Geen logboeken gevonden'} type={'card-section'} />
            ) : (
                <div className="card-section">
                    <Paginator
                        meta={logs.meta}
                        filters={filter.values}
                        perPageKey={perPageKey}
                        updateFilters={filter.update}
                    />
                </div>
            )}
        </div>
    );
}
