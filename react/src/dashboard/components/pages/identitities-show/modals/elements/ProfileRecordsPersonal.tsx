import FormBuilder from '../../../../../types/FormBuilder';
import React, { useCallback } from 'react';
import FormGroup from '../../../../elements/forms/elements/FormGroup';
import FormGroupInfo from '../../../../elements/forms/elements/FormGroupInfo';
import { dateParse } from '../../../../../helpers/dates';
import FormPane from '../../../../elements/forms/elements/FormPane';
import RecordType from '../../../../../props/models/RecordType';
import { ProfileRecordType } from '../../../../../props/models/Sponsor/SponsorIdentity';
import useTranslate from '../../../../../hooks/useTranslate';
import { differenceInYears } from 'date-fns';
import ProfileRecordsField from './ProfileRecordsField';

export default function ProfileRecordsPersonal({
    form,
    recordTypes,
}: {
    form: FormBuilder<Partial<{ [key in ProfileRecordType]: string }>>;
    recordTypes: Partial<{ [key in ProfileRecordType]: RecordType & { key: ProfileRecordType } }>;
}) {
    const translate = useTranslate();

    const calculatedAge = useCallback((value: string) => {
        return value ? Math.max(differenceInYears(new Date(), dateParse(value)), 0) : null;
    }, []);

    return (
        <FormPane title={'Persoonsgegevens'}>
            <div className="row">
                <div className="col col-xs-12 col-sm-6">
                    <ProfileRecordsField recordType={recordTypes.given_name} form={form} />
                </div>
                <div className="col col-xs-12 col-sm-6">
                    <ProfileRecordsField recordType={recordTypes.family_name} form={form} />
                </div>
            </div>
            <div className="row">
                <div className="col col-xs-12 col-sm-6">
                    <ProfileRecordsField recordType={recordTypes.birth_date} form={form} />
                </div>
                <div className="col col-xs-12 col-sm-6">
                    <FormGroup
                        label={'Leeftijd'}
                        input={(id) => (
                            <FormGroupInfo info={translate('identities.record_info.age')}>
                                <input
                                    id={id}
                                    disabled={true}
                                    type={'text'}
                                    className="form-control"
                                    value={calculatedAge(form.values.birth_date)?.toString() || ''}
                                    placeholder={recordTypes.birth_date.name}
                                    onChange={(e) => form.update({ [recordTypes.birth_date.key]: e.target.value })}
                                />
                            </FormGroupInfo>
                        )}
                    />
                </div>
            </div>
            <div className="row">
                <div className="col col-xs-12 col-sm-6">
                    <ProfileRecordsField recordType={recordTypes.gender} form={form} />
                </div>
                <div className="col col-xs-12 col-sm-6">
                    <ProfileRecordsField recordType={recordTypes.marital_status} form={form} />
                </div>
            </div>
            <div className="row">
                <div className="col col-xs-12 col-sm-12">
                    <ProfileRecordsField recordType={recordTypes.client_number} form={form} />
                </div>
            </div>
        </FormPane>
    );
}
