import FormBuilder from '../../../../../types/FormBuilder';
import React from 'react';
import FormPane from '../../../../elements/forms/elements/FormPane';
import ProfileRecordsField from '../../../identitities-show/modals/elements/ProfileRecordsField';

export default function HouseholdAddress({
    form,
}: {
    form: FormBuilder<
        Partial<{
            city: string;
            street: string;
            house_nr: string;
            house_nr_addition: string;
            postal_code: string;
            neighborhood_name: string;
            municipality_name: string;
        }>
    >;
}) {
    return (
        <FormPane title={'Adresgegevens'}>
            <div className="row">
                <div className="col col-xs-12 col-sm-6">
                    <ProfileRecordsField recordType={{ key: 'city', name: 'Woonplaats' }} form={form} />
                </div>
                <div className="col col-xs-12 col-sm-6">
                    <ProfileRecordsField recordType={{ key: 'street', name: 'Straatnaam' }} form={form} />
                </div>
            </div>
            <div className="row">
                <div className="col col-xs-12 col-sm-6">
                    <ProfileRecordsField recordType={{ key: 'house_nr', name: 'Huisnummer' }} form={form} />
                </div>
                <div className="col col-xs-12 col-sm-6">
                    <ProfileRecordsField
                        recordType={{ key: 'house_nr_addition', name: 'Huisnummer toevoeging' }}
                        form={form}
                    />
                </div>
            </div>
            <div className="row">
                <div className="col col-xs-12 col-sm-6">
                    <ProfileRecordsField recordType={{ key: 'postal_code', name: 'Postcode' }} form={form} />
                </div>
                <div className="col col-xs-12 col-sm-6">
                    <ProfileRecordsField recordType={{ key: 'neighborhood_name', name: 'Woonwijk' }} form={form} />
                </div>
            </div>
            <div className="row">
                <div className="col col-xs-12 col-sm-12">
                    <ProfileRecordsField recordType={{ key: 'municipality_name', name: 'Gemeentenaam' }} form={form} />
                </div>
            </div>
        </FormPane>
    );
}
