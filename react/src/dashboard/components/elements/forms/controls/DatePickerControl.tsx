import React from 'react';
import { getMonth, getYear } from 'date-fns';
import { range } from 'lodash';
import ReactDatePicker from 'react-datepicker';

export default function DatePickerControl({
    value,
    onChange,
    disabled,
    placeholder,
    minYear = 1900,
    maxYear = getYear(new Date()) + 1,
    dateFormat = 'yyyy-MM-dd',
    dateMin,
    dateMax,
    dateInitial = null,
}: {
    value: Date | null;
    disabled?: boolean;
    onChange: (value: Date) => void;
    placeholder?: string;
    minYear?: number;
    maxYear?: number;
    dateFormat?: string;
    dateMin?: Date;
    dateMax?: Date;
    dateInitial?: Date;
}) {
    const years = range(minYear, maxYear, 1);
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    return (
        <ReactDatePicker
            disabled={disabled}
            popperProps={{ strategy: 'fixed' }}
            renderCustomHeader={({
                date,
                changeYear,
                changeMonth,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
            }) => (
                <div
                    className={'flex flex-horizontal'}
                    style={{
                        padding: '0 8px',
                    }}>
                    <div className="flex">
                        <button
                            type={'button'}
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}
                            style={{
                                appearance: 'none',
                                background: '#fff',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '20px',
                                padding: 0,
                                color: 'var(--color-primary)',
                            }}>
                            <em className="mdi mdi-chevron-left" />
                        </button>
                    </div>
                    <div className="flex flex-grow flex-center">
                        <select
                            value={getYear(date)}
                            onChange={({ target: { value } }) => changeYear(parseInt(value))}
                            style={{
                                appearance: 'none',
                                minWidth: '50px',
                                border: 'none',
                                padding: '0 2px',
                                font: '600 13px/20px var(--base-font)',
                                textAlign: 'right',
                            }}>
                            {years.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>

                        <select
                            value={months[getMonth(date)]}
                            onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
                            style={{
                                appearance: 'none',
                                minWidth: '50px',
                                border: 'none',
                                font: '600 13px/20px var(--base-font)',
                                padding: '0 2px',
                            }}>
                            {months.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex">
                        <button
                            type={'button'}
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                            style={{
                                appearance: 'none',
                                background: '#fff',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '20px',
                                padding: 0,
                                color: 'var(--color-primary)',
                            }}>
                            <em className="mdi mdi-chevron-right" />
                        </button>
                    </div>
                </div>
            )}
            onKeyDown={(e) => e?.stopPropagation()}
            selected={value}
            onChange={onChange}
            className={'form-control'}
            dateFormat={dateFormat}
            placeholderText={placeholder || dateFormat}
            minDate={dateMin || undefined}
            maxDate={dateMax || undefined}
            startDate={dateInitial}
        />
    );
}
