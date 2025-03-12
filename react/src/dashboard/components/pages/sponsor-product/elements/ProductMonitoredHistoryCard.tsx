import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';
import React, { useState } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import BlockLabelTabs from '../../../elements/block-label-tabs/BlockLabelTabs';
import ProductMonitoredHistoryCardItem from './ProductMonitoredHistoryCardItem';

export default function ProductMonitoredHistoryCard({ product }: { product: SponsorProduct }) {
    const translate = useTranslate();
    const [historyView, setHistoryView] = useState<'compare' | 'diff'>('compare');

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
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>{translate('sponsor_products.labels.updated_fields')}</th>
                                        <th className={'text-right'}>{translate('sponsor_products.labels.date')}</th>
                                    </tr>
                                </thead>

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
                        </div>
                    </div>
                </div>
            )}

            {product?.monitored_history.length == 0 && (
                <div className="card-section text-center">
                    <div className="card-subtitle">Er zijn geen aanbiedingen gevonden voor de zoekopdracht.</div>
                </div>
            )}
        </div>
    );
}
