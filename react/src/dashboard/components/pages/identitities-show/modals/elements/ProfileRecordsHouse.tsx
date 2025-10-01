import FormBuilder from '../../../../../types/FormBuilder';
import React from 'react';
import FormPane from '../../../../elements/forms/elements/FormPane';
import RecordType from '../../../../../props/models/RecordType';
import { ProfileRecordType } from '../../../../../props/models/Sponsor/SponsorIdentity';
import ProfileRecordsField from './ProfileRecordsField';

export default function ProfileRecordsHouse({
    form,
    recordTypes,
}: {
    form: FormBuilder<Partial<{ [key in ProfileRecordType]: string }>>;
    recordTypes: Partial<{ [key in ProfileRecordType]: RecordType & { key: ProfileRecordType } }>;
}) {
    return (
        <FormPane title={'Huishouden'}>
            <ProfileRecordsField recordType={recordTypes.house_composition} form={form} />
            <ProfileRecordsField recordType={recordTypes.living_arrangement} form={form} />
        </FormPane>
    );
}
