import FormBuilder from '../../../../../types/FormBuilder';
import React from 'react';
import FormPane from '../../../../elements/forms/elements/FormPane';
import RecordType from '../../../../../props/models/RecordType';
import { ProfileRecordType } from '../../../../../props/models/Sponsor/SponsorIdentity';
import ProfileRecordsField from './ProfileRecordsField';

export default function ProfileRecordsContacts({
    form,
    recordTypes,
}: {
    form: FormBuilder<Partial<{ [key in ProfileRecordType]: string }>>;
    recordTypes: Partial<{ [key in ProfileRecordType]: RecordType & { key: ProfileRecordType } }>;
}) {
    return (
        <FormPane title={'Accountgegevens'}>
            <ProfileRecordsField recordType={recordTypes.telephone} form={form} />
            <ProfileRecordsField recordType={recordTypes.mobile} form={form} />
        </FormPane>
    );
}
