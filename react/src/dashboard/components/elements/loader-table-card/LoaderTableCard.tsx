import React, { Fragment, ReactNode } from 'react';
import LoadingCard from '../loading-card/LoadingCard';
import EmptyCard, { EmptyButtonType } from '../empty-card/EmptyCard';
import { ConfigurableTableColumn } from '../../pages/vouchers/hooks/useConfigurableTable';
import LoaderTableCardSection, { LoaderTableCardSectionOptions } from './LoaderTableCardSection';
import { PaginationData } from '../../../props/ApiResponses';
import Paginator from '../../../modules/paginator/components/Paginator';
import { FilterModel, FilterSetter } from '../../../modules/filter_next/types/FilterParams';

export default function LoaderTableCard({
    empty = false,
    emptyTitle = '',
    emptyDescription,
    emptyButton = null,
    loading = false,
    children,
    columns,
    paginator,
    tableOptions,
    dusk,
}: {
    empty?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyButton?: EmptyButtonType | null;
    loading?: boolean;
    children: ReactNode;
    columns?: Array<ConfigurableTableColumn>;
    paginator?: {
        key: string;
        data: PaginationData<unknown>;
        filterValues: FilterModel;
        filterUpdate: FilterSetter;
    };
    tableOptions?: LoaderTableCardSectionOptions;
    dusk?: string;
}) {
    if (loading) {
        return <LoadingCard type="card-section" />;
    }

    if (empty) {
        return (
            <EmptyCard
                type="card-section"
                title={emptyTitle || 'Niets gevonden'}
                description={emptyDescription}
                button={emptyButton}
            />
        );
    }

    if (columns) {
        return (
            <Fragment>
                <LoaderTableCardSection columns={columns} options={tableOptions} dusk={dusk}>
                    {children}
                </LoaderTableCardSection>

                {paginator?.data?.meta && (
                    <div className="card-section">
                        <Paginator
                            meta={paginator.data.meta}
                            filters={paginator.filterValues}
                            updateFilters={paginator.filterUpdate}
                            perPageKey={paginator.key}
                        />
                    </div>
                )}
            </Fragment>
        );
    }

    return <Fragment>{children}</Fragment>;
}
