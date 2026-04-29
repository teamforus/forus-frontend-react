import ApiResponse, { ApiResponseSingle, RequestConfig } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import Office from '../props/models/Office';

export class OfficeService<T = Office> {
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
    public list(organizationId: number, data: object = {}, config: RequestConfig = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/offices`, data, config);
    }

    /**
     * Store office
     */
    public store(organizationId: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/offices`, this.apiFormToResource(data));
    }

    /**
     * Update office
     */
    public update(organizationId: number, id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/offices/${id}`, this.apiFormToResource(data));
    }

    /**
     * Read office
     */
    public read(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/offices/${id}`);
    }

    /**
     * Read office
     */
    public destroy(organizationId: number, id: number): Promise<ApiResponse<null>> {
        return this.apiRequest.delete(`${this.prefix}/${organizationId}/offices/${id}`);
    }

    public states() {
        return [
            { name: 'Active', value: 'active' },
            { name: 'Paused', value: 'paused' },
            { name: 'Closed', value: 'closed' },
        ];
    }

    public apiFormToResource(formData: object) {
        const values = JSON.parse(JSON.stringify(formData));
        const fields = ['week_day', 'start_time', 'end_time', 'break_start_time', 'break_end_time'];

        const schedule = (values.schedule ? Object.values(values.schedule) : [])
            .filter((schedule_item) => schedule_item)
            .map((schedule_item) => {
                return fields.reduce((list, field) => {
                    if (schedule_item[field] !== undefined && schedule_item[field] !== '') {
                        list[field] = schedule_item[field];
                    }

                    return list;
                }, {});
            });

        return {
            ...values,
            schedule: schedule.reduce((list, item) => ({ ...list, [item['week_day']]: item }), {}),
        };
    }

    public apiResourceToForm(apiResource): object {
        const schedule = [];
        const weekDays = this.scheduleWeekDays();
        const values = JSON.parse(JSON.stringify(apiResource));

        values.schedule = values.schedule || [];
        values.schedule.forEach((item, week_day: string) => {
            schedule[week_day] = {
                week_day: item.week_day?.toString(),
                start_time: item.start_time,
                end_time: item.end_time,
                break_start_time: item.break_start_time,
                break_end_time: item.break_end_time,
            };
        });

        const scheduleByDay = values.schedule.reduce((list, item) => ({ ...list, ...{ [item.week_day]: item } }), {});

        for (const prop in weekDays) {
            if (!scheduleByDay[prop]) {
                scheduleByDay[prop] = {
                    week_day: parseInt(prop, 10),
                    start_time: '',
                    end_time: '',
                    break_start_time: '',
                    break_end_time: '',
                };
            } else {
                const item = scheduleByDay[prop.toString()];

                item.start_time = item.start_time ? item.start_time : '';
                item.end_time = item.end_time ? item.end_time : '';

                item.break_start_time = item.break_start_time ? item.break_start_time : '';
                item.break_end_time = item.break_end_time ? item.break_end_time : '';
            }
        }

        return {
            address: values.address,
            phone: values.phone,
            branch_id: values.branch_id,
            branch_name: values.branch_name,
            branch_number: values.branch_number,
            schedule: Object.values(scheduleByDay),
        };
    }

    public scheduleWeekDays = () => {
        return { 0: 'Ma', 1: 'Di', 2: 'Wo', 3: 'Do', 4: 'Vr', 5: 'Za', 6: 'Zo' };
    };

    public scheduleWeekDaysExplicit = () => {
        return { 0: 'Maandag', 1: 'Dinsdag', 2: 'Woensdag', 3: 'Donderdag', 4: 'Vrijdag', 5: 'Zaterdag', 6: 'Zondag' };
    };

    public scheduleDayTimes = () => {
        const times = {
            null: 'Tijd',
        };

        for (let i = 0; i < 24; i++) {
            const hour = i < 10 ? '0' + i : i;

            times[hour + ':00'] = hour + ':00';
            times[hour + ':30'] = hour + ':30';
        }

        return times;
    };
}

export default function useOfficeService(): OfficeService {
    return useState(new OfficeService())[0];
}
