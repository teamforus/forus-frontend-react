import React from 'react';
import ProviderFinancialStatistics from '../../../../services/types/ProviderFinancialStatistics';

export default function FinancialStatistics({ chartData }: { chartData: ProviderFinancialStatistics }) {
    return (
        <div className="financial-totals">
            <div className="financial-totals-col">
                <div className="financial-totals-header">
                    <div className="financial-totals-label">Totaal uitgegeven</div>
                    <div className="financial-totals-label financial-totals-label-sm">Totaal aantal transacties</div>
                </div>
                <div className="financial-totals-content">
                    <div className="financial-totals-value">{chartData.totals.amount_locale}</div>
                    <div className="financial-totals-value">{chartData.totals.count}</div>
                </div>
            </div>

            <div className="financial-totals-col">
                <div className="financial-totals-header">
                    <div className="financial-totals-label">Hoogste aankoopbedrag</div>
                    <div className="financial-totals-label financial-totals-label-sm">Bij aanbieder</div>
                </div>

                {chartData.highest_transaction ? (
                    <div className="financial-totals-content">
                        <div className="financial-totals-value">{chartData.highest_transaction.amount}</div>
                        {chartData.highest_transaction.provider ? (
                            <div className="financial-totals-value financial-totals-value-sm">
                                {chartData.highest_transaction.provider}
                            </div>
                        ) : (
                            <div className="financial-totals-value financial-totals-value-sm text-muted">
                                Geen provider
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="financial-totals-content">
                        <div className="financial-totals-value">
                            <small className="text-strong text-muted">Geen transactie</small>
                        </div>
                        <div className="financial-totals-value">&nbsp;</div>
                    </div>
                )}
            </div>

            <div className="financial-totals-col">
                <div className="financial-totals-header">
                    <div className="financial-totals-label">Hoogste dagtotaal</div>
                    <div className="financial-totals-label financial-totals-label-sm">Datum</div>
                </div>

                {chartData.highest_daily_transaction ? (
                    <div className="financial-totals-content">
                        <div className="financial-totals-value">{chartData.highest_daily_transaction.amount}</div>
                        <div className="financial-totals-value financial-totals-value-sm">
                            {chartData.highest_daily_transaction.date_locale}
                        </div>
                    </div>
                ) : (
                    <div className="financial-totals-content">
                        <div className="financial-totals-value">
                            <small className="text-strong text-muted">Geen transacties</small>
                        </div>
                        <div className="financial-totals-value">&nbsp;</div>
                    </div>
                )}
            </div>
        </div>
    );
}
