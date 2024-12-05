import BlockKeyValueList from '../../../elements/block-key-value-list/BlockKeyValueList';
import IdentityRecordKeyValueListItemWithHistory from '../elements/IdentityRecordKeyValueListItemWithHistory';
import React, { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { ProfileRecords, ProfileRecordValues } from '../../../../../dashboard/props/models/Sponsor/SponsorIdentity';
import useFormBuilder from '../../../../../dashboard/hooks/useFormBuilder';
import Profile from '../../../../../dashboard/props/models/Profile';
import { useProfileService } from '../../../../../dashboard/services/ProfileService';
import { ResponseError } from '../../../../../dashboard/props/ApiResponses';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import usePushDanger from '../../../../../dashboard/hooks/usePushDanger';
import usePushSuccess from '../../../../../dashboard/hooks/usePushSuccess';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import FormError from '../../../../../dashboard/components/elements/forms/errors/FormError';

export default function IdentityContactInformationCard({
    profile,
    setProfile,
    recordTypesByKey,
}: {
    profile: Profile;
    setProfile?: Dispatch<SetStateAction<Profile>>;
    recordTypesByKey: ProfileRecords;
}) {
    const [fields] = useState([
        'telephone',
        'mobile',
        'city',
        'street',
        'house_number',
        'house_number_addition',
        'postal_code',
    ]);

    const [editContacts, setEditContacts] = useState(false);

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const profileService = useProfileService();

    const form = useFormBuilder<Partial<ProfileRecordValues>>(
        {
            telephone: '',
            mobile: '',
            city: '',
            street: '',
            house_number: '',
            house_number_addition: '',
            postal_code: '',
        },
        (values) => {
            setProgress(0);

            profileService
                .update(values)
                .then((res) => {
                    setProfile(res.data);
                    setEditContacts(false);
                    pushSuccess('Gelukt!', 'Contact information updated.');
                })
                .catch((err: ResponseError) => {
                    pushDanger('Error!', err.data.message);
                    form.setErrors(err.data.errors);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    const { update: formUpdate } = form;

    const initFormValues = useCallback(() => {
        formUpdate({
            telephone: profile.records.telephone?.[0]?.value || '',
            mobile: profile.records.mobile?.[0]?.value || '',
            city: profile.records.city?.[0]?.value || '',
            street: profile.records.street?.[0]?.value || '',
            house_number: profile.records.house_number?.[0]?.value || '',
            house_number_addition: profile.records.house_number_addition?.[0]?.value || '',
            postal_code: profile.records.postal_code?.[0]?.value || '',
        });
    }, [
        formUpdate,
        profile.records.city,
        profile.records.mobile,
        profile.records.street,
        profile.records.telephone,
        profile.records.house_number,
        profile.records.house_number_addition,
        profile.records.postal_code,
    ]);

    if (editContacts) {
        return (
            <form className="card form form-compact form-compact-flat" onSubmit={form.submit}>
                <div className="card-header flex">
                    <h2 className="card-title flex flex-grow">Contactgegevens aanpassen</h2>
                </div>

                <div className="card-section">
                    <div className="col col-sm-12 col-lg-8 col-md-10">
                        <div className="form-group">
                            <label className="form-label">Hoofd e-mailadres</label>
                            <input className="form-control" disabled={true} value={profile.email} />
                            <div className="form-hint">
                                To change your emails please go to the{' '}
                                <StateNavLink
                                    name="identity-emails"
                                    className={'text-primary text-inherit'}
                                    target={'_blank'}>
                                    E-mail instellingen
                                </StateNavLink>{' '}
                                page.
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Tweede e-mailadres</label>
                            <input
                                className="form-control"
                                disabled={true}
                                value={profile?.email_verified?.join(', ') || '-'}
                            />
                            <div className="form-hint">
                                To change your emails please go to the{' '}
                                <StateNavLink
                                    name="identity-emails"
                                    className={'text-primary text-inherit'}
                                    target={'_blank'}>
                                    E-mail instellingen
                                </StateNavLink>{' '}
                                page.
                            </div>
                        </div>

                        {fields.map((field, index) => (
                            <div className="form-group" key={index}>
                                <label className="form-label">{recordTypesByKey?.[field]?.name}</label>
                                <input
                                    className="form-control"
                                    value={form?.values?.[field] || ''}
                                    onChange={(e) => form.update({ [field]: e.target.value })}
                                />
                                <FormError error={form.errors?.[field]} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card-section flex flex-center">
                    <button
                        type={'button'}
                        className="button button-light button-sm"
                        onClick={() => {
                            setEditContacts(false);
                            initFormValues();
                        }}>
                        Annuleren
                    </button>
                    <button type={'submit'} className="button button-primary button-sm">
                        Opslaan
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="card">
            <div className="card-header flex">
                <h2 className="card-title flex flex-grow">Contactgegevens</h2>
                <div className="button-group">
                    <div
                        className="button button-text button-xs"
                        onClick={() => {
                            initFormValues();
                            setEditContacts(true);
                        }}>
                        <em className="mdi mdi-pencil-outline" />
                        Bewerken
                    </div>
                </div>
            </div>

            <div className="card-section">
                <BlockKeyValueList
                    items={[
                        {
                            label: 'Hoofd e-mailadres',
                            value: profile.email,
                        },
                        {
                            label: 'Tweede e-mailadres',
                            value: profile?.email_verified?.join(', '),
                        },
                        {
                            label: recordTypesByKey?.telephone?.name,
                            value: <IdentityRecordKeyValueListItemWithHistory records={profile.records.telephone} />,
                        },
                        {
                            label: recordTypesByKey?.mobile?.name,
                            value: <IdentityRecordKeyValueListItemWithHistory records={profile.records.mobile} />,
                        },
                        {
                            label: recordTypesByKey?.city?.name,
                            value: <IdentityRecordKeyValueListItemWithHistory records={profile.records.city} />,
                        },
                        {
                            label: recordTypesByKey?.street?.name,
                            value: <IdentityRecordKeyValueListItemWithHistory records={profile.records.street} />,
                        },
                        {
                            label: recordTypesByKey?.house_number?.name,
                            value: <IdentityRecordKeyValueListItemWithHistory records={profile.records.house_number} />,
                        },
                        {
                            label: recordTypesByKey?.house_number_addition?.name,
                            value: (
                                <IdentityRecordKeyValueListItemWithHistory
                                    records={profile.records.house_number_addition}
                                />
                            ),
                        },
                        {
                            label: recordTypesByKey?.postal_code?.name,
                            value: <IdentityRecordKeyValueListItemWithHistory records={profile.records.postal_code} />,
                        },
                    ]}
                />
            </div>
        </div>
    );
}
