import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';
import { useState } from 'react';
import EventLog from '../props/models/EventLog';
import ApiRequestService from './ApiRequestService';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';
import { ExportFieldProp } from '../components/modals/ModalExportDataSelect';

export class EventLogService<T = EventLog> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/organizations';

    /**
     * Fetch list
     */
    public list(organizationId: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/logs`, data) as Promise<ApiResponse<T>>;
    }

    public exportFields(organization_id: number): Promise<ApiResponseSingle<Array<ExportFieldProp>>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/logs/export-fields`);
    }

    public export = (organization_id: number, data: object = {}): Promise<ResponseSimple<ArrayBuffer>> => {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/logs/export`, data, {
            responseType: 'arraybuffer',
        });
    };

    public getColumns(hideEntity: boolean): Array<ConfigurableTableColumn> {
        const list = ['date', !hideEntity ? 'entity' : null, 'action', 'author', 'note'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `event_logs.labels.${key}`,
            tooltip: {
                key: key,
                title: `event_logs.labels.${key}`,
                description: `event_logs.tooltips.${key}`,
            },
        }));
    }
}
export function useEventLogService(): EventLogService {
    return useState(new EventLogService())[0];
}
