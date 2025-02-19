import BlockKeyValueList from '../../../elements/block-key-value-list/BlockKeyValueList';
import IdentityRecordKeyValueListHistory from '../elements/IdentityRecordKeyValueListHistory';
import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { ProfileRecords, ProfileRecordValues } from '../../../../../dashboard/props/models/Sponsor/SponsorIdentity';
import useFormBuilder from '../../../../../dashboard/hooks/useFormBuilder';
import Profile from '../../../../../dashboard/props/models/Profile';
import { useProfileService } from '../../../../../dashboard/services/ProfileService';
import { ResponseError } from '../../../../../dashboard/props/ApiResponses';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import usePushDanger from '../../../../../dashboard/hooks/usePushDanger';
import usePushSuccess from '../../../../../dashboard/hooks/usePushSuccess';
import FormError from '../../../../../dashboard/components/elements/forms/errors/FormError';
import BlockInfoBox from '../../../elements/block-info-box/BlockInfoBox';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import TranslateHtml from '../../../../../dashboard/components/elements/translate-html/TranslateHtml';
import { getStateRouteUrl } from '../../../../modules/state_router/Router';

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

    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const profileService = useProfileService();

    const other_emails = useMemo(() => {
        return profile?.email_verified ? profile?.email_verified : [];
    }, [profile?.email_verified]);

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
                    <h2 className="card-title flex flex-grow">{translate('profile.contacts.title')}</h2>
                </div>

                <div className="card-section">
                    <div className="col col-sm-12 col-lg-8 col-md-10">
                        <div className="form-group">
                            <label className="form-label">{translate('profile.contacts.primary_email')}</label>
                            <input className="form-control" disabled={true} value={profile.email} />
                        </div>

                        {profile?.email_verified?.map((email, index) => (
                            <div className="form-group" key={index}>
                                <label className="form-label">
                                    {translate('profile.contacts.extra_email', { number: index + 1 })}
                                </label>
                                <input className="form-control" disabled={true} value={email} />
                            </div>
                        ))}

                        <div className="form-group">
                            <BlockInfoBox>
                                <TranslateHtml
                                    i18n={'profile.contacts.extra_email_info'}
                                    values={{ link_url: getStateRouteUrl('identity-emails') }}
                                />
                            </BlockInfoBox>
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
                            setEditContacts(false);
                            initFormValues();
                        }}>
                        {translate('profile.contacts.cancel')}
                    </button>
                    <div className="flex-grow" />
                    <button type={'submit'} className="button button-primary button-sm">
                        {translate('profile.contacts.save')}
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="card">
            <div className="card-header flex">
                <h2 className="card-title flex flex-grow">{translate('profile.contacts.title')}</h2>
                <div className="button-group">
                    <button
                        className="button button-text button-xs hide-sm"
                        onClick={() => {
                            initFormValues();
                            setEditContacts(true);
                        }}>
                        <em className="mdi mdi-pencil-outline" />
                        {translate('profile.contacts.edit')}
                    </button>
                </div>
            </div>

            <div className="card-section">
                <div className={'flex flex-vertical flex-gap-lg'}>
                    <BlockKeyValueList
                        items={[
                            {
                                label: translate('profile.contacts.primary_email'),
                                value: profile.email,
                            },
                            ...other_emails.map((email, index) => ({
                                label: translate('profile.contacts.extra_email', { number: index + 1 }),
                                value: email,
                            })),
                            {
                                label: recordTypesByKey?.telephone?.name,
                                value: <IdentityRecordKeyValueListHistory records={profile.records.telephone} />,
                            },
                            {
                                label: recordTypesByKey?.mobile?.name,
                                value: <IdentityRecordKeyValueListHistory records={profile.records.mobile} />,
                            },
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
                            setEditContacts(true);
                        }}>
                        <span className="flex flex-center">
                            <em className="mdi mdi-pencil-outline" />
                            {translate('profile.contacts.edit')}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
