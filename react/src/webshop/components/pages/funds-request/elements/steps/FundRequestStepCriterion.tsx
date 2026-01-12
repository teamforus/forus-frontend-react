import React, { Fragment, useCallback } from 'react';
import Fund from '../../../../../props/models/Fund';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import { LocalCriterion } from '../../FundRequest';
import Markdown from '../../../../elements/markdown/Markdown';
import SelectControl from '../../../../../../dashboard/components/elements/select-control/SelectControl';
import UIControlCheckbox from '../../../../../../dashboard/components/elements/forms/ui-controls/UIControlCheckbox';
import UIControlStep from '../../../../../../dashboard/components/elements/forms/ui-controls/UIControlStep';
import UIControlDate from '../../../../../../dashboard/components/elements/forms/ui-controls/UIControlDate';
import { dateFormat, dateParse } from '../../../../../../dashboard/helpers/dates';
import UIControlNumber from '../../../../../../dashboard/components/elements/forms/ui-controls/UIControlNumber';
import UIControlText from '../../../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import FormError from '../../../../../../dashboard/components/elements/forms/errors/FormError';
import FileUploader from '../../../../elements/file-uploader/FileUploader';
import RecordType from '../../../../../../dashboard/props/models/RecordType';
import classNames from 'classnames';
import FormLabel from '../../../../elements/forms/FormLabel';

export default function FundRequestStepCriterion({
    fund,
    criterion,
    recordTypesByKey,
    uploaderTemplate,
    setCriterion,
    isGroup = false,
}: {
    fund: Fund;
    criterion: LocalCriterion;
    recordTypesByKey: { [_key: string]: RecordType };
    uploaderTemplate: 'default' | 'inline';
    setCriterion: (index: number, update: Partial<LocalCriterion>) => void;
    isGroup?: boolean;
}) {
    const translate = useTranslate();
    const fileUploaderTemplate: 'default' | 'inline' | 'group' = isGroup ? 'group' : uploaderTemplate;

    const isLabelRequired = useCallback(
        (criteria: LocalCriterion) => {
            return !criteria.optional && fund.criteria_label_requirement_show !== 'optional';
        },
        [fund.criteria_label_requirement_show],
    );

    const isLabelOptional = useCallback(
        (criteria: LocalCriterion) => {
            return criteria.optional && fund.criteria_label_requirement_show !== 'required';
        },
        [fund.criteria_label_requirement_show],
    );

    return (
        <Fragment>
            {!(isGroup && criterion.control_type == 'ui_control_checkbox') && (
                <Fragment>
                    {uploaderTemplate === 'inline' ? (
                        <Fragment>
                            {(criterion.title ||
                                criterion.title_default ||
                                (criterion.description && criterion.description !== '_')) && (
                                <div className="sign_up-pane-text flex flex-vertical flex-gap-sm">
                                    <div className="sign_up-pane-text">
                                        <div className="sign_up-pane-heading">
                                            {criterion.title || criterion.title_default}
                                        </div>
                                    </div>

                                    {criterion.extra_description && criterion.extra_description !== '_' && (
                                        <div className="sign_up-pane-step-description">
                                            <Markdown content={criterion.extra_description_html} />
                                        </div>
                                    )}

                                    <div className="sign_up-pane-text">
                                        {criterion.description && criterion.description !== '_' && (
                                            <Markdown content={criterion.description_html} />
                                        )}
                                    </div>
                                </div>
                            )}
                        </Fragment>
                    ) : (
                        <Fragment>
                            <div className="sign_up-pane-text">
                                <div className="sign_up-pane-text">
                                    {criterion.description && criterion.description !== '_' && (
                                        <Markdown content={criterion.description_html} fontSize={16} />
                                    )}
                                </div>

                                {!criterion.description && criterion.description !== '_' && (
                                    <div className="sign_up-pane-text">{criterion.title_default}</div>
                                )}
                            </div>
                        </Fragment>
                    )}
                </Fragment>
            )}

            <div className={classNames('form-group', criterion.control_type == 'ui_control_step' && 'form-group-fit')}>
                {!(isGroup && criterion.control_type == 'ui_control_checkbox') && (
                    <FormLabel
                        htmlFor={`criterion_${criterion.id}`}
                        info={{
                            start: uploaderTemplate === 'inline',
                            type: isLabelRequired(criterion)
                                ? 'required'
                                : isLabelOptional(criterion)
                                  ? 'optional'
                                  : null,
                        }}>
                        {uploaderTemplate !== 'inline' && recordTypesByKey?.[criterion?.record_type?.key]?.name}
                    </FormLabel>
                )}

                {criterion.control_type == 'select_control' && (
                    <SelectControl
                        id={`criterion_${criterion.id}`}
                        propKey="value"
                        value={criterion.input_value}
                        options={recordTypesByKey?.[criterion?.record_type?.key]?.options}
                        onChange={(input_value?: string) => {
                            setCriterion(criterion.id, { input_value: input_value });
                        }}
                        dusk="selectControl"
                        placeholder={translate('fund_request.sign_up.fund_request_step_criteria.make_a_choice')}
                        multiline={true}
                    />
                )}

                {criterion.control_type == 'ui_control_checkbox' && (
                    <UIControlCheckbox
                        checked={!!criterion.is_checked}
                        name={criterion.record_type.key}
                        id={`criterion_${criterion.id}`}
                        label={criterion.label}
                        slim={true}
                        dataDusk="controlCheckbox"
                        onChangeValue={(checked) => {
                            setCriterion(criterion.id, {
                                is_checked: checked,
                                input_value: checked ? criterion.value : null,
                            });
                        }}
                    />
                )}

                {criterion.control_type == 'ui_control_step' && (
                    <UIControlStep
                        id={`criterion_${criterion.id}`}
                        value={parseInt(criterion.input_value)}
                        onChange={(value) => {
                            setCriterion(criterion.id, { input_value: value.toFixed() });
                        }}
                        name={criterion.record_type.key}
                        min={0}
                        max={32}
                        dataDusk="controlStep"
                    />
                )}

                {criterion.control_type == 'ui_control_date' && (
                    <UIControlDate
                        value={criterion?.input_value ? dateParse(criterion?.input_value, 'dd-MM-yyyy') : new Date()}
                        format={'dd-MM-yyyy'}
                        onChange={(date) => {
                            setCriterion(criterion.id, {
                                input_value: date ? dateFormat(date, 'dd-MM-yyyy') : '',
                            });
                        }}
                        id={`criterion_${criterion.id}`}
                        dataDusk="controlDate"
                    />
                )}

                {criterion.control_type == 'ui_control_number' && (
                    <UIControlNumber
                        type={'number'}
                        value={criterion.input_value ? parseFloat(criterion.input_value) : null}
                        name={criterion.record_type.key}
                        id={`criterion_${criterion.id}`}
                        dataDusk="controlNumber"
                        onChangeValue={(value) => {
                            setCriterion(criterion.id, { input_value: (value || '').toString() });
                        }}
                    />
                )}

                {criterion.control_type == 'ui_control_text' && (
                    <UIControlText
                        type={'text'}
                        value={criterion.input_value}
                        name={criterion.record_type.key}
                        id={`criterion_${criterion.id}`}
                        dataDusk="controlText"
                        onChange={(e) => {
                            setCriterion(criterion.id, { input_value: e.target.value });
                        }}
                    />
                )}

                {criterion.control_type == 'ui_control_currency' && (
                    <UIControlNumber
                        type={'currency'}
                        value={criterion.input_value ? parseFloat(criterion.input_value) : null}
                        min={0}
                        name={criterion.record_type.key}
                        id={`criterion_${criterion.id}`}
                        dataDusk="controlCurrency"
                        onChangeValue={(value) => {
                            setCriterion(criterion.id, { input_value: (value || '').toString() });
                        }}
                    />
                )}

                <FormError error={criterion.errors?.value} />
            </div>
            {criterion.show_attachment &&
                (criterion.control_type !== 'ui_control_checkbox' || criterion.input_value === criterion.value) && (
                    <FileUploader
                        type="fund_request_record_proof"
                        files={criterion.files}
                        cropMedia={false}
                        template={fileUploaderTemplate}
                        onFilesChange={({ files }) => {
                            setCriterion(criterion.id, {
                                files,
                                files_uid: files.map((file) => file.uid),
                            });
                        }}
                    />
                )}
            <FormError error={criterion.errors?.files} />
            <FormError error={criterion.errors?.record} />
        </Fragment>
    );
}
