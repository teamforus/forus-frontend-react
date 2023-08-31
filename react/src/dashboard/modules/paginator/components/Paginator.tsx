import React, { useCallback, useEffect, useState } from 'react';
import FilterModel from '../../../types/FilterModel';
import FilterSetter from '../../../types/FilterSetter';
import { ApiPaginationMetaProp } from '../../../props/ApiResponses';
import { useTranslation } from 'react-i18next';

export default function Paginator({
    meta,
    filters,
    countButtons = 5,
    updateFilters,
}: {
    meta: ApiPaginationMetaProp;
    filters: FilterModel;
    updateFilters: FilterSetter;
    countButtons?: number;
}) {
    const [pages, setPages] = useState([]);
    const { t } = useTranslation();

    const getPages = useCallback((meta, countButtons = 5) => {
        let fromPage = Math.max(1, meta.current_page - Math.round(countButtons / 2 - 1));
        const pages = [];

        if (countButtons > meta.last_page - fromPage) {
            fromPage = Math.max(1, meta.last_page - countButtons + 1);
        }

        while (pages.length < countButtons && fromPage <= meta.last_page) {
            pages.push(fromPage++);
        }

        return pages;
    }, []);

    const setPage = useCallback((page) => updateFilters({ ...filters, page }), [filters, updateFilters]);

    useEffect(() => {
        setPages(getPages(meta, countButtons));

        if (meta.last_page < meta.current_page) {
            updateFilters({ page: 1 });
        }
    }, [meta, countButtons, getPages, updateFilters]);

    return (
        <div className="table-pagination">
            <div className="table-pagination-counter">
                {meta.from !== meta.to ? meta.from + '-' + meta.to : meta.from}
                &nbsp;
                {t('paginator.labels.from')}
                &nbsp;
                {meta.total}
            </div>
            <div className="table-pagination-navigation">
                <div
                    onClick={() => setPage(1)}
                    className={'button button-default' + (meta.current_page === 1 ? ' disabled' : '')}>
                    {t('paginator.buttons.first')}
                </div>
                {pages.map((page, key) => (
                    <div
                        key={key}
                        onClick={() => setPage(page)}
                        className={'button' + (page === meta.current_page ? ' button-primary' : ' button-default')}>
                        {page}
                    </div>
                ))}
                <div
                    onClick={() => setPage(meta.last_page)}
                    className={'button button-default' + (meta.current_page === meta.last_page ? ' disabled' : '')}>
                    {t('paginator.buttons.last')}
                </div>
            </div>
        </div>
    );
}
