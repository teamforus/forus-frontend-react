import React, { createRef, MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import Fund from '../../../props/models/Fund';
import Organization from '../../../props/models/Organization';
import RecordType from '../../../props/models/RecordType';
import { hasPermission } from '../../../helpers/utils';
import FundCriteriaEditorItem from './FundCriteriaEditorItem';
import FundCriterion from '../../../props/models/FundCriterion';
import useTranslate from '../../../hooks/useTranslate';

export type FundCriterionOrganization = Organization & {
    accepted?: boolean;
    validator_organization?: FundCriterionOrganization;
    validator_organization_id?: number;
};

export type FundCriterionLocal = FundCriterion & {
    is_editing?: boolean;
    show_external_validators_form?: boolean;
    new_validator?: number;
    is_new?: boolean;
    header?: string;
    external_validators: Array<{
        accepted: boolean;
        organization_id: number;
        organization_validator_id: number;
    }>;
    validators_models?: Array<FundCriterionOrganization>;
    validators_available?: Array<{
        id: number;
        validator_organization_id?: number;
        validator_organization?: { name: string };
    }>;
    validators?: Array<Array<FundCriterionOrganization>>;
    validators_list?: Array<Array<FundCriterionOrganization>>;
    use_external_validators?: boolean;
};

export default function FundCriteriaEditor({
    fund,
    organization,
    criteria,
    setCriteria,
    isEditable,
    recordTypes,
    saveButton,
    onSaveCriteria,
    validatorOrganizations,
    saveCriteriaRef,
}: {
    fund: Fund;
    organization: Organization;
    criteria: Array<FundCriterionLocal>;
    setCriteria: (criteria: Array<FundCriterionLocal>) => void;
    isEditable: boolean;
    recordTypes: Array<Partial<RecordType>>;
    saveButton?: boolean;
    onSaveCriteria?: (criteria: Array<FundCriterionLocal>) => void;
    validatorOrganizations: Array<Organization>;
    saveCriteriaRef?: MutableRefObject<() => Promise<unknown>>;
}) {
    const translate = useTranslate();

    const [criterionBlocksRefs, setCriterionBlocksRef] = useState<Array<MutableRefObject<() => Promise<boolean>>>>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [deletedItemsCount, setDeleteItemsCount] = useState<number>(0);

    const elementRef = useRef<HTMLDivElement>(null);

    const updateOnEditFlag = useCallback(() => {
        setIsEditing(criteria.filter((criterion) => criterion?.is_editing).length > 0);
    }, [criteria]);

    const addCriteria = useCallback(() => {
        criteria.push({
            is_new: true,
            is_editing: true,
            show_attachment: false,
            external_validators: [],
            record_type_key: null,
            operator: null,
            value: null,
            optional: false,
        });
        setCriteria([...criteria]);

        updateOnEditFlag();
    }, [criteria, setCriteria, updateOnEditFlag]);

    const saveCriteria = useCallback(() => {
        return new Promise((resolve) => {
            Promise.all(criteria.map((criterion, index) => criterionBlocksRefs[index].current())).then((result) => {
                updateOnEditFlag();

                if (result.filter((result) => !result).length === 0) {
                    resolve(true);
                    setCriteria([...criteria]);
                    if (onSaveCriteria) {
                        onSaveCriteria(criteria);
                    }
                } else {
                    resolve(false);

                    setTimeout(() => {
                        const errors = $(elementRef.current).find('.form-error');

                        if (errors.length) {
                            window.scrollTo(0, Math.max(0, errors.offset().top - 100));
                        }
                    }, 250);
                }
            });
        });
    }, [criteria, criterionBlocksRefs, onSaveCriteria, setCriteria, updateOnEditFlag]);

    const onDelete = useCallback(
        (criterion: FundCriterionLocal) => {
            const index = criteria.indexOf(criterion);

            if (index != -1) {
                setDeleteItemsCount(deletedItemsCount + 1);
                criteria.splice(index, 1);
            } else {
                criteria.splice(
                    criteria.findIndex((item) => item.is_new),
                    1,
                );
            }
            setCriteria([...criteria]);
        },
        [criteria, deletedItemsCount, setCriteria],
    );

    useEffect(() => {
        setCriterionBlocksRef([...new Array(criteria.length)].map(() => createRef<() => Promise<boolean>>()));
    }, [criteria.length]);

    useEffect(() => {
        if (saveCriteriaRef) {
            saveCriteriaRef.current = saveCriteria;
        }
    }, [saveCriteria, saveCriteriaRef]);

    return (
        <div className="block block-criteria-editor">
            {criteria.map((criterion, index) => (
                <FundCriteriaEditorItem
                    key={index}
                    fund={fund}
                    recordTypes={[{ key: null, name: 'Select' }, ...recordTypes]}
                    isEditable={isEditable}
                    organization={organization}
                    criterion={criterion}
                    onEditCriteria={updateOnEditFlag}
                    onEditCancelCriteria={updateOnEditFlag}
                    setCriterion={(_criterion) => {
                        criteria[index] = { ...criterion, ..._criterion };
                        setCriteria([...criteria]);
                    }}
                    onDeleteCriteria={onDelete}
                    validatorOrganizations={validatorOrganizations}
                    saveCriterionRef={criterionBlocksRefs[index]}
                />
            ))}

            <div className="criteria-editor-actions">
                {isEditable && hasPermission(organization, 'manage_funds') && (
                    <div className="button button-primary" onClick={() => addCriteria()}>
                        <em className="mdi mdi-plus-circle icon-start" />
                        {translate('components.fund_criteria_editor.buttons.add_criteria')}
                    </div>
                )}

                {saveButton && (isEditing || deletedItemsCount > 0) && (
                    <div className="button button-primary pull-right" onClick={() => saveCriteria()}>
                        <em className="mdi mdi-content-save icon-start" />
                        {translate('components.fund_criteria_editor.buttons.save')}
                    </div>
                )}
            </div>
        </div>
    );
}
