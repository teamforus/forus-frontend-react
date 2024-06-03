import React, { Fragment, useCallback, useEffect, useState } from 'react';
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
import { currencyFormat } from '../../../helpers/string';
import ModalDangerZone from '../../modals/ModalDangerZone';
import DatePickerControl from '../forms/controls/DatePickerControl';
import CheckboxControl from '../forms/controls/CheckboxControl';
import { uniqueId } from 'lodash';
import useTranslate from '../../../hooks/useTranslate';
import { FundCriterionLocal, FundCriterionOrganization } from './FundCriteriaEditor';

export default function FundCriteriaEditorItem({
    fund,
    organization,
    criterion,
    isEditable,
    recordTypes,
    setCriterion,
    onDeleteCriteria,
    onEditCriteria,
    onEditCancelCriteria,
    validatorOrganizations,
    saveCriterionRef = null,
}: {
    fund: Fund;
    organization: Organization;
    criterion: FundCriterionLocal;
    isEditable: boolean;
    recordTypes: Array<Partial<RecordType>>;
    setCriterion: (criteria: Partial<FundCriterionLocal>) => void;
    onDeleteCriteria: (criterion: Partial<FundCriterion>) => void;
    onEditCriteria: () => void;
    onEditCancelCriteria: () => void;
    validatorOrganizations: Array<FundCriterionOrganization>;
    saveCriterionRef?: React.MutableRefObject<() => Promise<boolean>>;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();

    const fundService = useFundService();

    const [blockId] = useState<string>(uniqueId());
    const [shouldBeValid] = useState<boolean>(true);
    const [errors, setErrors] = useState(null);
    const [values, setValues] = useState<object>(null);
    const [operators, setOperators] = useState<object>(null);
    const [validations, setValidations] = useState<object>(null);
    const [recordType, setRecordType] = useState<Partial<RecordType>>(
        recordTypes?.find((type) => type.key == criterion?.record_type?.key) || recordTypes[0],
    );

    const [criterionPrepared, setCriterionPrepared] = useState<Partial<FundCriterionLocal>>(null);
    const [disabledControls] = useState<boolean>(!isEditable || !hasPermission(organization, 'manage_funds'));

    const validateCriteria = useCallback(
        (criterion: FundCriterionLocal) => {
            return fundService.criterionValidate(organization.id, fund?.id, [
                Object.assign(JSON.parse(JSON.stringify(criterion)), {
                    validators: criterion.external_validators.map((validator) => {
                        return validator.organization_validator_id;
                    }),
                }),
            ]);
        },
        [fund?.id, organization?.id, fundService],
    );

    const saveCriterion = useCallback((): Promise<boolean> => {
        return new Promise((resolve) => {
            const _criterion = JSON.parse(JSON.stringify(criterionPrepared));

            _criterion.is_editing = false;

            delete _criterion.header;
            delete _criterion.new_validator;
            delete _criterion.validators_list;
            delete _criterion.validators_models;
            delete _criterion.validators_available;
            delete _criterion.use_external_validators;
            delete _criterion.show_external_validators_form;

            const validatorsField = _criterion.external_validators.map(
                (validator: { accepted: boolean; organization_id: number; organization_validator_id: number }) =>
                    validator.organization_validator_id,
            );

            validateCriteria(_criterion)
                .then(() => {
                    _criterion.is_new = false;
                    _criterion.validators = validatorsField;
                    _criterion.record_type = { ...recordType };
                    setCriterion(_criterion);
                    resolve(true);
                })
                .catch((err: ResponseError) => {
                    resolve(false);
                    setErrors(err.data.errors);
                });
        });
    }, [criterionPrepared, recordType, setCriterion, validateCriteria]);

    const editDescription = useCallback(
        (criterion: FundCriterion) => {
            openModal((modal) => (
                <ModalFundCriteriaDescriptionEdit
                    modal={modal}
                    criterion={criterion}
                    title={criterion.title}
                    description={criterion.description}
                    description_html={criterion.description_html}
                    validateCriteria={validateCriteria}
                    onSubmit={(res) => setCriterion({ ...criterion, ...res })}
                />
            ));
        },
        [openModal, setCriterion, validateCriteria],
    );

    const makeTitle = useCallback(
        (criterion: FundCriterionLocal) => {
            const type = recordTypes.find((item) => item.key === criterion?.record_type?.key);
            const currency_types = ['net_worth', 'base_salary', 'income_level'];

            const valueName =
                type?.type == 'select' || type?.type == 'bool'
                    ? type?.options?.find((option) => option.value == criterion?.value)?.name
                    : criterion?.value;

            const operatorKeys =
                recordType?.operators?.reduce((obj: object, operator: { key: string; name: string }) => {
                    return { ...obj, [operator.key]: operator.name };
                }, {}) || null;

            const isCurrency = currency_types.includes(criterion?.record_type_key);

            return criterion?.is_new
                ? 'Nieuwe voorwaarde'
                : [
                      recordType?.name,
                      criterion?.value ? (operatorKeys && operatorKeys[criterion?.operator]) || '' : null,
                      criterion?.value
                          ? isCurrency
                              ? currencyFormat(parseFloat(criterion.value || '0'))
                              : valueName
                          : null,
                      criterion?.optional ? ' (optioneel)' : null,
                  ]
                      .filter((item) => item)
                      .join(' ');
        },
        [recordType?.name, recordType?.operators, recordTypes],
    );

    const criterionEdit = useCallback(
        (criterion: Partial<FundCriterionLocal>) => {
            setCriterion({ ...criterion, is_editing: true });
            onEditCriteria();
        },
        [onEditCriteria, setCriterion],
    );

    const removeCriterion = useCallback(() => {
        onDeleteCriteria(criterion);
    }, [criterion, onDeleteCriteria]);

    const cancelCriterion = useCallback(
        (criterion: Partial<FundCriterionLocal>) => {
            if (criterion.is_new) {
                removeCriterion();
            } else {
                setCriterion({ ...criterion, is_editing: false });
            }
            onEditCancelCriteria();
        },
        [onEditCancelCriteria, removeCriterion, setCriterion],
    );

    const prepareCriteria = useCallback(
        (criterion: FundCriterionLocal) => {
            if (!criterion) {
                return;
            }

            criterion.header = makeTitle(criterion);

            criterion.validators_models = criterion.external_validators.map((validator) => {
                return Object.assign(
                    { accepted: validator.accepted },
                    validatorOrganizations.filter(
                        (validatorModel) => validatorModel.id == validator.organization_validator_id,
                    )[0],
                );
            });

            const validatorsModels = criterion.validators_models;
            const validatorsHalf = Math.ceil(validatorsModels.length / 2);

            criterion.use_external_validators = validatorsModels.length > 0;
            criterion.validators_list = [
                validatorsModels.slice(0, validatorsHalf),
                validatorsModels.slice(validatorsHalf, validatorsModels.length),
            ];

            criterion.new_validator = 0;
            criterion.validators_available = [
                { id: 0, validator_organization: { name: 'Selecteer' } } as FundCriterionOrganization,
            ].concat(
                validatorOrganizations.filter((validatorOrganization) => {
                    return !criterion.external_validators
                        .map((external) => external.organization_validator_id)
                        .includes(validatorOrganization.id);
                }),
            );

            setCriterionPrepared(criterion);
        },
        [makeTitle, validatorOrganizations],
    );

    const addExternalValidator = useCallback(
        (criterion: Partial<FundCriterionLocal>) => {
            setCriterion({ ...criterion, show_external_validators_form: true });
        },
        [setCriterion],
    );

    const removeExternalValidator = useCallback(
        (criterion: FundCriterionLocal, validator_id: number) => {
            const validator = criterion.external_validators.filter(
                (validator) => validator.organization_validator_id == validator_id,
            )[0];

            const validatorIndex = criterion.external_validators.indexOf(validator);
            const deleteValidator = () => {
                criterion.external_validators.splice(validatorIndex, 1);
                criterion.use_external_validators = true;
                prepareCriteria(criterion);
            };

            if (validatorIndex != -1) {
                if (validator.accepted) {
                    openModal((modal) => (
                        <ModalDangerZone
                            modal={modal}
                            title={translate('modals.danger_zone.remove_external_validators.title')}
                            description={translate('modals.danger_zone.remove_external_validators.description')}
                            buttonCancel={{
                                onClick: modal.close,
                                text: translate('modals.danger_zone.remove_external_validators.buttons.cancel'),
                            }}
                            buttonSubmit={{
                                onClick: () => {
                                    modal.close();
                                    deleteValidator();
                                },
                                text: translate('modals.danger_zone.remove_external_validators.buttons.confirm'),
                            }}
                        />
                    ));
                } else {
                    deleteValidator();
                }
            }
        },
        [openModal, prepareCriteria, translate],
    );

    const cancelAddExternalValidator = useCallback(
        (criterion: Partial<FundCriterionLocal>) => {
            setCriterion({ ...criterion, show_external_validators_form: false, new_validator: 0 });
        },
        [setCriterion],
    );

    const pushExternalValidator = useCallback(
        (criterion: FundCriterionLocal) => {
            const organization_validator = criterion.validators_available.find((validator) => {
                return validator.id == criterion.new_validator;
            });

            criterion.external_validators.push({
                accepted: false,
                organization_id: organization_validator.validator_organization_id,
                organization_validator_id: organization_validator.id,
            });

            criterion.external_validators.sort((a, b) => {
                if (a.organization_validator_id != b.organization_validator_id) {
                    return a.organization_validator_id > b.organization_validator_id ? 1 : -1;
                } else {
                    return 0;
                }
            });

            cancelAddExternalValidator(criterion);
            prepareCriteria(criterion);
        },
        [cancelAddExternalValidator, prepareCriteria],
    );

    const criterionToValidations = useCallback(
        (criterion: Partial<FundCriterionLocal>, recordType: Partial<RecordType>) => {
            return recordType?.type !== 'date'
                ? {
                      min: criterion?.min ? parseInt(criterion?.min) : null,
                      max: criterion?.max ? parseInt(criterion?.max) : null,
                  }
                : {
                      min: criterion?.min,
                      max: criterion?.max,
                  };
        },
        [],
    );

    const prepareData = useCallback(() => {
        const { values, operators, validations } = recordTypes.reduce(
            (list: { operators: object; values: object; validations: object }, record_type) => {
                if (!list.operators[record_type.key]) {
                    list.operators[record_type.key] =
                        record_type.operators?.length > 0 ? record_type.operators[0]?.key : '';
                }

                if (!list.values[record_type.key]) {
                    list.values[record_type.key] =
                        record_type.options?.length > 0 ? record_type.options[0]?.value : null;
                }

                if (!list.validations[record_type.key]) {
                    list.validations[record_type.key] = {};
                }

                return list;
            },
            {
                values: { [criterion?.record_type_key]: criterion?.value },
                operators: { [criterion?.record_type_key]: criterion?.operator },
                validations: {
                    [criterion?.record_type_key]: criterionToValidations(criterion, recordType),
                },
            },
        );

        return {
            values: values,
            operators: operators,
            validations: validations,
        };
    }, [criterion, criterionToValidations, recordType, recordTypes]);

    useEffect(() => {
        if (!recordType || !operators || !values || !validations) {
            return;
        }

        setCriterionPrepared({
            ...criterion,
            record_type_key: recordType?.key,
            value: values[recordType?.key],
            operator: operators[recordType?.key],
            min: validations[recordType?.key]?.min,
            max: validations[recordType?.key]?.max,
        });
    }, [criterion, operators, recordType, validations, values]);

    useEffect(() => {
        const { values, operators, validations } = prepareData();

        setOperators(operators);
        setValidations(validations);
        setValues(values);

        prepareCriteria(criterion);
    }, [criterion, prepareCriteria, prepareData]);

    useEffect(() => {
        if (saveCriterionRef) {
            saveCriterionRef.current = saveCriterion;
        }
    }, [saveCriterion, saveCriterionRef]);

    return (
        <div className="criterion-item">
            <div className="criterion-head">
                <div
                    className={`criterion-title ${
                        !criterion?.is_editing && criterion?.external_validators.length == 0
                            ? 'criterion-title-large'
                            : ''
                    }`}>
                    {criterion?.title || criterion?.header}
                </div>

                <div className="criterion-actions">
                    {criterion?.is_editing && (
                        <div
                            className="button button-primary button-icon pull-left"
                            onClick={() => editDescription(criterion)}>
                            <em className="mdi mdi-comment-text icon-start" />
                        </div>
                    )}

                    {!criterion?.is_editing && (
                        <div className="button button-default" onClick={() => criterionEdit(criterion)}>
                            <em className="mdi mdi-pencil icon-start" />
                            {translate('components.fund_criteria_editor_item.buttons.edit')}
                        </div>
                    )}

                    {criterion?.is_editing && (
                        <div className="button button-default" onClick={() => cancelCriterion(criterion)}>
                            <em className="mdi mdi-close icon-start" />
                            {translate('components.fund_criteria_editor_item.buttons.cancel')}
                        </div>
                    )}

                    {isEditable && (
                        <button
                            className="button button-danger"
                            onClick={() => removeCriterion()}
                            disabled={disabledControls || criterion?.is_editing}>
                            <em className="mdi mdi-delete-outline icon-start" />
                            {translate('components.fund_criteria_editor_item.buttons.edit')}
                        </button>
                    )}
                </div>
            </div>

            {criterion?.is_editing && (
                <div className="criterion-body">
                    <div className="criterion-section">
                        {!criterion?.is_editing && (
                            <div className="criterion-organizations-list">
                                {criterionPrepared.validators_models.length > 0 && (
                                    <div className="row">
                                        <div className="col col-lg-12">
                                            <label className="form-label">Organisaties die mogen beoordelen</label>
                                        </div>
                                    </div>
                                )}

                                {criterionPrepared.validators_models.map((validator) => (
                                    <div className="criterion-organization active" key={validator.id}>
                                        <div className="criterion-organization-icon">
                                            <div
                                                className={`mdi mdi-shield-check ${
                                                    !validator.accepted ? 'text-muted' : ''
                                                }`}
                                            />
                                        </div>
                                        <div className="criterion-organization-name">
                                            {validator.validator_organization.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="form-group">
                            <div className="row">
                                <div className="col col-xs-12 col-sm-4">
                                    <label className="form-label">Eigenschap</label>
                                    <div className="form-offset">
                                        <SelectControl
                                            className={`form-control ${disabledControls ? 'disabled' : ''}`}
                                            propKey={'key'}
                                            placeholder="Eigenschap"
                                            disabled={disabledControls}
                                            value={recordType}
                                            onChange={(recordType: string) => {
                                                setRecordType(
                                                    recordTypes.find((_recordType) => _recordType.key == recordType),
                                                );
                                            }}
                                            options={recordTypes}
                                            optionsComponent={SelectControlOptions}
                                        />
                                    </div>
                                    {errors && <FormError error={errors['criteria.0.record_type_key']} />}
                                </div>

                                {recordType?.operators?.length > 0 && operators && (
                                    <div className="col col-xs-12 col-sm-4">
                                        <label className="form-label">Verhouding</label>
                                        <div className="form-offset">
                                            <SelectControl
                                                className={`form-control ${disabledControls ? 'disabled' : ''}`}
                                                placeholder="Verhouding"
                                                disabled={disabledControls}
                                                allowSearch={false}
                                                propKey={'key'}
                                                value={operators[recordType.key]}
                                                options={recordType?.operators}
                                                optionsComponent={SelectControlOptions}
                                                onChange={(operator: string) => {
                                                    setOperators({ ...operators, [recordType.key]: operator });
                                                }}
                                            />
                                        </div>
                                        {errors && <FormError error={errors['criteria.0.operator']} />}
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
                                                        className={`form-control ${disabledControls ? 'disabled' : ''}`}
                                                        type="text"
                                                        placeholder="Waarde"
                                                        defaultValue={values[recordType.key]}
                                                        disabled={disabledControls}
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
                                                            className={`form-control ${
                                                                disabledControls ? 'disabled' : ''
                                                            }`}
                                                            placeholder="Verhouding"
                                                            allowSearch={false}
                                                            propKey={'value'}
                                                            value={values[recordType.key]}
                                                            options={recordType.options}
                                                            optionsComponent={SelectControlOptions}
                                                            disabled={disabledControls}
                                                            onChange={(value: string) => {
                                                                values[recordType.key] = value;
                                                                setValues({ ...values });
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                            {['date'].includes(recordType.type) && operators[recordType.key] != '*' && (
                                                <DatePickerControl
                                                    value={values[recordType.key]}
                                                    placeholder={'Kies een datum'}
                                                    onChange={(value: Date) => {
                                                        values[recordType.key] = value;
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
                                            {errors && <FormError error={errors['criteria.0.value']} />}
                                        </div>
                                    )}
                            </div>
                        </div>

                        {recordType?.key && (
                            <div className="row">
                                <div className="col flex-xs-12 form-group">
                                    <CheckboxControl
                                        className={`${disabledControls ? 'disabled' : ''}`}
                                        id={`criterion_${blockId}_attachments`}
                                        title={translate('components.fund_criteria_editor_item.allow_attachments')}
                                        checked={criterionPrepared.show_attachment}
                                        disabled={disabledControls}
                                        onChange={() => {
                                            setCriterion({
                                                ...criterion,
                                                show_attachment: !criterionPrepared.show_attachment,
                                            });
                                        }}
                                    />
                                </div>

                                <div className="col flex-xs-12 form-group">
                                    <CheckboxControl
                                        className={`checkbox-narrow ${disabledControls ? 'disabled' : ''}`}
                                        id={`criterion_${blockId}_optional`}
                                        checked={criterionPrepared.optional}
                                        disabled={disabledControls}
                                        title={translate('components.fund_criteria_editor_item.optional')}
                                        onChange={() => {
                                            setCriterion({ ...criterion, optional: !criterionPrepared.optional });
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {recordType?.validations?.length > 0 && (
                        <Fragment>
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
                                                    className={`form-control ${disabledControls ? 'disabled' : ''}`}
                                                    type="number"
                                                    placeholder="Min"
                                                    defaultValue={validations[recordType.key]?.min}
                                                    disabled={disabledControls}
                                                    onChange={(e) => {
                                                        validations[recordType.key].min = parseInt(e.target.value);
                                                        setValidations({ ...validations });
                                                    }}
                                                />
                                            )}
                                            {recordType.type == 'date' && (
                                                <DatePickerControl
                                                    value={validations[recordType.key].min}
                                                    placeholder={'yyyy-MM-dd'}
                                                    disabled={disabledControls}
                                                    onChange={(date) => {
                                                        validations[recordType.key].min = date;
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
                                                    className={`form-control ${disabledControls ? 'disabled' : ''}`}
                                                    type="number"
                                                    placeholder="Max"
                                                    defaultValue={validations[recordType.key]?.max}
                                                    disabled={disabledControls}
                                                    onChange={(e) => {
                                                        validations[recordType.key].max = parseInt(e.target.value);
                                                        setValidations({ ...validations });
                                                    }}
                                                />
                                            )}

                                            {recordType.type == 'date' && (
                                                <DatePickerControl
                                                    value={validations[recordType.key].max}
                                                    placeholder={'yyyy-MM-dd'}
                                                    onChange={(date) => {
                                                        validations[recordType.key].max = date;
                                                        setValidations({ ...validations });
                                                    }}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {shouldBeValid && (
                                <div className="row">
                                    {recordType.validations.includes('email') && (
                                        <div className="col col-xs-12 form-group">
                                            <CheckboxControl
                                                checked={shouldBeValid}
                                                title={`Should be in valid email format. ex: email@example.com`}
                                                disabled={true}
                                                onChange={() => null}
                                            />
                                        </div>
                                    )}

                                    {recordType.validations.includes('date') && (
                                        <div className="col col-xs-12 form-group">
                                            <CheckboxControl
                                                checked={shouldBeValid}
                                                title={`Should be in valid date format. ex: dd-MM-jjjj`}
                                                disabled={true}
                                                onChange={() => null}
                                            />
                                        </div>
                                    )}

                                    {recordType.validations.includes('iban') && (
                                        <div className="col col-xs-12 form-group">
                                            <CheckboxControl
                                                checked={shouldBeValid}
                                                title={`Should be in valid IBAN format`}
                                                disabled={true}
                                                onChange={() => null}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </Fragment>
                    )}

                    {criterionPrepared?.validators_available?.length > 1 ||
                        (criterionPrepared?.external_validators?.length > 0 && (
                            <div className="criterion-section">
                                <div className="criterion-subtitle">Organisaties die mogen beoordelen</div>
                                <div className="criterion-organizations-root">
                                    {criterionPrepared.external_validators.length > 0 && (
                                        <div className="flex-row">
                                            <div className="flex-col">
                                                {criterionPrepared.validators_list[0].length > 0 && (
                                                    <div className="criterion-organizations">
                                                        {criterionPrepared.validators_list[0].map((validator) => (
                                                            <div className="criterion-organization" key={validator.id}>
                                                                <div className="criterion-organization-icon">
                                                                    <div
                                                                        className={`mdi mdi-shield-check ${
                                                                            !validator.accepted ? 'text-muted' : ''
                                                                        }`}
                                                                    />
                                                                </div>

                                                                <div className="criterion-organization-name">
                                                                    {validator.validator_organization.name}
                                                                </div>

                                                                <div
                                                                    className="criterion-organization-actions"
                                                                    onClick={() =>
                                                                        removeExternalValidator(criterion, validator.id)
                                                                    }>
                                                                    <div className="mdi mdi-close" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-col">
                                                {criterionPrepared.validators_list[1].length > 0 && (
                                                    <div className="criterion-organizations">
                                                        {criterionPrepared.validators_list[1].map((validator) => (
                                                            <div className="criterion-organization" key={validator.id}>
                                                                <div className="criterion-organization-icon">
                                                                    <div
                                                                        className={`mdi mdi-shield-check ${
                                                                            !validator.accepted ? 'text-muted' : ''
                                                                        }`}
                                                                    />
                                                                </div>

                                                                <div className="criterion-organization-name">
                                                                    {validator.validator_organization.name}
                                                                </div>

                                                                <div
                                                                    className="criterion-organization-actions"
                                                                    onClick={() =>
                                                                        removeExternalValidator(criterion, validator.id)
                                                                    }>
                                                                    <div className="mdi mdi-close" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {criterionPrepared.show_external_validators_form && (
                                    <div className="row">
                                        <div className="col col-xs-12 col-sm-6">
                                            <div className="form-group">
                                                <label className="form-label">Selecteer organisatie</label>
                                                <SelectControl
                                                    className="form-control"
                                                    propKey={'id'}
                                                    allowSearch={false}
                                                    options={criterionPrepared.validators_available}
                                                    optionsComponent={SelectControlOptions}
                                                    onChange={(validator: number) => {
                                                        setCriterion({ ...criterion, new_validator: validator });
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="col col-xs-12 col-sm-6">
                                            <div className="form-group">
                                                <label className="form-label">&nbsp;</label>
                                                <div className="button-group">
                                                    <div
                                                        className={`button button-primary ${
                                                            !criterionPrepared.new_validator ? 'button-disabled' : ''
                                                        }`}
                                                        onClick={() => pushExternalValidator(criterion)}>
                                                        Toevoegen
                                                    </div>

                                                    <div
                                                        className="button button-default"
                                                        onClick={() => cancelAddExternalValidator(criterion)}>
                                                        Annuleren
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {criterionPrepared.show_external_validators_form &&
                                    criterionPrepared.validators_available.length > 1 && (
                                        <div
                                            className="button button-primary"
                                            onClick={() => addExternalValidator(criterion)}>
                                            <em className="mdi mdi-plus-circle icon-start" />
                                            {translate(
                                                'components.fund_criteria_editor_item.buttons.add_external_validator',
                                            )}
                                        </div>
                                    )}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
