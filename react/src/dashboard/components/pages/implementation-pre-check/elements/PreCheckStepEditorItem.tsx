import React, { Fragment, useCallback, useMemo } from 'react';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import PreCheck from '../../../../props/models/PreCheck';
import { CSS } from '@dnd-kit/utilities';
import FormError from '../../../elements/forms/errors/FormError';
import { ResponseErrorData } from '../../../../props/ApiResponses';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import PreCheckStepEditorItemRecord from './PreCheckStepEditorItemRecord';
import { uniq } from 'lodash';

export default function PreCheckStepEditorItem({
    preCheck,
    preChecks,
    setPreChecks,
    preCheckIndex,
    errors,
    removePreCheck,
    unCollapsed,
    setUnCollapsed,
    disabled,
    isSortingContainer,
}: {
    preCheck: PreCheck;
    preChecks: Array<PreCheck>;
    setPreChecks: React.Dispatch<React.SetStateAction<Array<PreCheck>>>;
    preCheckIndex: number;
    errors: ResponseErrorData;
    removePreCheck: (index: number) => void;
    unCollapsed: Array<string>;
    setUnCollapsed: React.Dispatch<React.SetStateAction<Array<string>>>;
    disabled?: boolean;
    isSortingContainer?: boolean;
}) {
    const assetUrl = useAssetUrl();

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: preCheck.uid });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const errorPrefix = useMemo(() => {
        return `pre_checks.${preCheckIndex}`;
    }, [preCheckIndex]);

    const updatePreChecks = useCallback(
        (preCheckIndex: number, values: object) => {
            setPreChecks((preChecks) => {
                preChecks[preCheckIndex] = { ...preChecks[preCheckIndex], ...values };
                return [...preChecks];
            });
        },
        [setPreChecks],
    );

    const collapse = useCallback(
        (uid: string) => {
            setUnCollapsed((unCollapsed) => {
                unCollapsed.splice(unCollapsed.indexOf(uid), 1);
                return [...unCollapsed];
            });
        },
        [setUnCollapsed],
    );

    const unCollapse = useCallback(
        (uid: string) => {
            setUnCollapsed((unCollapsed) => uniq([...unCollapsed, uid]));
        },
        [setUnCollapsed],
    );

    return (
        <div className="pre-check-item" ref={disabled ? undefined : setNodeRef} style={style}>
            <div className="pre-check-item-header">
                <div className="pre-check-item-header-drag">
                    <em className="mdi mdi-drag-vertical" {...attributes} {...listeners} />
                </div>

                <div className="pre-check-item-header-title">
                    {preCheck.title && (
                        <Fragment>
                            <span>{preCheck.title}</span>
                            <span className="text-muted">{` (${preCheck.record_types.length} voorwaarde(n))`}</span>
                        </Fragment>
                    )}
                    {!preCheck.title && <span>{!preCheck.id ? 'Nieuwe stap' : 'Edit step'}</span>}

                    {preCheck.default == true && (
                        <span className="text-muted">
                            &nbsp;
                            <em className="mdi mdi-lock-outline" />
                        </span>
                    )}
                </div>

                <div className="pre-check-item-header-actions">
                    {unCollapsed.includes(preCheck.uid) ? (
                        <div className="button button-default button-sm" onClick={() => collapse(preCheck.uid)}>
                            <em className="mdi mdi-arrow-collapse-vertical icon-start" />
                            Inklappen
                        </div>
                    ) : (
                        <div className="button button-primary button-sm" onClick={() => unCollapse(preCheck.uid)}>
                            <em className="mdi mdi-arrow-expand-vertical icon-start" />
                            Uitklappen
                        </div>
                    )}

                    {!preCheck.default && (
                        <div className="button button-danger button-sm" onClick={() => removePreCheck(preCheckIndex)}>
                            <em className="mdi mdi-trash-can-outline icon-start" />
                            Stap verwijderen
                        </div>
                    )}
                </div>
            </div>

            {unCollapsed.includes(preCheck.uid) && (
                <div className="pre-check-item-body">
                    <div className="form">
                        <div className="pre-check-item-body-content">
                            <div className="row">
                                <div className="form-group col col-lg-6 col-xs-12">
                                    <label className="form-label form-label-required">Korte titel</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={preCheck.title_short}
                                        onChange={(e) => {
                                            updatePreChecks(preCheckIndex, { title_short: e.target.value });
                                        }}
                                        placeholder="Korte titel..."
                                    />
                                    <div className="form-hint">Max. 30 tekens</div>
                                    {errors && <FormError error={errors[`${errorPrefix}.title_short`]} />}
                                </div>

                                <div className="form-group col col-lg-6 col-xs-12">
                                    <label className="form-label form-label-required">Titel</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={preCheck.title}
                                        onChange={(e) => {
                                            updatePreChecks(preCheckIndex, { title: e.target.value });
                                        }}
                                        placeholder="Titel..."
                                    />
                                    <div className="form-hint">Max. 100 tekens</div>
                                    {errors && <FormError error={errors[`${errorPrefix}.title`]} />}
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-label">Omschrijving</div>
                                <textarea
                                    className="form-control"
                                    value={preCheck.description}
                                    placeholder="Omschrijving..."
                                    onChange={(e) => {
                                        updatePreChecks(preCheckIndex, { description: e.target.value });
                                    }}
                                />
                                <div className="form-hint">Max. 1000 tekens</div>
                                {errors && <FormError error={errors[`${errorPrefix}.description`]} />}
                            </div>
                        </div>

                        <div className="pre-check-item-body-records">
                            <div className="block-records-title">Voorwaarden ({preCheck.record_types.length})</div>

                            <div className="pre-check-item-body-records-items">
                                <SortableContext
                                    id={`preCheckRecords_${preCheck.uid}`}
                                    items={preCheck.record_types?.map((type) => type.record_type_key)}
                                    strategy={verticalListSortingStrategy}>
                                    {preCheck.record_types.map((record, recordIndex) => (
                                        <PreCheckStepEditorItemRecord
                                            key={record.record_type_key}
                                            record={record}
                                            disabled={isSortingContainer}
                                            recordIndex={recordIndex}
                                            preCheckIndex={preCheckIndex}
                                            preChecks={preChecks}
                                            setPreChecks={setPreChecks}
                                            unCollapsed={unCollapsed}
                                            collapse={collapse}
                                            unCollapse={unCollapse}
                                            errors={errors}
                                        />
                                    ))}
                                </SortableContext>
                                {!preCheck.record_types.length && (
                                    <div className="pre-check-item-body-records-empty">
                                        <div className="pre-check-item-body-records-empty-img">
                                            <img src={assetUrl('/assets/img/icon-drag.svg')} alt={''} />
                                        </div>
                                        <div className="pre-check-item-body-records-empty-title">
                                            Voorwaarden uit andere stappen kunnen hierheen worden versleept.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
