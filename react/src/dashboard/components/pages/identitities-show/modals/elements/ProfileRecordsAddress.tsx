import FormBuilder from '../../../../../types/FormBuilder';
import React from 'react';
import FormPane from '../../../../elements/forms/elements/FormPane';
import RecordType from '../../../../../props/models/RecordType';
import { ProfileRecordType } from '../../../../../props/models/Sponsor/SponsorIdentity';
import ProfileRecordsField from './ProfileRecordsField';

export default function ProfileRecordsAddress({
    form,
    recordTypes,
}: {
    form: FormBuilder<Partial<{ [key in ProfileRecordType]: string }>>;
    recordTypes: Partial<{ [key in ProfileRecordType]: RecordType & { key: ProfileRecordType } }>;
}) {
    return (
        <FormPane title={'Adresgegevens'}>
            <div className="row">
                <div className="col col-xs-12 col-sm-6">
                    <ProfileRecordsField recordType={recordTypes.city} form={form} />
                </div>
                <div className="col col-xs-12 col-sm-6">
                    <ProfileRecordsField recordType={recordTypes.street} form={form} />
                </div>
            </div>
            <div className="row">
                <div className="col col-xs-12 col-sm-6">
                    <ProfileRecordsField recordType={recordTypes.house_number} form={form} />
                </div>
                <div className="col col-xs-12 col-sm-6">
                    <ProfileRecordsField recordType={recordTypes.house_number_addition} form={form} />
                </div>
            </div>
            <div className="row">
                <div className="col col-xs-12 col-sm-6">
                    <ProfileRecordsField recordType={recordTypes.postal_code} form={form} />
                </div>
                <div className="col col-xs-12 col-sm-6">
                    <ProfileRecordsField recordType={recordTypes.neighborhood_name} form={form} />
                </div>
            </div>
            <div className="row">
                <div className="col col-xs-12 col-sm-12">
                    <ProfileRecordsField recordType={recordTypes.municipality_name} form={form} />
                </div>
            </div>
        </FormPane>
    );
}
