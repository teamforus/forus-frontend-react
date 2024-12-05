import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import BlockKeyValueList from '../../elements/block-key-value-list/BlockKeyValueList';
import RecordType from '../../../../dashboard/props/models/RecordType';
import ProfileModel from '../../../../dashboard/props/models/Profile';
import { ProfileRecords, ProfileRecordTypes } from '../../../../dashboard/props/models/Sponsor/SponsorIdentity';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { useRecordTypeService } from '../../../../dashboard/services/RecordTypeService';
import IdentityRecordKeyValueListItemWithHistory from './elements/IdentityRecordKeyValueListItemWithHistory';
import IdentityContactInformationCard from './cards/IdentityContactInformationCard';
import { useProfileService } from '../../../../dashboard/services/ProfileService';

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
            breadcrumbItems={[{ name: 'Home', state: 'home' }, { name: translate('profile.title') }]}
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
                            <h2 className="card-title flex flex-grow">Persoonsgegevens</h2>
                        </div>
                        <div className="card-section">
                            <BlockKeyValueList
                                items={[
                                    {
                                        label: recordTypesByKey?.given_name?.name,
                                        value: (
                                            <IdentityRecordKeyValueListItemWithHistory
                                                records={profile.records.given_name}
                                            />
                                        ),
                                    },
                                    {
                                        label: recordTypesByKey?.family_name?.name,
                                        value: (
                                            <IdentityRecordKeyValueListItemWithHistory
                                                records={profile.records.family_name}
                                            />
                                        ),
                                    },
                                    {
                                        label: recordTypesByKey?.birth_date?.name,
                                        value: (
                                            <IdentityRecordKeyValueListItemWithHistory
                                                records={profile.records.birth_date}
                                            />
                                        ),
                                    },
                                    { label: 'BSN', value: profile?.bsn },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Accountgegevens</h2>
                        </div>
                        <div className="card-section">
                            <BlockKeyValueList
                                items={[
                                    { label: 'Actief sinds', value: profile?.created_at_locale },
                                    { label: 'Laatste inlog', value: profile?.last_activity_at_locale },
                                ]}
                            />
                        </div>
                    </div>

                    <IdentityContactInformationCard
                        profile={profile}
                        recordTypesByKey={recordTypesByKey}
                        setProfile={setProfile}
                    />

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Bankrekening</h2>
                        </div>
                        <div className="card-section">
                            <div className="flex flex-vertical flex-gap-xxl">
                                {profile?.bank_accounts?.map((bank_account, index) => (
                                    <div className="card-section-pane" key={index}>
                                        <BlockKeyValueList
                                            items={[
                                                { label: 'IBAN', value: bank_account.iban },
                                                { label: 'Tenaam stelling', value: bank_account.name },
                                            ]}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Fragment>
            )}
        </BlockShowcaseProfile>
    );
}
