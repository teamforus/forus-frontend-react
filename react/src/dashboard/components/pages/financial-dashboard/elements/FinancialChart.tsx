import React, { useCallback, useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { currencyFormat } from '../../../../helpers/string';
import { ProviderFinancialStatistics } from '../types/FinancialStatisticTypes';
import LoadingCard from '../../../elements/loading-card/LoadingCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function FinancialChart({ chartData }: { chartData: ProviderFinancialStatistics }) {
    const [timeFormat] = useState('MM/DD/YYYY');
    const [data, setData] = useState(null);
    const [field, setField] = useState('amount');
    const [options, setOptions] = useState(null);

    const drawChart = useCallback(() => {
        const labels = [];
        const values = [];

        chartData.dates.forEach((value) => {
            labels.push(value.key);
            values.push({ x: value.key, y: value[field || 'value'] });
        });

        setData({
            labels: labels,
            datasets: [{ data: values, borderColor: '#2987fd', backgroundColor: '#2987fd' }],
        });

        setOptions({
            maintainAspectRatio: false,
            elements: { line: { fill: false } },
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    time: {
                        unit: 'day',
                        round: 'day',
                        tooltipFormat: 'll',
                        displayFormats: { quarter: 'll' },
                        parser: timeFormat,
                    },
                },
                y: {
                    ticks: {
                        beginAtZero: true,
                        callback:
                            field === 'amount'
                                ? (val?: string) => currencyFormat(parseFloat(val))
                                : (val?: string) => val,
                        stepSize: field === 'amount' ? null : 1,
                    },
                },
            },
        });
    }, [chartData, field, timeFormat]);

    useEffect(() => {
        drawChart();
    }, [drawChart]);

    if (!data) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header flex">
                <div className="flex flex-grow">
                    <div className="card-title">Grafiek</div>
                </div>
                <div className="flex block block-label-tabs">
                    <div
                        className={`label-tab ${field === 'amount' ? 'active' : ''}`}
                        onClick={() => setField('amount')}>
                        Besteed
                    </div>
                    <div className={`label-tab ${field === 'count' ? 'active' : ''}`} onClick={() => setField('count')}>
                        Totaal transacties
                    </div>
                </div>
            </div>
            <div className="card-section">
                <Bar data={data} options={options} height="350px" />
            </div>
        </div>
    );
}
