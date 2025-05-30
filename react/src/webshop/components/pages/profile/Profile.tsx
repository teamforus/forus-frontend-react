import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import BlockKeyValueList from '../../elements/block-key-value-list/BlockKeyValueList';
import RecordType from '../../../../dashboard/props/models/RecordType';
import ProfileModel from '../../../../dashboard/props/models/Profile';
import { ProfileRecords, ProfileRecordTypes } from '../../../../dashboard/props/models/Sponsor/SponsorIdentity';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { useRecordTypeService } from '../../../../dashboard/services/RecordTypeService';
import IdentityRecordKeyValueListHistory from './elements/IdentityRecordKeyValueListHistory';
import IdentityContactInformationCard from './cards/IdentityContactInformationCard';
import { useProfileService } from '../../../../dashboard/services/ProfileService';
import { differenceInYears } from 'date-fns';
import { dateParse } from '../../../../dashboard/helpers/dates';
import IdentityAddressCard from './cards/IdentityAddressCard';

export default function Profile() {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const [profile, setProfile] = useState<ProfileModel>(null);

    const recordTypeService = useRecordTypeService();
    const profileService = useProfileService();

    const [recordTypes, setRecordTypes] = useState<Array<RecordType>>(null);

    const fetchProfile = useCallback(() => {
        profileService.profile().then((res) => setProfile(res.data));
    }, [profileService]);

    const recordTypesByKey = useMemo(() => {
        return recordTypes?.reduce((map, recordType) => {
            return { ...map, [recordType.key]: recordType };
        }, {}) as ProfileRecords;
    }, [recordTypes]);

    const identityCalculatedAge = useMemo(() => {
        return profile?.records?.birth_date?.[0]?.value
            ? Math.max(differenceInYears(new Date(), dateParse(profile?.records?.birth_date?.[0]?.value)), 0)
            : null;
    }, [profile?.records?.birth_date]);

    const fetchRecordTypes = useCallback(() => {
        setProgress(0);

        recordTypeService
            .list<RecordType & { key: ProfileRecordTypes }>()
            .then((res) => setRecordTypes(res.data))
            .finally(() => setProgress(100));
    }, [recordTypeService, setProgress]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return (
        <BlockShowcaseProfile
            breadcrumbItems={[
                { name: translate('profile.breadcrumbs.home'), state: 'home' },
                { name: translate('profile.breadcrumbs.profile') },
            ]}
            profileHeader={
                <div className="profile-content-header clearfix">
                    <div className="profile-content-title">
                        <h1 className="profile-content-header">{translate('profile.title')}</h1>
                    </div>
                </div>
            }>
            {profile && (
                <Fragment>
                    <div className="card">
                        <div className="card-header flex">
                            <h2 className="card-title flex flex-grow">{translate('profile.personal.title')}</h2>
                        </div>
                        <div className="card-section">
                            <BlockKeyValueList
                                items={[
                                    {
                                        label: recordTypesByKey?.given_name?.name,
                                        value: (
                                            <IdentityRecordKeyValueListHistory records={profile.records.given_name} />
                                        ),
                                    },
                                    {
                                        label: recordTypesByKey?.family_name?.name,
                                        value: (
                                            <IdentityRecordKeyValueListHistory records={profile.records.family_name} />
                                        ),
                                    },
                                    {
                                        label: recordTypesByKey?.birth_date?.name,
                                        value: (
                                            <IdentityRecordKeyValueListHistory records={profile.records.birth_date} />
                                        ),
                                    },
                                    {
                                        label: translate('profile.personal.age'),
                                        value: identityCalculatedAge || '-',
                                    },
                                    {
                                        label: recordTypesByKey?.gender?.name,
                                        value: <IdentityRecordKeyValueListHistory records={profile.records.gender} />,
                                    },
                                    {
                                        label: recordTypesByKey?.marital_status?.name,
                                        value: (
                                            <IdentityRecordKeyValueListHistory
                                                records={profile.records.marital_status}
                                            />
                                        ),
                                    },
                                    { label: translate('profile.personal.bsn'), value: profile?.bsn },
                                    {
                                        label: recordTypesByKey?.client_number?.name,
                                        value: (
                                            <IdentityRecordKeyValueListHistory
                                                records={profile.records.client_number}
                                            />
                                        ),
                                    },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">{translate('profile.household.title')}</h2>
                        </div>
                        <div className="card-section">
                            <BlockKeyValueList
                                items={[
                                    {
                                        label: recordTypesByKey?.house_composition?.name,
                                        value: (
                                            <IdentityRecordKeyValueListHistory
                                                records={profile.records.house_composition}
                                            />
                                        ),
                                    },
                                    {
                                        label: recordTypesByKey?.living_arrangement?.name,
                                        value: (
                                            <IdentityRecordKeyValueListHistory
                                                records={profile.records.living_arrangement}
                                            />
                                        ),
                                    },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">{translate('profile.account.title')}</h2>
                        </div>
                        <div className="card-section">
                            <BlockKeyValueList
                                items={[
                                    {
                                        label: translate('profile.account.active_since'),
                                        value: profile?.created_at_locale,
                                    },
                                    {
                                        label: translate('profile.account.last_login'),
                                        value: profile?.last_login_at_locale,
                                    },
                                    {
                                        label: translate('profile.account.last_activity'),
                                        value: profile?.last_activity_at_locale,
                                    },
                                ]}
                            />
                        </div>
                    </div>

                    <IdentityContactInformationCard
                        profile={profile}
                        recordTypesByKey={recordTypesByKey}
                        setProfile={setProfile}
                    />

                    <IdentityAddressCard
                        profile={profile}
                        recordTypesByKey={recordTypesByKey}
                        setProfile={setProfile}
                    />

                    {profile?.bank_accounts?.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">{translate('profile.bank_accounts.title')}</h2>
                            </div>
                            <div className="card-section">
                                <div className="flex flex-vertical flex-gap">
                                    {profile?.bank_accounts?.map((bank_account, index) => (
                                        <div className="card-section-pane" key={index}>
                                            <BlockKeyValueList
                                                items={[
                                                    {
                                                        label: translate('profile.bank_accounts.iban'),
                                                        value: bank_account.iban,
                                                    },
                                                    {
                                                        label: translate('profile.bank_accounts.name'),
                                                        value: bank_account.name,
                                                    },
                                                ]}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </Fragment>
            )}
        </BlockShowcaseProfile>
    );
}
