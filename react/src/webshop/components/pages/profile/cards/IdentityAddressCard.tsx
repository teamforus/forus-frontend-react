import BlockKeyValueList from '../../../elements/block-key-value-list/BlockKeyValueList';
import IdentityRecordKeyValueListHistory from '../elements/IdentityRecordKeyValueListHistory';
import React, { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { ProfileRecords, ProfileRecordValues } from '../../../../../dashboard/props/models/Sponsor/SponsorIdentity';
import useFormBuilder from '../../../../../dashboard/hooks/useFormBuilder';
import Profile from '../../../../../dashboard/props/models/Profile';
import { useProfileService } from '../../../../../dashboard/services/ProfileService';
import { ResponseError } from '../../../../../dashboard/props/ApiResponses';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import usePushDanger from '../../../../../dashboard/hooks/usePushDanger';
import usePushSuccess from '../../../../../dashboard/hooks/usePushSuccess';
import FormError from '../../../../../dashboard/components/elements/forms/errors/FormError';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';

export default function IdentityAddressCard({
    profile,
    setProfile,
    recordTypesByKey,
}: {
    profile: Profile;
    setProfile?: Dispatch<SetStateAction<Profile>>;
    recordTypesByKey: ProfileRecords;
}) {
    const [fields] = useState(['city', 'street', 'house_number', 'house_number_addition', 'postal_code']);

    const [editAddress, setEditAddress] = useState(false);

    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const profileService = useProfileService();

    const form = useFormBuilder<Partial<ProfileRecordValues>>(
        {
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
                    setEditAddress(false);
                    pushSuccess(translate('push.success'), translate('push.profile.updated'));
                })
                .catch((err: ResponseError) => {
                    pushDanger(translate('push.error'), err.data.message);
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
            city: profile.records.city?.[0]?.value || '',
            street: profile.records.street?.[0]?.value || '',
            house_number: profile.records.house_number?.[0]?.value || '',
            house_number_addition: profile.records.house_number_addition?.[0]?.value || '',
            postal_code: profile.records.postal_code?.[0]?.value || '',
        });
    }, [
        formUpdate,
        profile.records.city,
        profile.records.street,
        profile.records.house_number,
        profile.records.house_number_addition,
        profile.records.postal_code,
    ]);

    if (editAddress) {
        return (
            <form className="card form form-compact form-compact-flat" onSubmit={form.submit}>
                <div className="card-header flex">
                    <h2 className="card-title flex flex-grow">{translate('profile.address.title')}</h2>
                </div>

                <div className="card-section">
                    <div className="col col-sm-12 col-lg-8 col-md-10">
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
                        <div className="form-group">
                            <label className="form-label">{recordTypesByKey?.neighborhood_name?.name}</label>
                            <input
                                className="form-control"
                                disabled={true}
                                value={profile.records.neighborhood_name?.[0]?.value || ''}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{recordTypesByKey?.municipality_name?.name}</label>
                            <input
                                className="form-control"
                                disabled={true}
                                value={profile.records.municipality_name?.[0]?.value || ''}
                            />
                        </div>
                    </div>
                </div>

                <div className="card-section flex flex-center">
                    <button
                        type={'button'}
                        className="button button-light button-sm"
                        onClick={() => {
                            setEditAddress(false);
                            initFormValues();
                        }}>
                        {translate('profile.address.cancel')}
                    </button>
                    <div className="flex-grow" />
                    <button type={'submit'} className="button button-primary button-sm">
                        {translate('profile.address.save')}
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="card">
            <div className="card-header flex">
                <h2 className="card-title flex flex-grow">{translate('profile.address.title')}</h2>
                <div className="button-group">
                    <button
                        className="button button-text button-xs hide-sm"
                        onClick={() => {
                            initFormValues();
                            setEditAddress(true);
                        }}>
                        <em className="mdi mdi-pencil-outline" />
                        {translate('profile.address.edit')}
                    </button>
                </div>
            </div>

            <div className="card-section">
                <div className={'flex flex-vertical flex-gap-lg'}>
                    <BlockKeyValueList
                        items={[
                            {
                                label: recordTypesByKey?.city?.name,
                                value: <IdentityRecordKeyValueListHistory records={profile.records.city} />,
                            },
                            {
                                label: recordTypesByKey?.street?.name,
                                value: <IdentityRecordKeyValueListHistory records={profile.records.street} />,
                            },
                            {
                                label: recordTypesByKey?.house_number?.name,
                                value: <IdentityRecordKeyValueListHistory records={profile.records.house_number} />,
                            },
                            {
                                label: recordTypesByKey?.house_number_addition?.name,
                                value: (
                                    <IdentityRecordKeyValueListHistory
                                        records={profile.records.house_number_addition}
                                    />
                                ),
                            },
                            {
                                label: recordTypesByKey?.postal_code?.name,
                                value: <IdentityRecordKeyValueListHistory records={profile.records.postal_code} />,
                            },
                            {
                                label: recordTypesByKey?.neighborhood_name?.name,
                                value: (
                                    <IdentityRecordKeyValueListHistory records={profile.records.neighborhood_name} />
                                ),
                            },
                            {
                                label: recordTypesByKey?.municipality_name?.name,
                                value: (
                                    <IdentityRecordKeyValueListHistory records={profile.records.municipality_name} />
                                ),
                            },
                        ]}
                    />

                    <button
                        className="button button-light button-wide button-xs show-sm"
                        onClick={() => {
                            initFormValues();
                            setEditAddress(true);
                        }}>
                        <span className="flex flex-center">
                            <em className="mdi mdi-pencil-outline" />
                            {translate('profile.address.edit')}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
