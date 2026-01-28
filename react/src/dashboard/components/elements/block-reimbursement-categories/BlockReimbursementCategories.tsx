import React, { useCallback, useEffect, useState } from 'react';
import { PaginationData } from '../../../props/ApiResponses';
import ReimbursementCategory from '../../../props/models/ReimbursementCategory';
import Paginator from '../../../modules/paginator/components/Paginator';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useOpenModal from '../../../hooks/useOpenModal';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useReimbursementCategoryService } from '../../../services/ReimbursementCategoryService';
import usePushSuccess from '../../../hooks/usePushSuccess';
import ModalReimbursementCategoryEdit from '../../modals/ModalReimbursementCategoryEdit';
import useConfirmReimbursementCategoryDelete from './hooks/useConfirmReimbursementCategoryDelete';
import useSetProgress from '../../../hooks/useSetProgress';
import useTranslate from '../../../hooks/useTranslate';
import LoadingCard from '../loading-card/LoadingCard';
import LoaderTableCard from '../loader-table-card/LoaderTableCard';
import usePushApiError from '../../../hooks/usePushApiError';
import useConfigurableTable from '../../pages/vouchers/hooks/useConfigurableTable';
import TableTopScroller from '../tables/TableTopScroller';
import TableRowActions from '../tables/TableRowActions';
import classNames from 'classnames';
import useFilterNext from '../../../modules/filter_next/useFilterNext';

export default function BlockReimbursementCategories({
    compact = false,
    createCategoryRef = null,
}: {
    compact?: boolean;
    createCategoryRef?: React.MutableRefObject<() => Promise<boolean>>;
}) {
    const activeOrganization = useActiveOrganization();

    const openModal = useOpenModal();
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();
    const setProgress = useSetProgress();

    const paginatorService = usePaginatorService();
    const reimbursementCategoryService = useReimbursementCategoryService();

    const confirmReimbursementCategoryDelete = useConfirmReimbursementCategoryDelete();

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<PaginationData<ReimbursementCategory>>(null);
    const [paginatorKey] = useState('reimbursement_categories');

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext({
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const { headElement, configsElement } = useConfigurableTable(reimbursementCategoryService.getColumns());

    const fetchReimbursementCategories = useCallback(() => {
        setLoading(true);
        setProgress(0);

        reimbursementCategoryService
            .list(activeOrganization.id, filterValuesActive)
            .then((res) => setCategories(res.data))
            .catch(pushApiError)
            .finally(() => {
                setLoading(false);
                setProgress(100);
            });
    }, [setProgress, activeOrganization.id, filterValuesActive, pushApiError, reimbursementCategoryService]);

    const editReimbursementCategory = useCallback(
        async (category: ReimbursementCategory = null): Promise<boolean> => {
            return new Promise((resolve) => {
                openModal((modal) => (
                    <ModalReimbursementCategoryEdit
                        modal={modal}
                        category={category}
                        onSubmit={() => {
                            fetchReimbursementCategories();
                            resolve(false);
                        }}
                        onCancel={() => resolve(false)}
                    />
                ));
            });
        },
        [fetchReimbursementCategories, openModal],
    );

    const deleteReimbursementCategory = useCallback(
        (reimbursementCategory: ReimbursementCategory) => {
            confirmReimbursementCategoryDelete().then((confirmed) => {
                if (!confirmed) {
                    return;
                }

                reimbursementCategoryService
                    .destroy(activeOrganization.id, reimbursementCategory.id)
                    .then(() => {
                        fetchReimbursementCategories();
                        pushSuccess('Opgeslagen!');
                    })
                    .catch(pushApiError);
            });
        },
        [
            confirmReimbursementCategoryDelete,
            reimbursementCategoryService,
            fetchReimbursementCategories,
            activeOrganization.id,
            pushApiError,
            pushSuccess,
        ],
    );

    useEffect(() => {
        fetchReimbursementCategories();
    }, [fetchReimbursementCategories]);

    useEffect(() => {
        if (createCategoryRef) {
            createCategoryRef.current = editReimbursementCategory;
        }
    }, [editReimbursementCategory, createCategoryRef]);

    if (!categories) {
        return <LoadingCard />;
    }

    return (
        <div className="card card-last">
            {!compact && (
                <div className="card-header">
                    <div className="flex flex-grow card-title">
                        {categories?.meta
                            ? `Declaratie categorieën (${categories?.meta.total})`
                            : `Declaratie categorieën`}
                    </div>

                    <div className="card-header-filters">
                        <div className="block block-inline-filters">
                            <a
                                className="button button-primary button-sm"
                                id="add_reimbursement_category"
                                onClick={() => editReimbursementCategory()}>
                                <em className="mdi mdi-plus-circle icon-start" />
                                {translate('Toevoegen')}
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <LoaderTableCard
                loading={loading}
                empty={categories?.data.length === 0}
                emptyTitle={'Er zijn momenteel geen declaratie categorieën.'}>
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {categories?.data.map((reimbursementCategory) => (
                                        <tr key={reimbursementCategory.id}>
                                            <td>{reimbursementCategory.name}</td>
                                            <td>{reimbursementCategory.organization.name}</td>
                                            <td>{reimbursementCategory.reimbursements_count}</td>

                                            <td className="td-narrow text-right">
                                                <TableRowActions
                                                    content={({ close }) => (
                                                        <div className="dropdown dropdown-actions">
                                                            <a
                                                                className="dropdown-item"
                                                                onClick={() => {
                                                                    editReimbursementCategory(reimbursementCategory);
                                                                    close();
                                                                }}>
                                                                <em className="mdi mdi-pen icon-start" />
                                                                {translate('Bewerken')}
                                                            </a>
                                                            <a
                                                                className={classNames(
                                                                    'dropdown-item',
                                                                    reimbursementCategory.reimbursements_count > 0 &&
                                                                        'disabled',
                                                                )}
                                                                onClick={() => {
                                                                    deleteReimbursementCategory(reimbursementCategory);
                                                                    close();
                                                                }}>
                                                                <em className="icon-start mdi mdi-delete" />
                                                                Verwijderen
                                                            </a>
                                                        </div>
                                                    )}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableTopScroller>
                    </div>
                </div>

                {categories?.meta.total > 0 && (
                    <div className={classNames('card-section', compact && 'card-section-narrow')}>
                        <Paginator
                            meta={categories.meta}
                            filters={filterValues}
                            updateFilters={filterUpdate}
                            perPageKey={paginatorKey}
                        />
                    </div>
                )}
            </LoaderTableCard>
        </div>
    );
}
