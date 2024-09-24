import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Organization from '../../../props/models/Organization';
import RecordType from '../../../props/models/RecordType';
import { hasPermission } from '../../../helpers/utils';
import SelectControlOptions from '../select-control/templates/SelectControlOptions';
import SelectControl from '../select-control/SelectControl';
import FormError from '../forms/errors/FormError';
import { ResponseError } from '../../../props/ApiResponses';
import FundCriterion from '../../../props/models/FundCriterion';
import Fund from '../../../props/models/Fund';
import useOpenModal from '../../../hooks/useOpenModal';
import ModalFundCriteriaDescriptionEdit from '../../modals/ModalFundCriteriaDescriptionEdit';
import { useFundService } from '../../../services/FundService';
import DatePickerControl from '../forms/controls/DatePickerControl';
import CheckboxControl from '../forms/controls/CheckboxControl';
import { uniqueId } from 'lodash';
import useTranslate from '../../../hooks/useTranslate';
import { currencyFormat } from '../../../helpers/string';
import { dateFormat, dateParse } from '../../../helpers/dates';
import classNames from 'classnames';

type Operators = '<' | '<=' | '>' | '>=' | '!=' | '=' | '*';

export default function FundCriteriaEditorItem({
    fund,
    organization,
    criterion,
    isEditable,
    recordTypes,
    setCriterion,
    onDeleteCriteria,
    saveCriterionRef = null,
    isNew = false,
    isEditing = false,
    setIsEditing,
}: {
    fund: Fund;
    organization: Organization;
    criterion: FundCriterion;
    isEditable: boolean;
    recordTypes: Array<Partial<RecordType>>;
    setCriterion: (criteria: Partial<FundCriterion>) => void;
    onDeleteCriteria: (criterion: Partial<FundCriterion>) => void;
    saveCriterionRef?: React.MutableRefObject<() => Promise<boolean>>;
    isNew: boolean;
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();

    const fundService = useFundService();

    const [values, setValues] = useState<object>(null);
    const [errors, setErrors] = useState(null);
    const [blockId] = useState<string>(uniqueId('criteria_editor_item_'));
    const [operators, setOperators] = useState<{ [key: string]: Operators }>(null);
    const [validations, setValidations] = useState<object>(null);

    const [recordType, setRecordType] = useState<Partial<RecordType>>(
        recordTypes?.find((type) => type.key == criterion?.record_type?.key) || recordTypes[0],
    );

    const [title, setTitle] = useState(criterion.title);
    const [description, setDescription] = useState(criterion.title);
    const [showAttachments, setShowAttachments] = useState(criterion.show_attachment);
    const [optional, setOptional] = useState(criterion.optional);

    const disabled = useMemo<boolean>(() => {
        return !isEditable || !hasPermission(organization, 'manage_funds');
    }, [isEditable, organization]);

    const validateCriteria = useCallback(
        (data: object) => {
            return fundService.criterionValidate(organization.id, fund?.id, [{ ...data }]);
        },
        [fund?.id, organization?.id, fundService],
    );

    const saveCriterion = useCallback((): Promise<boolean> => {
        return new Promise((resolve) => {
            const _criterion: Partial<FundCriterion> = {
                id: criterion?.id,
                operator: operators?.[recordType.key],
                value: values?.[recordType.key],
                min: validations?.[recordType.key]?.min,
                max: validations?.[recordType.key]?.max,
                title,
                optional,
                description,
                show_attachment: showAttachments,
                record_type_key: recordType?.key,
            };

            validateCriteria({ ..._criterion })
                .then(() => {
                    setCriterion({ ..._criterion, record_type: { ...recordType } as RecordType });
                    resolve(true);
                    setErrors(null);
                })
                .catch((err: ResponseError) => {
                    resolve(false);
                    setErrors(err.data.errors);
                });
        });
    }, [
        values,
        recordType,
        operators,
        validations,
        criterion?.id,
        optional,
        title,
        description,
        showAttachments,
        validateCriteria,
        setCriterion,
    ]);

    const defaultTitle = useMemo(() => {
        const currencyTypes = ['net_worth', 'base_salary', 'income_level'];
        const operator = operators?.[recordType.key] || '';
        const value = values?.[recordType.key] || null;

        const operatorKeys =
            recordType.operators?.reduce((obj, operator) => {
                return { ...obj, [operator.key]: operator.name };
            }, {}) || null;

        const valueFormat = currencyTypes.includes(recordType.key) ? currencyFormat(parseFloat(value || 0)) : value;

        const title = isNew
            ? ['Nieuwe voorwaarde']
            : [
                  recordType?.name,
                  value ? operatorKeys[operator] : null,
                  value ? valueFormat : null,
                  optional ? ' (optioneel)' : null,
              ];

        return title.filter((item) => item).join(' ');
    }, [operators, recordType, values, isNew, optional]);

    const editDescription = useCallback(
        (criterion: FundCriterion) => {
            openModal((modal) => (
                <ModalFundCriteriaDescriptionEdit
                    modal={modal}
                    criterion={criterion}
                    title={title}
                    description={description}
                    description_html={criterion.description_html}
                    validateCriteria={validateCriteria}
                    onSubmit={(res) => {
                        setTitle(res.title);
                        setDescription(res.description);
                    }}
                />
            ));
        },
        [description, openModal, title, validateCriteria],
    );

    const removeCriterion = useCallback(
        (criterion: FundCriterion) => {
            onDeleteCriteria?.(criterion);
        },
        [onDeleteCriteria],
    );

    const cancelCriterion = useCallback(() => {
        if (isNew) {
            removeCriterion(criterion);
        } else {
            setIsEditing(false);
        }
    }, [criterion, isNew, removeCriterion, setIsEditing]);

    const preparedData = useMemo(() => {
        const data = recordTypes.reduce(
            (list, { key, options, operators }) => ({
                values: { ...list.values, [key]: options?.length > 0 ? options[0]?.value : null },
                operators: { ...list.operators, [key]: operators?.length > 0 ? operators[0]?.key : null },
                validations: { ...list.validations, [key]: {} },
            }),
            { values: {}, operators: {}, validations: {} },
        );

        data.values[criterion?.record_type_key] = criterion?.value;
        data.operators[criterion?.record_type_key] = criterion?.operator;

        data.validations[criterion?.record_type_key] =
            criterion?.record_type?.type !== 'date'
                ? {
                      min: criterion?.min ? parseInt(criterion?.min) : null,
                      max: criterion?.max ? parseInt(criterion?.max) : null,
                  }
                : {
                      min: criterion?.min,
                      max: criterion?.max,
                  };

        return data;
    }, [criterion, recordTypes]);

    useEffect(() => {
        setValues(preparedData.values);
        setOperators(preparedData.operators);
        setValidations(preparedData.validations);
    }, [criterion, preparedData]);

    useEffect(() => {
        setTitle(criterion?.title);
        setOptional(criterion?.optional);
        setDescription(criterion?.description);
        setShowAttachments(criterion?.show_attachment);
    }, [criterion?.title, criterion?.description, criterion?.optional, criterion?.show_attachment]);

    useEffect(() => {
        if (saveCriterionRef) {
            saveCriterionRef.current = saveCriterion;
        }
    }, [saveCriterion, saveCriterionRef]);

    return (
        <div className="criterion-item">
            <div className="criterion-head">
                <div className={classNames(`criterion-title`, !isEditing && 'criterion-title-large')}>
                    {title || defaultTitle}
                </div>

                <div className="criterion-actions">
                    {isEditing && (
                        <div
                            className="button button-primary button-icon pull-left"
                            onClick={() => editDescription(criterion)}>
                            <em className="mdi mdi-comment-text icon-start" />
                        </div>
                    )}

                    {!isEditing && (
                        <div className="button button-default" onClick={() => setIsEditing(true)}>
                            <em className="mdi mdi-pencil icon-start" />
                            {translate('components.fund_criteria_editor_item.buttons.edit')}
                        </div>
                    )}

                    {isEditing && (
                        <div className="button button-default" onClick={cancelCriterion}>
                            <em className="mdi mdi-close icon-start" />
                            {translate('components.fund_criteria_editor_item.buttons.cancel')}
                        </div>
                    )}

                    {isEditable && (
                        <button
                            className="button button-danger"
                            onClick={() => removeCriterion(criterion)}
                            disabled={disabled || isEditing}>
                            <em className="mdi mdi-delete-outline icon-start" />
                            {translate('components.fund_criteria_editor_item.buttons.cancel')}
                        </button>
                    )}
                </div>
            </div>

            {isEditing && (
                <div className="criterion-body">
                    <div className="criterion-section">
                        <div className="form-group">
                            <div className="row">
                                <div className="col col-xs-12 col-sm-4">
                                    <label className="form-label">Persoonsgegeven</label>
                                    <div className="form-offset">
                                        <SelectControl
                                            className={`form-control ${disabled ? 'disabled' : ''}`}
                                            placeholder="Persoonsgegeven"
                                            disabled={disabled}
                                            value={recordType}
                                            allowSearch={true}
                                            onChange={setRecordType}
                                            options={recordTypes}
                                            optionsComponent={SelectControlOptions}
                                        />
                                    </div>
                                    <FormError error={errors?.['criteria.0.record_type_key']} />
                                </div>

                                {recordType?.operators?.length > 0 && operators && (
                                    <div className="col col-xs-12 col-sm-4">
                                        <label className="form-label">Verhouding</label>
                                        <div className="form-offset">
                                            <SelectControl
                                                className={`form-control ${disabled ? 'disabled' : ''}`}
                                                placeholder="Verhouding"
                                                disabled={disabled}
                                                allowSearch={false}
                                                propKey={'key'}
                                                value={operators[recordType.key]}
                                                options={recordType?.operators}
                                                optionsComponent={SelectControlOptions}
                                                onChange={(operator: Operators) => {
                                                    setOperators({ ...operators, [recordType.key]: operator });
                                                }}
                                            />
                                        </div>
                                        <FormError error={errors?.['criteria.0.operator']} />
                                    </div>
                                )}

                                {recordType?.operators?.length > 0 &&
                                    operators &&
                                    operators[recordType.key] !== '*' && (
                                        <div className="col col-xs-12 col-sm-4">
                                            <label className="form-label">Waarde</label>
                                            {!['select', 'select_number', 'bool', 'date'].includes(recordType.type) &&
                                                operators[recordType.key] != '*' && (
                                                    <input
                                                        className={`form-control ${disabled ? 'disabled' : ''}`}
                                                        type="text"
                                                        placeholder="Waarde"
                                                        defaultValue={values[recordType.key]}
                                                        disabled={disabled}
                                                        onChange={(e) => {
                                                            values[recordType.key] = e.target.value;
                                                            setValues({ ...values });
                                                        }}
                                                    />
                                                )}

                                            {['select', 'select_number', 'bool'].includes(recordType.type) &&
                                                operators[recordType.key] != '*' && (
                                                    <div className="form-offset">
                                                        <SelectControl
                                                            className={`form-control ${disabled ? 'disabled' : ''}`}
                                                            placeholder="Verhouding"
                                                            allowSearch={false}
                                                            propKey={'value'}
                                                            value={values[recordType.key]}
                                                            options={recordType.options}
                                                            optionsComponent={SelectControlOptions}
                                                            disabled={disabled}
                                                            onChange={(value: string) => {
                                                                values[recordType.key] = value;
                                                                setValues({ ...values });
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                            {['date'].includes(recordType.type) && operators[recordType.key] != '*' && (
                                                <DatePickerControl
                                                    value={dateParse(values[recordType.key], 'dd-MM-yyyy')}
                                                    dateFormat={'dd-MM-yyyy'}
                                                    placeholder={'Kies een datum'}
                                                    onChange={(value: Date) => {
                                                        values[recordType.key] = dateFormat(value, 'dd-MM-yyyy');
                                                        setValues({ ...values });
                                                    }}
                                                />
                                            )}

                                            {operators[recordType.key] == '*' && (
                                                <input
                                                    className="form-control disabled"
                                                    type="text"
                                                    placeholder="Waarde"
                                                    disabled={true}
                                                />
                                            )}
                                            <FormError error={errors?.['criteria.0.value']} />
                                        </div>
                                    )}
                            </div>
                        </div>

                        {recordType?.key && (
                            <div className="row">
                                <div className="col flex-xs-12 form-group">
                                    <CheckboxControl
                                        className={`${disabled ? 'disabled' : ''}`}
                                        id={`${blockId}_attachments`}
                                        title={translate('components.fund_criteria_editor_item.allow_attachments')}
                                        checked={showAttachments}
                                        disabled={disabled}
                                        onChange={() => setShowAttachments(!showAttachments)}
                                    />
                                </div>

                                <div className="col flex-xs-12 form-group">
                                    <CheckboxControl
                                        className={`checkbox-narrow ${disabled ? 'disabled' : ''}`}
                                        id={`${blockId}_optional`}
                                        checked={optional}
                                        disabled={disabled}
                                        title={translate('components.fund_criteria_editor_item.optional')}
                                        onChange={() => setOptional(!optional)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {recordType?.validations?.length > 0 && (
                        <div className={'criterion-section'}>
                            <div className="row">
                                <div className="col col-xs-12">
                                    <div className="criterion-subtitle">Validations</div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col col-xs-12 col col-sm-6">
                                    {recordType.validations.includes('min') && validations && (
                                        <div className="form-group">
                                            <label className="form-label">Min</label>
                                            {(recordType.type == 'number' || recordType.type == 'string') && (
                                                <input
                                                    className={`form-control ${disabled ? 'disabled' : ''}`}
                                                    type="number"
                                                    placeholder="Min"
                                                    value={validations[recordType.key]?.min || ''}
                                                    disabled={disabled}
                                                    onChange={(e) => {
                                                        validations[recordType.key].min = parseInt(e.target.value);
                                                        setValidations({ ...validations });
                                                    }}
                                                />
                                            )}
                                            {recordType.type == 'date' && (
                                                <DatePickerControl
                                                    value={dateParse(validations[recordType.key].min, 'dd-MM-yyyy')}
                                                    dateFormat={'dd-MM-yyyy'}
                                                    disabled={disabled}
                                                    onChange={(date) => {
                                                        validations[recordType.key].min = dateFormat(
                                                            date,
                                                            'dd-MM-yyyy',
                                                        );
                                                        setValidations({ ...validations });
                                                    }}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="col col-xs-12 col col-sm-6">
                                    {recordType.validations.includes('max') && validations && (
                                        <div className="form-group">
                                            <label className="form-label">Max</label>

                                            {(recordType.type == 'number' || recordType.type == 'string') && (
                                                <input
                                                    className={`form-control ${disabled ? 'disabled' : ''}`}
                                                    type="number"
                                                    placeholder="Max"
                                                    defaultValue={validations[recordType.key]?.max || ''}
                                                    disabled={disabled}
                                                    onChange={(e) => {
                                                        validations[recordType.key].max = parseInt(e.target.value);
                                                        setValidations({ ...validations });
                                                    }}
                                                />
                                            )}

                                            {recordType.type == 'date' && (
                                                <DatePickerControl
                                                    value={dateParse(validations[recordType.key].max, 'dd-MM-yyyy')}
                                                    dateFormat={'dd-MM-yyyy'}
                                                    onChange={(date) => {
                                                        validations[recordType.key].max = dateFormat(
                                                            date,
                                                            'dd-MM-yyyy',
                                                        );
                                                        setValidations({ ...validations });
                                                    }}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="row">
                                {recordType.validations.includes('email') && (
                                    <div className="col col-xs-12 form-group">
                                        <CheckboxControl
                                            checked={true}
                                            title={`Should be in valid email format. ex: email@example.com`}
                                            disabled={true}
                                            onChange={() => null}
                                        />
                                    </div>
                                )}

                                {recordType.validations.includes('date') && (
                                    <div className="col col-xs-12 form-group">
                                        <CheckboxControl
                                            checked={true}
                                            title={`Should be in valid date format. ex: dd-MM-jjjj`}
                                            disabled={true}
                                            onChange={() => null}
                                        />
                                    </div>
                                )}

                                {recordType.validations.includes('iban') && (
                                    <div className="col col-xs-12 form-group">
                                        <CheckboxControl
                                            checked={true}
                                            title={`Should be in valid IBAN format`}
                                            disabled={true}
                                            onChange={() => null}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
