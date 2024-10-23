import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useOfficeService from '../../../../services/OfficeService';
import FormError from '../../../elements/forms/errors/FormError';
import UIControlCheckbox from '../../../elements/forms/ui-controls/UIControlCheckbox';
import OfficeSchedule from '../../../../props/models/OfficeSchedule';
import useTranslate from '../../../../hooks/useTranslate';

type Errors = { [key: string]: Array<string> };

type OfficeScheduleLocal = OfficeSchedule & {
    is_closed?: boolean;
};

type OfficeScheduleOption = OfficeSchedule & {
    key: string;
    value: string;
};

export default function ScheduleControl({
    errors,
    schedule,
    onChange,
}: {
    errors: Errors;
    schedule: Array<OfficeSchedule>;
    onChange: (schedule: Array<OfficeSchedule>) => void;
}) {
    const translate = useTranslate();
    const officeService = useOfficeService();
    const [scheduleValue] = useState(schedule);

    const hasAnyTimeValue = useCallback((date?: OfficeSchedule) => {
        const { start_time, end_time, break_start_time, break_end_time } = date || {};

        const validValues = [
            end_time && end_time != 'null' && end_time != 'false',
            start_time && start_time != 'null' && start_time != 'false',
            break_end_time && break_end_time != 'null' && break_end_time != 'false',
            break_start_time && break_start_time != 'null' && break_start_time != 'false',
        ].filter((valid) => valid);

        return date && validValues.length > 0;
    }, []);

    const weekDays = useMemo(() => officeService.scheduleWeekDaysExplicit(), [officeService]);
    const weekDaysKeys = useMemo(() => Object.keys(weekDays).map((day) => parseInt(day)), [weekDays]);
    const schedulesWithValue = useMemo(() => scheduleValue.filter(hasAnyTimeValue), [hasAnyTimeValue, scheduleValue]);

    const makeScheduleData = useCallback(() => {
        return weekDaysKeys.map((week_day) => {
            const value = schedulesWithValue.find((val) => val.week_day == week_day);

            if (value) {
                return { ...value, is_closed: !hasAnyTimeValue(value) };
            }

            return {
                week_day: week_day,
                is_closed: schedulesWithValue.length > 0 ? true : week_day > 4,
                start_time: '',
                end_time: '',
                break_start_time: '',
                break_end_time: '',
            };
        });
    }, [hasAnyTimeValue, schedulesWithValue, weekDaysKeys]);

    const [scheduleData, setScheduleData] = useState<Array<OfficeScheduleLocal>>(makeScheduleData());

    const activeWeekDays = scheduleData.slice(0, 5).filter((day) => !day.is_closed);
    const activeWeekEndDays = scheduleData.slice(5, 6).filter((day) => !day.is_closed);

    const isSameSchedule = useCallback((day1: OfficeScheduleLocal, day2: OfficeScheduleLocal) => {
        return (
            day1.start_time == day2.start_time &&
            day1.end_time == day2.end_time &&
            day1.break_start_time == day2.break_start_time &&
            day1.break_end_time == day2.break_end_time
        );
    }, []);

    const initSameHours = useState(
        activeWeekDays.filter((day) => isSameSchedule(activeWeekDays?.[0], day)).length === activeWeekDays.length,
    )[0];

    const initSameHoursWeekend = useState(
        activeWeekEndDays.filter((day) => isSameSchedule(activeWeekEndDays?.[0], day)).length ===
            activeWeekEndDays.length,
    )[0];

    const [sameHours, setSameHours] = useState(initSameHours);
    const [sameHoursWeekend, setSameHoursWeekend] = useState(initSameHoursWeekend);

    const parseTime = useCallback((time) => {
        return time.split(':')[0] * 60 + time.split(':')[1] * 1;
    }, []);

    const makeTimeOptions = useCallback(
        (from, to) => {
            from = typeof from == 'string' && from.indexOf(':') !== -1 ? parseTime(from) : false;
            to = typeof to == 'string' && to.indexOf(':') !== -1 ? parseTime(to) : false;

            const timeOptions = [];
            const minutes = ['00', '15', '30', '45'];

            [...Array(24).keys()].forEach((hour) => {
                const hourValue = hour > 9 ? hour.toString() : '0' + hour;

                minutes.forEach((minute) => {
                    timeOptions.push({ key: hourValue + ':' + minute, value: hourValue + ':' + minute });
                });
            });

            const pair = {
                from: [{ key: '', value: 'Van' }, ...timeOptions],
                to: [{ key: '', value: 'Tot' }, ...timeOptions],
            };

            if (from) {
                pair.to = pair.to.filter((time) => time.key === '' || parseTime(time.value) > from);
            }

            if (to) {
                pair.from = pair.from.filter((time) => time.key === '' || parseTime(time.value) < to);
            }

            return pair;
        },
        [parseTime],
    );

    const timeOptions = useMemo(() => {
        const timeOptions = [];

        scheduleData.forEach((scheduleDetail, index) => {
            timeOptions[index] = {};
            timeOptions[index].time = makeTimeOptions(scheduleDetail.start_time, scheduleDetail.end_time);

            const breakPair = makeTimeOptions(scheduleDetail.break_start_time, scheduleDetail.break_end_time);

            if (typeof scheduleDetail.start_time == 'string' && scheduleDetail.start_time.indexOf(':') !== -1) {
                breakPair.from = breakPair.from.filter((time) => {
                    return time.key == '' || parseTime(time.key) > parseTime(scheduleDetail.start_time);
                });

                breakPair.to = breakPair.to.filter((time) => {
                    return time.key == '' || parseTime(time.key) > parseTime(scheduleDetail.start_time);
                });
            }

            if (typeof scheduleDetail.end_time == 'string' && scheduleDetail.end_time.indexOf(':') !== -1) {
                breakPair.from = breakPair.from.filter((time) => {
                    return time.key == '' || parseTime(time.key) < parseTime(scheduleDetail.end_time);
                });

                breakPair.to = breakPair.to.filter((time) => {
                    return time.key == '' || parseTime(time.key) < parseTime(scheduleDetail.end_time);
                });
            }

            timeOptions[index].break = breakPair;
        });

        return timeOptions;
    }, [makeTimeOptions, parseTime, scheduleData]);

    const syncTwoDatesHours = useCallback((date1: OfficeScheduleLocal, date2: OfficeScheduleLocal) => {
        date1.start_time = date2.start_time;
        date1.end_time = date2.end_time;
        date1.break_start_time = date2.break_start_time;
        date1.break_end_time = date2.break_end_time;
    }, []);

    const setDateTime = useCallback(
        (index: number, key: string, value: string, sync: boolean) => {
            setScheduleData((scheduleDetails) => {
                const isWeekDay = index <= 4;
                const dayIndexes = isWeekDay ? [0, 1, 2, 3, 4] : [5, 6];

                scheduleDetails[index][key] = value;

                for (let i = 0; i < dayIndexes.length; i++) {
                    if (scheduleDetails[dayIndexes[i]].is_closed) {
                        continue;
                    }

                    if (sync && isWeekDay) {
                        syncTwoDatesHours(scheduleDetails[dayIndexes[i]], scheduleDetails[index]);
                    }

                    if (sync && !isWeekDay) {
                        syncTwoDatesHours(scheduleDetails[dayIndexes[i]], scheduleDetails[index]);
                    }
                }

                return [...scheduleDetails];
            });
        },
        [syncTwoDatesHours],
    );

    const errorsMessages = useMemo(() => {
        const list = {};

        if (typeof errors == 'object') {
            [...Array(7).keys()].forEach((week_day) => {
                list[week_day] = Object.keys(errors)
                    .filter((key) => key.startsWith('schedule.' + week_day + '.'))
                    .map((key) => errors[key]);
            });
        }

        return list;
    }, [errors]);

    const toggleSameCheckboxes = useCallback(
        (checked: boolean, isWeekDay = false) => {
            if (isWeekDay) {
                setSameHours(checked);
            } else {
                setSameHoursWeekend(checked);
            }

            const activeDays = isWeekDay ? activeWeekDays : activeWeekEndDays;
            const activeDay = activeDays.find((day) => day);

            if (checked && activeDay) {
                setDateTime(activeDay.week_day, 'start_time', activeDay.start_time, true);
                setDateTime(activeDay.week_day, 'end_time', activeDay.end_time, true);
                setDateTime(activeDay.week_day, 'break_start_time', activeDay.break_start_time, true);
                setDateTime(activeDay.week_day, 'break_end_time', activeDay.break_end_time, true);
            }
        },
        [activeWeekDays, activeWeekEndDays, setDateTime],
    );

    useEffect(() => {
        setScheduleData(makeScheduleData());
    }, [makeScheduleData, weekDaysKeys]);

    useEffect(() => {
        const scheduleValue = scheduleData
            .map((data) => (!data || data?.is_closed ? null : data))
            .map((data) => (data && hasAnyTimeValue(data) ? data : null));

        onChange(scheduleValue);
    }, [hasAnyTimeValue, onChange, scheduleData]);

    return (
        <div className="block block-schedule-editor">
            <div className="schedule-editor-heading">{translate('organization_edit.labels.schedule')}</div>
            <div>
                <UIControlCheckbox
                    className="sync"
                    name="office_same_hours"
                    id="office_same_hours"
                    label={translate('organization_edit.labels.weekdays_same_hours')}
                    onChange={(e) => toggleSameCheckboxes(e.target.checked, true)}
                    checked={sameHours}
                />
            </div>
            <div>
                <UIControlCheckbox
                    className="sync"
                    name="weekend_same_hours"
                    id="weekend_same_hours"
                    label={translate('organization_edit.labels.weekends_same_hours')}
                    onChange={(e) => toggleSameCheckboxes(e.target.checked, false)}
                    checked={sameHoursWeekend}
                />
            </div>
            <div className="visible-md visible-lg">
                <br className="visible-md visible-sm visible-xs" />
                <br />
                <table width="100%">
                    <thead>
                        <tr>
                            <th>{translate('organization_edit.labels.day')}</th>
                            <th>{translate('organization_edit.labels.closed')}</th>
                            <th>{translate('organization_edit.labels.start')}</th>
                            <th>{translate('organization_edit.labels.end')}</th>
                            <th className="breaks">{translate('organization_edit.labels.break')}</th>
                        </tr>
                    </thead>
                    {weekDaysKeys.map((weekDayNumber) => (
                        <tbody key={weekDayNumber}>
                            <tr>
                                <td className={`schedule-day-name ${weekDayNumber >= 5 ? 'weekend' : ''}`}>
                                    {weekDays[weekDayNumber]}
                                </td>
                                <td className="schedule-day-available">
                                    <UIControlCheckbox
                                        id={`is_closed_${weekDayNumber}`}
                                        name={`is_closed_${weekDayNumber}`}
                                        onChange={() => {
                                            setScheduleData((scheduleDetails) => {
                                                scheduleDetails[weekDayNumber].is_closed =
                                                    !scheduleDetails[weekDayNumber].is_closed;
                                                return [...scheduleDetails];
                                            });
                                        }}
                                        checked={scheduleData[weekDayNumber].is_closed}
                                    />
                                </td>
                                <td>
                                    {scheduleData[weekDayNumber]?.is_closed ? (
                                        <span>{translate('organization_edit.labels.closed')}</span>
                                    ) : (
                                        <select
                                            className="form-control form-control-sm"
                                            value={scheduleData[weekDayNumber].start_time}
                                            onChange={(e) =>
                                                setDateTime(
                                                    weekDayNumber,
                                                    'start_time',
                                                    e.target.value,
                                                    weekDayNumber < 5 ? sameHours : sameHoursWeekend,
                                                )
                                            }>
                                            {timeOptions[weekDayNumber].time.from.map((item: OfficeScheduleOption) => (
                                                <option key={item.key} value={item.value}>
                                                    {item.value}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </td>
                                <td>
                                    {!scheduleData[weekDayNumber].is_closed && (
                                        <select
                                            className="form-control form-control-sm"
                                            value={scheduleData[weekDayNumber].end_time}
                                            onChange={(e) =>
                                                setDateTime(
                                                    weekDayNumber,
                                                    'end_time',
                                                    e.target.value,
                                                    weekDayNumber < 5 ? sameHours : sameHoursWeekend,
                                                )
                                            }>
                                            {timeOptions[weekDayNumber].time.to.map((item: OfficeScheduleOption) => (
                                                <option key={item.key} value={item.value}>
                                                    {item.value}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </td>
                                <td className="breaks">
                                    <div className="row">
                                        <div className="col col-sm-6">
                                            {!scheduleData[weekDayNumber].is_closed && (
                                                <select
                                                    className="form-control form-control-sm"
                                                    value={scheduleData[weekDayNumber].break_start_time}
                                                    onChange={(e) =>
                                                        setDateTime(
                                                            weekDayNumber,
                                                            'break_start_time',
                                                            e.target.value,
                                                            weekDayNumber < 5 ? sameHours : sameHoursWeekend,
                                                        )
                                                    }>
                                                    {timeOptions[weekDayNumber].break.from.map(
                                                        (item: OfficeScheduleOption) => (
                                                            <option key={item.key} value={item.value}>
                                                                {item.value}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            )}
                                        </div>
                                        <div className="col col-sm-6">
                                            {!scheduleData[weekDayNumber].is_closed && (
                                                <select
                                                    className="form-control form-control-sm"
                                                    value={scheduleData[weekDayNumber].break_end_time}
                                                    onChange={(e) => {
                                                        setDateTime(
                                                            weekDayNumber,
                                                            'break_end_time',
                                                            e.target.value,
                                                            weekDayNumber < 5 ? sameHours : sameHoursWeekend,
                                                        );
                                                    }}>
                                                    {timeOptions[weekDayNumber].break.to.map(
                                                        (item: OfficeScheduleOption) => (
                                                            <option key={item.key} value={item.value}>
                                                                {item.value}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            {errorsMessages[weekDayNumber].length > 0 && (
                                <tr>
                                    <td colSpan={5}>
                                        {errorsMessages[weekDayNumber].map((errors: string, index: number) => (
                                            <FormError key={index} error={errors} />
                                        ))}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    ))}
                </table>
            </div>
            <div className="block-schedule-mobile visible-sm visible-xs">
                {weekDaysKeys.map((weekDayNumber) => (
                    <div className="block-schedule-day" key={weekDayNumber}>
                        <div className="block-schedule-day-name">
                            <div className="flex-row">
                                <div className={`flex-col ${weekDayNumber >= 5 ? 'text-danger' : ''}`}>
                                    {weekDays[weekDayNumber]}
                                </div>
                                {scheduleData[weekDayNumber].is_closed && (
                                    <div className="flex-col text-right">
                                        {translate('organization_edit.labels.closed')}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="block-schedule-day-open">
                            <UIControlCheckbox
                                id={`is_closed_${weekDayNumber}`}
                                name={`is_closed_${weekDayNumber}`}
                                onChange={() => {
                                    setScheduleData((scheduleDetails) => {
                                        scheduleDetails[weekDayNumber].is_closed =
                                            !scheduleDetails[weekDayNumber].is_closed;
                                        return [...scheduleDetails];
                                    });
                                }}
                                label={translate('organization_edit.labels.closed')}
                                checked={scheduleData[weekDayNumber].is_closed}
                            />
                        </div>
                        {!scheduleData[weekDayNumber].is_closed && (
                            <div className="block-schedule-day-open">
                                <div className="form-group">
                                    <div className="form-label">Open time</div>

                                    <select
                                        className="form-control form-control-sm"
                                        value={scheduleData[weekDayNumber].start_time}
                                        onChange={(e) =>
                                            setDateTime(
                                                weekDayNumber,
                                                'start_time',
                                                e.target.value,
                                                weekDayNumber < 5 ? sameHours : sameHoursWeekend,
                                            )
                                        }>
                                        {timeOptions[weekDayNumber].time.from.map((item: OfficeScheduleOption) => (
                                            <option key={item.key} value={item.value}>
                                                {item.value}
                                            </option>
                                        ))}
                                    </select>

                                    <FormError error={errors['schedule.' + weekDayNumber + '.start_time']} />
                                </div>
                                <div className="form-group">
                                    <div className="form-label">Close time</div>
                                    <select
                                        className="form-control form-control-sm"
                                        value={scheduleData[weekDayNumber].end_time}
                                        onChange={(e) =>
                                            setDateTime(
                                                weekDayNumber,
                                                'end_time',
                                                e.target.value,
                                                weekDayNumber < 5 ? sameHours : sameHoursWeekend,
                                            )
                                        }>
                                        {timeOptions[weekDayNumber].time.to.map((item: OfficeScheduleOption) => (
                                            <option key={item.key} value={item.value}>
                                                {item.value}
                                            </option>
                                        ))}
                                    </select>

                                    <FormError error={errors['schedule.' + weekDayNumber + '.end_time']} />
                                </div>
                                <div className="form-group">
                                    <div className="form-label">Pause start time</div>
                                    <select
                                        className="form-control form-control-sm"
                                        value={scheduleData[weekDayNumber].break_start_time}
                                        onChange={(e) =>
                                            setDateTime(
                                                weekDayNumber,
                                                'break_start_time',
                                                e.target.value,
                                                weekDayNumber < 5 ? sameHours : sameHoursWeekend,
                                            )
                                        }>
                                        {timeOptions[weekDayNumber].break.from.map((item: OfficeScheduleOption) => (
                                            <option key={item.key} value={item.value}>
                                                {item.value}
                                            </option>
                                        ))}
                                    </select>

                                    <FormError error={errors['schedule.' + weekDayNumber + '.break_start_time']} />
                                </div>
                                <div className="form-group">
                                    <div className="form-label">Pause end time</div>

                                    <select
                                        className="form-control form-control-sm"
                                        value={scheduleData[weekDayNumber].break_end_time}
                                        onChange={(e) =>
                                            setDateTime(
                                                weekDayNumber,
                                                'break_end_time',
                                                e.target.value,
                                                weekDayNumber < 5 ? sameHours : sameHoursWeekend,
                                            )
                                        }>
                                        {timeOptions[weekDayNumber].break.to.map((item: OfficeScheduleOption) => (
                                            <option key={item.key} value={item.value}>
                                                {item.value}
                                            </option>
                                        ))}
                                    </select>

                                    <FormError error={errors['schedule.' + weekDayNumber + '.break_end_time']} />
                                </div>
                                <br />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
