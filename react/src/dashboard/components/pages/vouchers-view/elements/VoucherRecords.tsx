import React, { useCallback, useEffect, useState } from 'react';
import Voucher from '../../../../props/models/Voucher';
import Organization from '../../../../props/models/Organization';
import useOpenModal from '../../../../hooks/useOpenModal';
import Paginator from '../../../../modules/paginator/components/Paginator';
import ModalVoucherRecordEdit from '../../../modals/ModalVoucherRecordEdit';
import useVoucherRecordService from '../../../../services/VoucherRecordService';
import { PaginationData } from '../../../../props/ApiResponses';
import VoucherRecord from '../../../../props/models/VoucherRecord';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import useFilter from '../../../../hooks/useFilter';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import ThSortable from '../../../elements/tables/ThSortable';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import { hasPermission } from '../../../../helpers/utils';
import useTranslate from '../../../../hooks/useTranslate';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushDanger from '../../../../hooks/usePushDanger';
import EmptyCard from '../../../elements/empty-card/EmptyCard';

export default function VoucherRecords({ voucher, organization }: { voucher: Voucher; organization: Organization }) {
    const translate = useTranslate();

    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

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

    const fetchRecords = useCallback(() => {
        setProgress(0);

        voucherRecordService
            .list(organization.id, voucher.id, filter.activeValues)
            .then((res) => setRecords(res.data))
            .catch((res) => pushDanger('Mislukt!', res.data.message))
            .finally(() => setProgress(100));
    }, [filter.activeValues, organization.id, setProgress, voucher.id, voucherRecordService, pushDanger]);

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
                <div className="flex">
                    <div className="flex flex-grow">
                        <div className="card-title">
                            {translate('voucher_records.header.title')}
                            {records.meta ? ` (${records.meta.total})` : ''}
                        </div>
                    </div>
                    <div className="flex">
                        <div className="block block-inline-filters">
                            <div className="form">
                                <div className="form-group">
                                    <input
                                        className="form-control"
                                        type="search"
                                        value={filter.values.q}
                                        placeholder={translate('voucher_records.labels.search')}
                                        onChange={(e) => filter.update({ q: e.target.value })}
                                    />
                                </div>
                            </div>

                            {hasPermission(organization, 'manage_vouchers') && (
                                <div className="button button-primary button-sm" onClick={() => editRecord()}>
                                    <em className="mdi mdi-plus-circle icon-start" />
                                    {translate('voucher_records.buttons.add_record')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {records.data.length > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table">
                                <tbody>
                                    <tr className="nowrap">
                                        <ThSortable
                                            className="th-narrow"
                                            filter={filter}
                                            label={translate('voucher_records.labels.id')}
                                            value="id"
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={translate('voucher_records.labels.record_type')}
                                            value="record_type_name"
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={translate('voucher_records.labels.value')}
                                            value="value"
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={translate('voucher_records.labels.created_at')}
                                            value="created_at"
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={translate('voucher_records.labels.note')}
                                            value="note"
                                        />
                                        {hasPermission(organization, 'manage_vouchers') && (
                                            <ThSortable
                                                className="th-narrow text-right"
                                                label={translate('voucher_records.labels.action')}
                                            />
                                        )}
                                    </tr>

                                    {records.data.map((record, index: number) => (
                                        <tr key={index}>
                                            <td className="td-narrow nowrap">{record.id}</td>
                                            <td className="nowrap">{record.record_type.name}</td>
                                            <td>{record.value_locale}</td>
                                            <td className="nowrap">{record.created_at_locale}</td>
                                            <td className={record.note ? '' : 'text-muted'}>
                                                {record.note || 'Geen notitie'}
                                            </td>
                                            {hasPermission(organization, 'manage_vouchers') && (
                                                <td>
                                                    <div className="button-group">
                                                        <div
                                                            className="button button-sm button-icon button-default"
                                                            onClick={() => editRecord(record)}>
                                                            <div className="mdi mdi-pencil-outline icon-start" />
                                                        </div>
                                                        <div
                                                            className="button button-sm button-icon button-danger"
                                                            onClick={() => deleteRecord(record)}>
                                                            <div className="mdi mdi-delete-outline icon-start" />
                                                        </div>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
