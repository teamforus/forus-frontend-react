import React, { useCallback, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import PreCheck from '../../../../props/models/PreCheck';
import { CSS } from '@dnd-kit/utilities';
import FormError from '../../../elements/forms/errors/FormError';
import PreCheckStepEditorItemRecordSettings from './PreCheckStepEditorItemRecordSettings';
import { ResponseErrorData } from '../../../../props/ApiResponses';
import PreCheckRecord from '../../../../props/models/PreCheckRecord';

export default function PreCheckStepEditorItemRecord({
    record,
    disabled,
    recordIndex,
    preChecks,
    setPreChecks,
    preCheckIndex,
    errors,
    unCollapsed,
    collapse,
    unCollapse,
}: {
    record: PreCheckRecord;
    disabled: boolean;
    recordIndex: number;
    preChecks: Array<PreCheck>;
    setPreChecks: React.Dispatch<React.SetStateAction<Array<PreCheck>>>;
    preCheckIndex: number;
    errors: ResponseErrorData;
    unCollapsed: Array<string>;
    collapse: (uid: string) => void;
    unCollapse: (uid: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: record.record_type_key,
    });

    const errorPrefix = useMemo(
        () => `pre_checks.${preCheckIndex}.record_types.${recordIndex}`,
        [preCheckIndex, recordIndex],
    );

    const updatePreCheckRecords = useCallback(
        (values: object = {}) => {
            setPreChecks((preChecks) => {
                const records = preChecks[preCheckIndex].record_types;

                records[recordIndex] = { ...records[recordIndex], ...values };
                preChecks[preCheckIndex] = { ...preChecks[preCheckIndex], record_types: records };

                return [...preChecks];
            });
        },
        [preCheckIndex, recordIndex, setPreChecks],
    );

    return (
        <div
            className="pre-check-item pre-check-item-record"
            ref={disabled ? undefined : setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                zIndex: isDragging ? 10 : 0,
            }}>
            <div className="pre-check-item-header">
                <div className="pre-check-item-header-drag">
                    <em className="mdi mdi-drag-vertical" {...attributes} {...listeners} />
                </div>

                <div className="pre-check-item-header-title">
                    <span>{record.title ? record.title + ':' : 'Geen titel:'}</span>
                    &nbsp;
                    <span className="text-muted">
                        {`Deze voorwaarde is van toepassing op (${record?.funds.length} regeling(en))`}
                    </span>
                </div>

                <div className="pre-check-item-header-actions">
                    {unCollapsed.includes(record.record_type_key) ? (
                        <div
                            className="button button-default button-sm"
                            onClick={() => collapse(record.record_type_key)}>
                            <em className="mdi mdi-arrow-collapse-vertical icon-start"></em>
                            Inklappen
                        </div>
                    ) : (
                        <div
                            className="button button-primary button-sm"
                            onClick={() => unCollapse(record.record_type_key)}>
                            <em className="mdi mdi-arrow-expand-vertical icon-start" />
                            Uitklappen
                        </div>
                    )}
                </div>
            </div>

            {unCollapsed.includes(record.record_type_key) && (
                <div className="pre-check-item-body">
                    <div className="pre-check-item-body-content">
                        <div className="row">
                            <div className="form-group col col-lg-6 col-xs-12">
                                <label className="form-label form-label-required">Korte titel</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    defaultValue={record.title_short}
                                    placeholder="Title..."
                                    onChange={(e) => updatePreCheckRecords({ title_short: e.target.value })}
                                />
                                <div className="form-hint">Max. 40 tekens</div>
                                {errors && <FormError error={errors[`${errorPrefix}.title_short`]} />}
                            </div>

                            <div className="form-group col col-lg-6 col-xs-12">
                                <label className="form-label form-label-required">Titel</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    defaultValue={record.title}
                                    placeholder="Title..."
                                    onChange={(e) => updatePreCheckRecords({ title: e.target.value })}
                                />
                                <div className="form-hint">Max. 100 tekens</div>
                                {errors && <FormError error={errors[`${errorPrefix}.title`]} />}
                            </div>
                        </div>

                        <div className="row">
                            <div className="col col-lg-12">
                                <div className="form-group">
                                    <label className="form-label form-label-required">Omschrijving</label>
                                    <textarea
                                        className="form-control"
                                        value={record.description || ''}
                                        placeholder="Omschrijving..."
                                        onChange={(e) => {
                                            updatePreCheckRecords({ description: e.target.value });
                                        }}
                                    />
                                    <div className="form-hint">Max. 1000 tekens</div>
                                    {errors && <FormError error={errors[`${errorPrefix}.description`]} />}
                                </div>

                                <PreCheckStepEditorItemRecordSettings
                                    preChecks={preChecks}
                                    preCheckIndex={preCheckIndex}
                                    recordIndex={recordIndex}
                                    collapse={collapse}
                                    unCollapse={unCollapse}
                                    unCollapsed={unCollapsed}
                                    onUpdate={updatePreCheckRecords}
                                    errors={errors}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
