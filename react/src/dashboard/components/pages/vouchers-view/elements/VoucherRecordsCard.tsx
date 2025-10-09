import React, { useCallback, useEffect, useState } from 'react';
import SponsorVoucher from '../../../../props/models/Sponsor/SponsorVoucher';
import Organization, { Permission } from '../../../../props/models/Organization';
import useOpenModal from '../../../../hooks/useOpenModal';
import Paginator from '../../../../modules/paginator/components/Paginator';
import ModalVoucherRecordEdit from '../../../modals/ModalVoucherRecordEdit';
import useVoucherRecordService from '../../../../services/VoucherRecordService';
import { PaginationData } from '../../../../props/ApiResponses';
import VoucherRecord from '../../../../props/models/VoucherRecord';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import useFilter from '../../../../hooks/useFilter';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import { hasPermission } from '../../../../helpers/utils';
import useTranslate from '../../../../hooks/useTranslate';
import useSetProgress from '../../../../hooks/useSetProgress';
import EmptyCard from '../../../elements/empty-card/EmptyCard';
import usePushApiError from '../../../../hooks/usePushApiError';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import TableRowActions from '../../../elements/tables/TableRowActions';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';

export default function VoucherRecordsCard({
    voucher,
    organization,
}: {
    voucher: SponsorVoucher;
    organization: Organization;
}) {
    const translate = useTranslate();

    const openModal = useOpenModal();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const paginatorService = usePaginatorService();
    const voucherRecordService = useVoucherRecordService();

    const [paginatorKey] = useState('voucher-records');
    const [records, setRecords] = useState<PaginationData<VoucherRecord>>(null);

    const filter = useFilter({
        q: '',
        order_by: 'created_at',
        order_dir: 'asc',
        per_page: paginatorService.getPerPage(paginatorKey, 10),
    });

    const { headElement, configsElement } = useConfigurableTable(voucherRecordService.getColumns(), {
        filter,
        sortable: true,
    });

    const fetchRecords = useCallback(() => {
        setProgress(0);

        voucherRecordService
            .list(organization.id, voucher.id, filter.activeValues)
            .then((res) => setRecords(res.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [filter.activeValues, organization.id, setProgress, voucher.id, voucherRecordService, pushApiError]);

    const editRecord = useCallback(
        (record: VoucherRecord = null) => {
            openModal((modal) => (
                <ModalVoucherRecordEdit
                    modal={modal}
                    voucher={voucher}
                    record={record}
                    organization={organization}
                    onClose={(record: VoucherRecord) => (record ? fetchRecords() : null)}
                />
            ));
        },
        [fetchRecords, openModal, organization, voucher],
    );

    const deleteRecord = useCallback(
        (record = null) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('modals.danger_zone.remove_voucher_record.title')}
                    description={translate('modals.danger_zone.remove_voucher_record.description')}
                    buttonCancel={{
                        onClick: modal.close,
                        text: translate('modals.danger_zone.remove_voucher_record.buttons.cancel'),
                    }}
                    buttonSubmit={{
                        onClick: () => {
                            modal.close();
                            voucherRecordService.destroy(organization.id, voucher.id, record.id).then(() => {
                                fetchRecords();
                                pushSuccess('Verwijderd!', 'Persoonsgegeven is verwijderd!');
                            });
                        },
                        text: translate('modals.danger_zone.remove_voucher_record.buttons.confirm'),
                    }}
                />
            ));
        },
        [fetchRecords, openModal, organization.id, pushSuccess, translate, voucher.id, voucherRecordService],
    );

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    if (!records) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex flex-grow card-title">
                    {translate('voucher_records.header.title')}
                    {records.meta ? ` (${records.meta.total})` : ''}
                </div>
                <div className="card-header-filters">
                    <div className="block block-inline-filters form">
                        <div className="form-group">
                            <input
                                className="form-control"
                                type="search"
                                value={filter.values.q}
                                placeholder={translate('voucher_records.labels.search')}
                                onChange={(e) => filter.update({ q: e.target.value })}
                            />
                        </div>
                        {hasPermission(organization, Permission.MANAGE_VOUCHERS) && (
                            <div className="button button-primary button-sm" onClick={() => editRecord()}>
                                <em className="mdi mdi-plus-circle icon-start" />
                                {translate('voucher_records.buttons.add_record')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {records.data.length > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {records.data.map((record, index: number) => (
                                        <tr key={index}>
                                            <td className="td-narrow nowrap">{record.id}</td>
                                            <td className="nowrap">{record.record_type.name}</td>
                                            <td>{record.value_locale}</td>
                                            <td className="nowrap">{record.created_at_locale}</td>
                                            <td className={record.note ? '' : 'text-muted'}>
                                                {record.note || 'Geen notitie'}
                                            </td>

                                            <td className={'table-td-actions text-right'}>
                                                {hasPermission(organization, Permission.MANAGE_VOUCHERS) ? (
                                                    <TableRowActions
                                                        content={() => (
                                                            <div className="dropdown dropdown-actions">
                                                                <a
                                                                    className="dropdown-item"
                                                                    onClick={() => editRecord(record)}>
                                                                    <div className="mdi mdi-pencil-outline icon-start" />
                                                                    Bewerking
                                                                </a>
                                                                <a
                                                                    className="dropdown-item"
                                                                    onClick={() => deleteRecord(record)}>
                                                                    <div className="mdi mdi-delete-outline icon-start" />
                                                                    Verwijderen
                                                                </a>
                                                            </div>
                                                        )}
                                                    />
                                                ) : (
                                                    <TableEmptyValue />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableTopScroller>
                    </div>
                </div>
            )}

            {records.meta.total == 0 ? (
                <EmptyCard title={'Geen persoonsgegevens gevonden'} type={'card-section'} />
            ) : (
                <div className="card-section">
                    <Paginator
                        meta={records.meta}
                        filters={filter.values}
                        perPageKey={paginatorKey}
                        updateFilters={filter.update}
                    />
                </div>
            )}
        </div>
    );
}
