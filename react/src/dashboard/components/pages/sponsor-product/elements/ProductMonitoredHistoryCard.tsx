import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';
import React, { useState } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import BlockLabelTabs from '../../../elements/block-label-tabs/BlockLabelTabs';
import ProductMonitoredHistoryCardItem from './ProductMonitoredHistoryCardItem';
import { useFundService } from '../../../../services/FundService';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';

export default function ProductMonitoredHistoryCard({ product }: { product: SponsorProduct }) {
    const translate = useTranslate();
    const [historyView, setHistoryView] = useState<'compare' | 'diff'>('compare');

    const fundService = useFundService();

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

            <LoaderTableCard
                empty={product?.monitored_history.length == 0}
                emptyTitle={'Er zijn geen wijzigingen geregistreerd.'}
                columns={fundService.getProductHistoryColumns()}>
                {product?.monitored_history?.map((item, id) => (
                    <ProductMonitoredHistoryCardItem key={id} item={item} historyView={historyView} />
                ))}
            </LoaderTableCard>
        </div>
    );
}
