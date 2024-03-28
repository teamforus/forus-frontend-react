import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import Prevalidation from '../../props/models/Prevalidation';
import RecordType from '../../props/models/RecordType';
import useFormBuilder from '../../hooks/useFormBuilder';
import { usePrevalidationService } from '../../services/PrevalidationService';
import Fund from '../../props/models/Fund';
import DatePickerControl from '../elements/forms/controls/DatePickerControl';
import SelectControl from '../elements/select-control/SelectControl';
import SelectControlOptions from '../elements/select-control/templates/SelectControlOptions';
import FormError from '../elements/forms/errors/FormError';
import PrevalidationRecord from '../../props/models/PrevalidationRecord';
import { ResponseError } from '../../props/ApiResponses';

export default function ModalCreatePrevalidation({
    modal,
    className,
    fund,
    recordTypes,
}: {
    modal: ModalState;
    className?: string;
    fund: Fund;
    recordTypes: Array<RecordType>;
}) {
    const prevalidationService = usePrevalidationService();

    const [defaultFormValues, setDefaultFormValues] = useState<object>({});
    const [criteriaRuleByKey, setCriteriaRuleByKey] = useState<object>({});
    const [recordTypesByKey, setRecordTypesByKey] = useState(null);
    const [showNewRecord, setShowNewRecord] = useState<boolean>(false);
    const [prevalidation, setPrevalidation] = useState<Prevalidation>(null);
    const [verificationRequested, setVerificationRequested] = useState<boolean>(false);
    const [prevalidationPrimaryKey, setPrevalidationPrimaryKey] = useState<PrevalidationRecord>(null);
    const [prevalidationRecords, setPrevalidationRecords] = useState([...fund.csv_required_keys]);
    const [recordTypesAvailable, setRecordTypesAvailable] = useState<Array<RecordType>>([]);

    const eligibleKey = useState(
        fund.csv_required_keys.find((key) => {
            return key.endsWith('_eligible');
        }),
    );
    const eligibleKeyValue = useState<string>(
        fund.criteria.find((criterion) => {
            return criterion.record_type.key == eligibleKey[0] && criterion.operator == '=';
        })?.value,
    );

    const form = useFormBuilder(defaultFormValues, (values) => {
        if (!verificationRequested) {
            setVerificationRequested(true);
            form.setIsLocked(true);
            return;
        }

        const data = { ...values };

        if (eligibleKey && eligibleKeyValue) {
            data[eligibleKey[0]] = eligibleKeyValue[0];
        }

        prevalidationService
            .submit(data, fund.id)
            .then((res) => {
                setVerificationRequested(false);
                setPrevalidation(res.data.data);
                setPrevalidationPrimaryKey(
                    prevalidation.records.filter((record) => {
                        return record.key == fund.csv_primary_key;
                    })[0] || null,
                );
            })
            .catch((res: ResponseError) => {
                form.setErrors(res.data.errors);
                form.setIsLocked(false);
                setVerificationRequested(false);
            });
    });

    const formNewRecord = useFormBuilder(
        { record_type_key: recordTypesAvailable.length ? recordTypesAvailable[0].key : null },
        (values) => {
            setPrevalidationRecords([...prevalidationRecords, ...values.record_type_key]);
            setShowNewRecord(false);
            updateRecordTypesAvailable();
        },
    );

    const updateRecordTypesAvailable = useCallback(() => {
        setRecordTypesAvailable(
            recordTypes.filter((recordType) => {
                return recordType.key != 'primary_email' && !prevalidationRecords?.includes(recordType?.key);
            }),
        );

        if (eligibleKey[0] && eligibleKeyValue[0]) {
            setRecordTypesAvailable(recordTypesAvailable.filter((record) => record.key !== eligibleKey[0]));
            setPrevalidationRecords(prevalidationRecords.filter((record) => record !== eligibleKey[0]));
        }
    }, [eligibleKey, eligibleKeyValue, prevalidationRecords, recordTypes, recordTypesAvailable]);

    const removeExtraRecord = useCallback(
        (recordKey) => {
            if (prevalidationRecords?.includes(recordKey)) {
                prevalidationRecords.splice(prevalidationRecords.indexOf(recordKey), 1);
                delete form.values[recordKey];
            }

            updateRecordTypesAvailable();
        },
        [form.values, prevalidationRecords, updateRecordTypesAvailable],
    );

    useEffect(() => {
        setRecordTypesByKey(
            recordTypes
                .filter((type) => type.key != 'primary_email')
                .reduce((obj, type) => ({ ...obj, [type.key]: type }), {}),
        );
    }, [recordTypes]);

    useEffect(() => {
        const defaultFormValues = {};

        fund.criteria.forEach((criteria) => {
            const operatorLocale = {
                '<': 'minder dan',
                '<=': 'minder dan of gelijk aan',
                '>': 'meer dan',
                '>=': 'meer dan of gelijk aan',
                '=': 'is',
                '*': 'elke',
            }[criteria.operator];

            criteriaRuleByKey[criteria.record_type.key] = `${operatorLocale} ${criteria.value}`;

            if (criteria.operator == '=') {
                defaultFormValues[criteria.record_type.key] = criteria.value;
            }
        });

        setCriteriaRuleByKey(criteriaRuleByKey);
        setDefaultFormValues(defaultFormValues);
    }, [criteriaRuleByKey, fund.criteria]);

    return (
        <div
            className={classList([
                'modal',
                'modal-animated',
                'modal-md',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />

            <div className="modal-window">
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />

                {!verificationRequested && <div className="modal-header">Activatiecode aanmaken</div>}
                {verificationRequested && <div className="modal-header">Gegevens controleren</div>}

                <div className="modal-body">
                    <div className="modal-section">
                        {verificationRequested && !prevalidation && (
                            <>
                                <div className="modal-text text-center">
                                    Controleer of u de juiste gegevens hebt ingevuld voordat u deze bevestigd.
                                </div>

                                <div className="row">
                                    <div className="col col-lg-8 col-lg-offset-2">
                                        <div className="block block-compact-datalist">
                                            {prevalidationRecords?.map((fundRecord, index) => (
                                                <div className="datalist-row" key={index}>
                                                    <strong className="datalist-key">
                                                        {recordTypesByKey && recordTypesByKey[fundRecord] && (
                                                            <span>{recordTypesByKey[fundRecord]?.name}</span>
                                                        )}
                                                    </strong>
                                                    <div className="datalist-value text-primary text-right">
                                                        {form.values[fundRecord]}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {!prevalidation && !verificationRequested && (
                            <div className="modal-section form">
                                <div className="row">
                                    <div className="col col-lg-8 col-lg-offset-2 col-lg-12">
                                        {prevalidationRecords?.map((fundRecord, index) => (
                                            <>
                                                <label className="form-label" key={index}>
                                                    {recordTypesByKey && recordTypesByKey[fundRecord] && (
                                                        <span>{recordTypesByKey[fundRecord]?.name}</span>
                                                    )}

                                                    {criteriaRuleByKey[fundRecord] && (
                                                        <span className="text-muted-dark">
                                                            &nbsp;({criteriaRuleByKey[fundRecord]})
                                                        </span>
                                                    )}
                                                </label>

                                                <div className="flex-row">
                                                    <div className="flex-col flex-col-padless-right flex-grow">
                                                        {recordTypesByKey &&
                                                            recordTypesByKey[fundRecord] &&
                                                            ['select', 'bool'].includes(
                                                                recordTypesByKey[fundRecord].type,
                                                            ) && (
                                                                <SelectControl
                                                                    propKey={'value'}
                                                                    placeholder="Waarde"
                                                                    value={form.values[fundRecord]}
                                                                    options={recordTypesByKey[fundRecord].options}
                                                                    optionsComponent={SelectControlOptions}
                                                                    onChange={(value: object) => form.update(value)}
                                                                />
                                                            )}

                                                        {recordTypesByKey &&
                                                            recordTypesByKey[fundRecord] &&
                                                            recordTypesByKey[fundRecord].type == 'date' && (
                                                                <DatePickerControl
                                                                    value={form.values[fundRecord]}
                                                                    dateFormat="dd-MM-jjjj"
                                                                    onChange={(date) => form.update(date)}
                                                                />
                                                            )}

                                                        {recordTypesByKey &&
                                                            recordTypesByKey[fundRecord] &&
                                                            recordTypesByKey[fundRecord].type == 'number' && (
                                                                <input
                                                                    type="number"
                                                                    value={form.values[fundRecord]}
                                                                    className="form-control"
                                                                />
                                                            )}

                                                        {recordTypesByKey &&
                                                            recordTypesByKey[fundRecord] &&
                                                            !['number', 'select', 'bool', 'date'].includes(
                                                                recordTypesByKey[fundRecord].type,
                                                            ) && (
                                                                <input
                                                                    type="string"
                                                                    value={form.values[fundRecord]}
                                                                    className="form-control"
                                                                />
                                                            )}
                                                    </div>

                                                    {fund.csv_required_keys.indexOf(fundRecord) == -1 && (
                                                        <div className="flex-col">
                                                            <button
                                                                className="button button-text button-text-muted"
                                                                onClick={() => removeExtraRecord(fundRecord)}>
                                                                <div className="mdi mdi-close" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <FormError error={form.errors['data.' + fundRecord]} />
                                            </>
                                        ))}

                                        {showNewRecord && (
                                            <Fragment>
                                                <label className="form-label">Selecteer eigenschap</label>
                                                <div className="flex-row">
                                                    <div className="flex-col flex-grow">
                                                        <div className="form-offset">
                                                            <SelectControl
                                                                propKey={'key'}
                                                                value={formNewRecord.values.record_type_key}
                                                                options={recordTypesAvailable}
                                                                optionsComponent={SelectControlOptions}
                                                                onChange={(value: object) => form.update(value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex-col">
                                                        <button
                                                            type="button"
                                                            className="button button-primary"
                                                            onClick={() => formNewRecord.submit()}>
                                                            Toevoegen
                                                        </button>
                                                    </div>
                                                </div>
                                            </Fragment>
                                        )}

                                        {!showNewRecord && recordTypesAvailable.length > 0 && (
                                            <div className="form-actions text-center">
                                                <button
                                                    className="button button-primary"
                                                    type="button"
                                                    onClick={() => setShowNewRecord(true)}>
                                                    <em className="mdi mdi-plus icon-start" />
                                                    Eigenschap toevoegen
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {prevalidation && (
                            <div className="modal-section">
                                {prevalidationPrimaryKey && (
                                    <>
                                        <div className="modal-heading text-center">
                                            {prevalidationPrimaryKey.name}:
                                            <div className="text-primary">{prevalidationPrimaryKey.value}</div>
                                        </div>

                                        <div className="modal-heading text-center">
                                            Activatiecode:
                                            <div className="text-primary">{prevalidation.uid}</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {!verificationRequested && (
                    <div className="modal-footer text-center">
                        <button className="button button-default" type="button" onClick={modal.close} id="close">
                            Sluiten
                        </button>

                        {!prevalidation && (
                            <button className="button button-primary" type="submit">
                                Bevestigen
                            </button>
                        )}
                    </div>
                )}

                {verificationRequested && (
                    <div className="modal-footer text-center">
                        <button
                            className="button button-default"
                            type="button"
                            onClick={() => setVerificationRequested(false)}>
                            Sluiten
                        </button>

                        {!prevalidation && (
                            <button className="button button-primary" type="submit">
                                Bevestigen
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
