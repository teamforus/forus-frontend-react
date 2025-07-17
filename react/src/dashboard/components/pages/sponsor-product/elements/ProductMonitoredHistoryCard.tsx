import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';
import React, { useState } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import BlockLabelTabs from '../../../elements/block-label-tabs/BlockLabelTabs';
import ProductMonitoredHistoryCardItem from './ProductMonitoredHistoryCardItem';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import { useFundService } from '../../../../services/FundService';
import TableTopScroller from '../../../elements/tables/TableTopScroller';

export default function ProductMonitoredHistoryCard({ product }: { product: SponsorProduct }) {
    const translate = useTranslate();
    const [historyView, setHistoryView] = useState<'compare' | 'diff'>('compare');

    const fundService = useFundService();
    const { headElement, configsElement } = useConfigurableTable(fundService.getProductHistoryColumns());

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {translate('sponsor_products.labels.logs')} ({product.monitored_history?.length})
                </div>
                <BlockLabelTabs
                    value={historyView}
                    setValue={(historyView: 'compare' | 'diff') => setHistoryView(historyView)}
                    tabs={[
                        { value: 'compare', label: 'Tekstueel' },
                        { value: 'diff', label: 'Visueel' },
                    ]}
                />
            </div>

            {product?.monitored_history?.length > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {product?.monitored_history?.map((item, id) => (
                                        <ProductMonitoredHistoryCardItem
                                            key={id}
                                            item={item}
                                            historyView={historyView}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </TableTopScroller>
                    </div>
                </div>
            )}

            {product?.monitored_history.length == 0 && (
                <div className="card-section text-center">
                    <div className="card-subtitle">Er zijn geen wijzigingen geregistreerd.</div>
                </div>
            )}
        </div>
    );
}
