import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Record from '../../../../props/models/Record';
import { ResponseErrorData } from '../../../../props/ApiResponses';
import DatePickerControl from '../../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../../helpers/dates';
import FormError from '../../../elements/forms/errors/FormError';
import { useRecordTypeService } from '../../../../services/RecordTypeService';
import SelectControl from '../../../elements/select-control/SelectControl';
import useTranslate from '../../../../hooks/useTranslate';
import useSetProgress from '../../../../hooks/useSetProgress';
import RecordType from '../../../../props/models/RecordType';
import usePushApiError from '../../../../hooks/usePushApiError';

export default function VoucherRecordsEditor({
    errors,
    records,
    setRecords,
}: {
    errors: ResponseErrorData;
    records: Array<Record>;
    setRecords: (records: Array<Record>) => void;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const recordTypeService = useRecordTypeService();

    const [recordType, setRecordType] = useState<Partial<RecordType>>(null);
    const [recordTypes, setRecordTypes] = useState<Array<Partial<RecordType>>>(null);
    const [showRecordSelector, setShowRecordSelector] = useState<boolean>(false);

    const recordTypesAvailable = useMemo(() => {
        return recordTypes?.filter((item) => !records.map((record) => record.key).includes(item.key));
    }, [recordTypes, records]);

    const addRecord = useCallback(
        (recordType: Partial<RecordType>) => {
            setRecords([...records, { key: recordType.key, name: recordType.name }]);
            setRecordType(recordTypes[0]);
        },
        [records, setRecords, recordTypes],
    );

    const removeRecord = useCallback(
        (recordKey: string) => {
            setRecords(records.filter((record) => record.key != recordKey));
        },
        [records, setRecords],
    );

    const fetchRecordTypes = useCallback(() => {
        setProgress(0);

        recordTypeService
            .list({ vouchers: 1 })
            .then((res) => {
                const types = [{ key: null, name: 'Selecteer type...' }, ...res.data];

                setRecordTypes(types);
                setRecordType(types[0]);
            })
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [pushApiError, recordTypeService, setProgress]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    return (
        <div className="block block-voucher-records-editor form">
            <div className="block-voucher-record-list" hidden={records.length === 0}>
                {records.map((record, index) => (
                    <div key={index} className="form-group form-group-inline form-group-inline-lg">
                        <div className="form-label">{record.name}</div>
                        <div className="form-offset">
                            <div className="voucher-record-item">
                                <div className="voucher-record-item-input flex-flex-vertical">
                                    {record.key != 'birth_date' ? (
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={record.value || ''}
                                            placeholder={record.name}
                                            onChange={(e) => {
                                                records[index].value = e.target.value;
                                                setRecords([...records]);
                                            }}
                                        />
                                    ) : (
                                        <DatePickerControl
                                            value={dateParse(record.value)}
                                            placeholder={translate('dd-MM-yyyy')}
                                            onChange={(value: Date) => {
                                                const recordsData = [...records];
                                                recordsData[index].value = dateFormat(value);
                                                setRecords(recordsData);
                                            }}
                                        />
                                    )}

                                    <FormError error={errors?.[record.key]} />
                                </div>

                                <div className="voucher-record-item-actions">
                                    <div
                                        className="button button-icon button-default"
                                        onClick={() => removeRecord(record.key)}>
                                        <em className="mdi mdi-close" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {recordTypesAvailable?.length > 0 && (
                <div className="block-voucher-record-add">
                    <div className="form-group form-group-inline form-group-inline-lg">
                        <div className="form-label">Selecteer persoonsgegevens</div>
                        {!showRecordSelector ? (
                            <div className="button button-primary" onClick={() => setShowRecordSelector(true)}>
                                <em className="mdi mdi-plus icon-start" />
                                Persoonsgegevens toevoegen
                            </div>
                        ) : (
                            <SelectControl
                                className="form-control"
                                allowSearch={false}
                                options={recordTypesAvailable}
                                value={recordType}
                                onChange={setRecordType}
                            />
                        )}
                    </div>

                    {showRecordSelector && (
                        <div className="form-group form-group-inline form-group-inline-lg">
                            <div className="form-label" />
                            <div className="block-voucher-record-add-actions">
                                <button
                                    type="button"
                                    className="button button-default"
                                    onClick={() => setShowRecordSelector(false)}>
                                    Annuleren
                                </button>
                                <button
                                    type="button"
                                    disabled={!recordType.key}
                                    className="button button-primary"
                                    onClick={() => addRecord(recordType)}>
                                    Toevoegen
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
