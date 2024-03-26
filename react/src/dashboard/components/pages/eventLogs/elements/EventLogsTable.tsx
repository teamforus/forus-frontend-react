import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSetProgress from '../../../../hooks/useSetProgress';
import { PaginationData } from '../../../../props/ApiResponses';
import Paginator from '../../../../modules/paginator/components/Paginator';
import ThSortable from '../../../elements/tables/ThSortable';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import FilterItemToggle from '../../../elements/tables/elements/FilterItemToggle';
import CardHeaderFilter from '../../../elements/tables/elements/CardHeaderFilter';
import { useEventLogService } from '../../../../services/EventLogService';
import EventLog from '../../../../props/models/EventLog';
import { hasPermission } from '../../../../helpers/utils';
import useAppConfigs from '../../../../hooks/useAppConfigs';
import Organization from '../../../../props/models/Organization';
import ClickOutside from '../../../elements/click-outside/ClickOutside';
import { strLimit } from '../../../../helpers/string';
import useFilter from '../../../../hooks/useFilter';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';

export default function EventLogsTable({
    organization,
    loggable,
    perPageKey = 'event_logs',
    title,
    hideFilterForm,
    hideEntity,
}: {
    organization: Organization;
    loggable: Array<string>;
    perPageKey?: string;
    title?: string;
    hideFilterForm?: boolean;
    hideEntity?: boolean;
}) {
    const { t } = useTranslation();

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
            { key: 'voucher', title: 'Vouchers' },
        ].filter((item) => hasPermission(organization, permissionsMap[item.key]));
    }, [organization, permissionsMap]);

    const filter = useFilter({
        q: '',
        loggable: loggable,
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

    const fetchLogs = useCallback(
        async (query: object) => {
            setProgress(0);

            return eventLogService.list(organization.id, query).finally(() => setProgress(100));
        },
        [organization.id, setProgress, eventLogService],
    );

    useEffect(() => {
        fetchLogs(filter.activeValues).then((res) => {
            const logs = {
                ...res.data,
                data: res.data.data.map((item) => ({
                    ...item,
                    note_substr: item.note ? strLimit(item.note, 40) : null,
                })),
            };

            setLogs(logs);
        });
    }, [fetchLogs, filter.activeValues]);

    if (!logs) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex-row">
                    <div className="flex-col flex-grow">
                        <div className="card-title">
                            {title || 'Activiteitenlogboek'} ({logs.meta.total})
                        </div>
                    </div>

                    {!hideFilterForm && (
                        <div className="flex">
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
                                                className="form-control"
                                                value={filter.values.q}
                                                onChange={(e) => filter.update({ q: e.target.value })}
                                                placeholder={t('event_logs.labels.search')}
                                            />
                                        </div>
                                    </div>
                                )}

                                <CardHeaderFilter filter={filter}>
                                    <FilterItemToggle label={t('event_logs.labels.search')} show={true}>
                                        <input
                                            className="form-control"
                                            value={filter.values.q}
                                            onChange={(e) => filter.update({ q: e.target.value })}
                                            placeholder={t('event_logs.labels.search')}
                                        />
                                    </FilterItemToggle>

                                    <FilterItemToggle label={t('event_logs.labels.entities')}>
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
                                                            <div className="mdi mdi-check"></div>
                                                        </div>
                                                        {loggable.title}
                                                    </div>
                                                </label>
                                            </div>
                                        ))}
                                    </FilterItemToggle>
                                </CardHeaderFilter>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {logs.meta.total > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <ThSortable label={t('event_logs.labels.date')} />
                                        {!hideEntity && <ThSortable label={t('event_logs.labels.entity')} />}
                                        <ThSortable label={t('event_logs.labels.action')} />
                                        <ThSortable label={t('event_logs.labels.author')} />
                                        <ThSortable label={t('event_logs.labels.note')} />
                                    </tr>
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
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {logs.meta.total == 0 && (
                <div className="card-section">
                    <div className="block block-empty text-center">
                        <div className="empty-title">Geen logboeken gevonden</div>
                    </div>
                </div>
            )}

            {logs.meta && (
                <div className="card-section">
                    <Paginator
                        meta={logs.meta}
                        filters={filter.values}
                        updateFilters={filter.update}
                        perPageKey={perPageKey}
                    />
                </div>
            )}
        </div>
    );
}
