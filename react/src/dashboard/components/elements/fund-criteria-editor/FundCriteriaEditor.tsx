import React, { createRef, MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Fund from '../../../props/models/Fund';
import Organization from '../../../props/models/Organization';
import RecordType from '../../../props/models/RecordType';
import { hasPermission } from '../../../helpers/utils';
import FundCriteriaEditorItem from './FundCriteriaEditorItem';
import FundCriterion from '../../../props/models/FundCriterion';
import useTranslate from '../../../hooks/useTranslate';
import { uniqueId } from 'lodash';
import classNames from 'classnames';

export type CriteriaEditorItem = {
    uid?: string;
    isNew?: boolean;
    isEditing?: boolean;
    saveRef?: React.MutableRefObject<() => Promise<boolean>>;
    item: FundCriterion;
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
    saveCriteriaRef,
    className,
    bodyClassName,
    footerClassName,
}: {
    fund: Fund;
    organization: Organization;
    criteria: Array<FundCriterion>;
    setCriteria: (criteria: Array<FundCriterion>) => void;
    isEditable: boolean;
    recordTypes: Array<RecordType>;
    saveButton?: boolean;
    onSaveCriteria?: (criteria: Array<FundCriterion>) => void;
    saveCriteriaRef?: MutableRefObject<() => Promise<Array<FundCriterion>> | null>;
    className?: string;
    bodyClassName?: string;
    footerClassName?: string;
}) {
    const translate = useTranslate();

    const [deletedItemsCount, setDeleteItemsCount] = useState<number>(0);
    const elementRef = useRef<HTMLDivElement>(null);
    const [criteriaList, setCriteriaList] = useState<Array<CriteriaEditorItem>>(null);

    const recordTypesList = useMemo(() => {
        return [{ key: null, name: 'Select' }, ...recordTypes];
    }, [recordTypes]);

    const modified = useMemo(() => {
        return criteriaList?.filter((item) => item?.isEditing)?.length > 0;
    }, [criteriaList]);

    const addCriteria = useCallback(() => {
        setCriteriaList((criteriaList) => [
            ...criteriaList,
            {
                uid: uniqueId(),
                isNew: true,
                isEditing: true,
                saveRef: createRef<() => Promise<boolean>>(),
                item: {
                    show_attachment: false,
                    record_type_key: null,
                    operator: null,
                    value: null,
                    optional: false,
                },
            },
        ]);
    }, []);

    const saveCriteria = useCallback(() => {
        const promises = criteriaList.map((item) => item.saveRef.current());

        return new Promise<Array<FundCriterion> | null>((resolve) => {
            Promise.all(promises).then((result) => {
                const errors = result.reduce((list, valid, index) => {
                    return valid ? [...list] : [...list, index];
                }, []);

                if (errors.length === 0) {
                    setCriteriaList((list) => [
                        ...list.map((item) => ({
                            ...item,
                            isNew: false,
                            isEditing: false,
                        })),
                    ]);

                    const criteria = criteriaList.map(({ item }) => item);

                    setCriteria(criteria);
                    onSaveCriteria?.(criteria);

                    resolve(criteria);
                    return;
                }

                resolve(null);

                setCriteriaList((list) => {
                    errors.forEach((index) => {
                        list[index].isEditing = true;
                    });

                    return [...list];
                });

                setTimeout(() => {
                    elementRef?.current?.querySelector('.form-error')?.scrollIntoView();
                }, 250);
            });
        });
    }, [criteriaList, onSaveCriteria, setCriteria]);

    const onDelete = useCallback(
        (index: number) => {
            const criterion = criteriaList[index];
            const criterionIndex = criteria.indexOf(criterion?.item);

            if (criterionIndex !== -1) {
                criteria.splice(criterionIndex, 1);
                setCriteria([...criteria]);
            }

            if (index !== -1) {
                criteriaList.splice(index, 1);
                setCriteriaList([...criteriaList]);
            }

            setDeleteItemsCount((count) => count + 1);
        },
        [criteria, criteriaList, setCriteria],
    );

    useEffect(() => {
        setCriteriaList((criteriaList) => {
            return criteria.map((criterion) => {
                const preValue = criteriaList?.find((item) => item.item == criterion);

                return preValue
                    ? { ...preValue }
                    : { uid: uniqueId(), item: criterion, saveRef: createRef<() => Promise<boolean>>() };
            });
        });
    }, [criteria]);

    useEffect(() => {
        if (saveCriteriaRef) {
            saveCriteriaRef.current = saveCriteria;
        }
    }, [saveCriteria, saveCriteriaRef]);

    return (
        <div className={classNames('block block-criteria-editor', className)} ref={elementRef}>
            <div className={classNames('criterion-list', bodyClassName)}>
                {criteriaList?.map((item, index) => (
                    <FundCriteriaEditorItem
                        key={item.uid}
                        fund={fund}
                        recordTypes={recordTypesList}
                        isEditable={isEditable}
                        organization={organization}
                        criterion={item.item}
                        isNew={item.isNew}
                        isEditing={item.isEditing}
                        setIsEditing={(isEditing: boolean) => {
                            setCriteriaList((list) => {
                                list[index].isEditing = isEditing;
                                return [...list];
                            });
                        }}
                        setCriterion={(_criterion) => {
                            setCriteriaList((list) => {
                                list[index].item = { ...list[index].item, ..._criterion };
                                return [...list];
                            });
                        }}
                        onDeleteCriteria={() => onDelete(index)}
                        saveCriterionRef={item.saveRef}
                    />
                ))}
            </div>

            {isEditable && hasPermission(organization, 'manage_funds') && (
                <div className={classNames('criteria-editor-actions', footerClassName)}>
                    <div className="button button-primary" onClick={addCriteria}>
                        <em className="mdi mdi-plus-circle icon-start" />
                        {translate('components.fund_criteria_editor.buttons.add_criteria')}
                    </div>

                    <div className="flex-grow" />

                    {saveButton && (modified || deletedItemsCount > 0) && (
                        <div className="button button-primary" onClick={saveCriteria}>
                            <em className="mdi mdi-content-save icon-start" />
                            {translate('components.fund_criteria_editor.buttons.save')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
