import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import SponsorVoucher from '../../../../props/models/Sponsor/SponsorVoucher';
import Organization, { Permission } from '../../../../props/models/Organization';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalVoucherRecordEdit from '../../../modals/ModalVoucherRecordEdit';
import useVoucherRecordService from '../../../../services/VoucherRecordService';
import { PaginationData } from '../../../../props/ApiResponses';
import VoucherRecord from '../../../../props/models/VoucherRecord';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import { hasPermission } from '../../../../helpers/utils';
import useTranslate from '../../../../hooks/useTranslate';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushApiError from '../../../../hooks/usePushApiError';
import TableRowActions from '../../../elements/tables/TableRowActions';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';

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

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        q: string;
        per_page?: number;
        order_by?: string;
        order_dir?: string;
    }>({
        q: '',
        per_page: paginatorService.getPerPage(paginatorKey),
        order_by: 'created_at',
        order_dir: 'asc',
    });

    const fetchRecords = useCallback(() => {
        setProgress(0);

        voucherRecordService
            .list(organization.id, voucher.id, filterValuesActive)
            .then((res) => setRecords(res.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [filterValuesActive, organization.id, setProgress, voucher.id, voucherRecordService, pushApiError]);

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
                    {records?.meta ? ` (${records?.meta?.total})` : ''}
                </div>
                <div className="card-header-filters">
                    <div className="block block-inline-filters form">
                        <div className="form-group">
                            <input
                                className="form-control"
                                type="search"
                                value={filterValues.q}
                                placeholder={translate('voucher_records.labels.search')}
                                onChange={(e) => filterUpdate({ q: e.target.value })}
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

            <LoaderTableCard
                empty={records?.meta?.total == 0}
                emptyTitle={'Geen persoonsgegevens gevonden'}
                columns={voucherRecordService.getColumns()}
                tableOptions={{ filter, sortable: true }}
                paginator={{ key: paginatorKey, data: records, filterValues, filterUpdate }}>
                {records?.data?.map((record, index: number) => (
                    <tr key={index}>
                        <td className="td-narrow nowrap">{record.id}</td>
                        <td className="nowrap">{record.record_type.name}</td>
                        <td>{record.value_locale}</td>
                        <td className="nowrap">{record.created_at_locale}</td>
                        <td className={classNames(!record.note && 'text-muted')}>{record.note || 'Geen notitie'}</td>

                        <td className={'table-td-actions text-right'}>
                            {hasPermission(organization, Permission.MANAGE_VOUCHERS) ? (
                                <TableRowActions
                                    content={() => (
                                        <div className="dropdown dropdown-actions">
                                            <a className="dropdown-item" onClick={() => editRecord(record)}>
                                                <div className="mdi mdi-pencil-outline icon-start" />
                                                Bewerking
                                            </a>
                                            <a className="dropdown-item" onClick={() => deleteRecord(record)}>
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
            </LoaderTableCard>
        </div>
    );
}
