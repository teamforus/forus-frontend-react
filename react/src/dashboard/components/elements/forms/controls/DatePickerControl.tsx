import React from 'react';
import { getMonth, getYear } from 'date-fns';
import { range } from 'lodash';
import ReactDatePicker from 'react-datepicker';

export default function DatePickerControl({
    value,
    onChange,
    placeholder,
    minYear = 1900,
}: {
    value: Date | null;
    onChange: (value: Date) => void;
    placeholder?: string;
    minYear?: number;
}) {
    const years = range(minYear, getYear(new Date()) + 1, 1);
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
            selected={value}
            onChange={onChange}
            className={'form-control'}
            dateFormat={'yyyy-MM-dd'}
            placeholderText={placeholder}
        />
    );
}
