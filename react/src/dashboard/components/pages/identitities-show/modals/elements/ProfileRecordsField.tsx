import FormBuilder from '../../../../../types/FormBuilder';
import React, { Fragment } from 'react';
import FormGroup from '../../../../elements/forms/elements/FormGroup';
import DatePickerControl from '../../../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../../../helpers/dates';
import SelectControl from '../../../../elements/select-control/SelectControl';
import RecordType from '../../../../../props/models/RecordType';
import { ProfileRecordType } from '../../../../../props/models/Sponsor/SponsorIdentity';
import useTranslate from '../../../../../hooks/useTranslate';

export default function ProfileRecordsField({
    recordType,
    form,
}: {
    recordType: Partial<RecordType> & { key: ProfileRecordType };
    form: FormBuilder<Partial<{ [key in ProfileRecordType]: string }>>;
}) {
    const translate = useTranslate();

    return (
        <FormGroup
            label={recordType.name}
            error={form.errors?.[recordType.key]}
            info={translate('identities.record_info.' + recordType.key)}
            input={(id) =>
                recordType.key === 'birth_date' ? (
                    <DatePickerControl
                        id={id}
                        value={dateParse(form.values[recordType.key] || '')}
                        placeholder={recordType.name}
                        onChange={(date) => form.update({ [recordType.key]: dateFormat(date) })}
                    />
                ) : (
                    <Fragment>
                        {recordType?.type === 'select' ? (
                            <SelectControl
                                id={id}
                                value={form.values[recordType.key] || ''}
                                propKey={'value'}
                                propValue={'name'}
                                options={[{ value: '', name: 'Selecteer...' }, ...recordType.options]}
                                multiline={true}
                                placeholder={recordType.name}
                                onChange={(value: string) => form.update({ [recordType.key]: value })}
                            />
                        ) : (
                            <input
                                id={id}
                                type={'text'}
                                className="form-control"
                                value={form.values[recordType.key] || ''}
                                placeholder={recordType.name}
                                onChange={(e) => form.update({ [recordType.key]: e.target.value })}
                            />
                        )}
                    </Fragment>
                )
            }
        />
    );
}
