import React, { useCallback, useEffect } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import { useTranslation } from 'react-i18next';
import { chunk } from 'lodash';
import CheckboxControl from '../elements/forms/controls/CheckboxControl';

export type ExportFieldProp = {
    key?: string;
    name?: string;
    value: string;
    icon: string;
    selected?: string;
    label: string;
};

export type ExportSectionProp = {
    type: 'radio' | 'checkbox';
    key: string;
    value?: string;
    fields: Array<ExportFieldProp>;
    fieldsPerRow?: number;
    title: string;
    collapsable?: boolean;
    selectAll?: boolean;
};

type ExportSectionPropLocal = ExportSectionProp & {
    fieldsView: Array<
        Array<{
            key: string;
            name: string;
            selected: boolean;
        }>
    >;
    value?: string;
    collapsed: boolean;
    selected: Array<ExportFieldProp>;
};

export default function ModalExportDataSelect({
    modal,
    title,
    className,
    description,
    sections,
    required = true,
    onSuccess,
}: {
    modal: ModalState;
    title?: string;
    className?: string;
    sections: Array<ExportSectionProp>;
    required?: boolean;
    description?: string | Array<string>;
    onSuccess: (values: object) => void;
}) {
    const { t } = useTranslation();

    const [isValid, setIsValid] = React.useState(false);
    const [localSections, setLocalSections] = React.useState<Array<ExportSectionPropLocal>>(null);

    const updateIsValid = useCallback(
        (localSections) => {
            const checkboxSections = localSections?.filter(
                (section: ExportSectionPropLocal) => section.type === 'checkbox',
            );
            const checkboxSectionsChecked = checkboxSections?.filter(
                (section: ExportSectionPropLocal) => section.selected.length > 0,
            );

            setIsValid(!required || !checkboxSections?.length || checkboxSectionsChecked?.length);
        },
        [required],
    );

    const updateSelectedFields = useCallback((section: ExportSectionPropLocal) => {
        section.selected = section.fields.filter((field: ExportFieldProp) => field.selected);
        section.selectAll = section.selected.length === section.fields.length;

        return section;
    }, []);

    const toggleAllFields = useCallback(
        (section: ExportSectionPropLocal, checked: boolean) => {
            section.selectAll = checked;
            section.fieldsView.forEach((row) => row.forEach((field) => (field.selected = section.selectAll)));

            const localSections2 = localSections.map((section: ExportSectionPropLocal) =>
                updateSelectedFields(section),
            );

            setLocalSections(localSections2);
        },
        [localSections, updateSelectedFields],
    );

    const collapseSection = useCallback(
        (section) => {
            if (section.collapsable) {
                section.collapsed = !section.collapsed;
            }

            setLocalSections([...localSections]);
        },
        [localSections],
    );

    const onSubmit = useCallback(() => {
        const values = localSections.reduce((values, section) => {
            if (section.type === 'radio') {
                return { ...values, [section.key]: section.value == 'null' ? null : section.value };
            }

            if (section.type === 'checkbox') {
                return {
                    ...values,
                    [section.key]: section.fields.filter((field) => field.selected).map((field) => field.key),
                };
            }

            return values;
        }, {});

        onSuccess(values);
        modal.close();
    }, [localSections, modal, onSuccess]);

    useEffect(() => {
        const localSections = sections.map((section) => {
            const { type, fields, fieldsPerRow } = section;

            if (type == 'checkbox') {
                const fieldsList = fields.map((field) => {
                    const value = field.value == null ? 'null' : field.value;
                    const selectAll = !!section.selectAll;

                    return { ...field, ...{ selected: selectAll || field?.selected, value: value } };
                });

                return { ...section, fieldsView: chunk(fieldsList, fieldsPerRow), fields: fieldsList };
            }

            return section;
        });

        const localSections2 = localSections.map((section: ExportSectionPropLocal) => updateSelectedFields(section));

        setLocalSections(localSections2);
    }, [sections, updateSelectedFields]);

    useEffect(() => {
        if (localSections) {
            updateIsValid(localSections);
        }
    }, [localSections, updateIsValid]);

    return (
        <div
            className={classList([
                'modal',
                'modal-md',
                'modal-animated',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />
            <form
                className="modal-window form"
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }}>
                <div className="modal-close mdi mdi-close" onClick={modal.close} />
                <div className="modal-header">{title ? title : t('modals.modal_export_data.title')}</div>

                <div className="modal-body">
                    <div className="modal-section">
                        <div className="block block-export-options">
                            {description && <div className="modal-heading">{description}</div>}
                            {localSections?.map((section, indexSection) => (
                                <div
                                    key={indexSection}
                                    className={`export-section 
                                    ${section.collapsable ? 'export-section-collapsable' : ''} 
                                    ${section.key == 'extra_fields' ? 'export-section-extra-fields' : ''}`}>
                                    <div className="export-section-label flex" onClick={() => collapseSection(section)}>
                                        {section.collapsable && (
                                            <em
                                                className={`mdi export-section-label-icon ${
                                                    section.collapsed ? 'mdi-menu-right' : 'mdi-menu-down'
                                                }`}
                                            />
                                        )}
                                        <div className="flex flex-grow flex-vertical flex-center">
                                            <div className="form-label">{section.title}</div>
                                        </div>
                                        {section.type === 'checkbox' && (
                                            <div className="flex">
                                                <label
                                                    className="form-toggle"
                                                    htmlFor="checkbox_{{ section.key }}_check_all">
                                                    <input
                                                        type="checkbox"
                                                        id="checkbox_{{ section.key }}_check_all"
                                                        checked={section.selectAll}
                                                        onChange={() => toggleAllFields(section, !section.selectAll)}
                                                    />
                                                    <div className="form-toggle-inner flex-end">
                                                        <div className="toggle-input">
                                                            <div className="toggle-input-dot" />
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                    {section.type === 'checkbox' && !section.collapsed && (
                                        <div className="export-options">
                                            <table>
                                                <tbody>
                                                    {section.fieldsView?.map((row, index) => (
                                                        <tr key={index}>
                                                            {row?.map((field) => (
                                                                <td key={`${index}_${field.key}`}>
                                                                    <CheckboxControl
                                                                        className={'checkbox-narrow'}
                                                                        checked={field.selected}
                                                                        title={field.name}
                                                                        onChange={() => {
                                                                            field.selected = !field.selected;
                                                                            updateSelectedFields(section);
                                                                            setLocalSections([...localSections]);
                                                                        }}
                                                                    />
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                    {section.type === 'radio' && !section.collapsed && (
                                        <div className="export-options">
                                            {section.fields.map((field, index) => (
                                                <label
                                                    key={index}
                                                    className="export-option"
                                                    htmlFor={`radio_${indexSection}_${index}`}>
                                                    <input
                                                        type="radio"
                                                        id={`radio_${indexSection}_${index}`}
                                                        checked={section.value == field.value}
                                                        value={field.value}
                                                        onChange={(e) => {
                                                            section.value = e.target.value;
                                                            updateSelectedFields(section);
                                                            setLocalSections([...localSections]);
                                                        }}
                                                    />
                                                    <div className="export-option-label">
                                                        <div className={`export-option-icon mdi mdi-${field.icon}`} />
                                                        <span>{field.label}</span>
                                                        <div className="export-option-circle" />
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="modal-footer text-center">
                    <button className="button button-default" type="button" onClick={modal.close}>
                        {t('modals.modal_voucher_create.buttons.cancel')}
                    </button>
                    <button className="button button-primary" disabled={!isValid} type="submit">
                        {t('modals.modal_export_data.buttons.submit')}
                    </button>
                </div>
            </form>
        </div>
    );
}
