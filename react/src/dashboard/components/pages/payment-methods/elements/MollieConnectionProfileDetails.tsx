import React, { Fragment, useCallback, useEffect, useState } from 'react';
import MollieConnection from '../../../../props/models/MollieConnection';
import KeyValueItem from '../../../elements/key-value/KeyValueItem';
import MollieConnectionProfileSelector from './MollieConnectionProfileSelector';
import FormError from '../../../elements/forms/errors/FormError';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import { ResponseError, ResponseErrorThrottled } from '../../../../props/ApiResponses';
import MollieConnectionProfile from '../../../../props/models/MollieConnectionProfile';
import useMollieConnectionService from '../../../../services/MollieConnectionService';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import Organization from '../../../../props/models/Organization';
import useTranslate from '../../../../hooks/useTranslate';
import InfoBox from '../../../elements/info-box/InfoBox';

export default function MollieConnectionProfileDetails({
    onChange,
    organization,
    onResponseError,
    mollieConnection,
}: {
    onChange: (value: MollieConnection) => void;
    organization: Organization;
    onResponseError?: (err: ResponseError & ResponseErrorThrottled) => void;
    mollieConnection: MollieConnection;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();

    const mollieConnectionService = useMollieConnectionService();

    const [currentProfile, setCurrentProfile] = useState<MollieConnectionProfile>(null);
    const [currentProfileId, setCurrentProfileId] = useState<number>(null);

    const form = useFormBuilder(
        {
            name: '',
            email: '',
            phone: '',
            website: 'https://',
        },
        (values) => {
            setProgress(0);

            const promise = mollieConnection.profile_pending
                ? mollieConnectionService.updateProfile(organization.id, mollieConnection.profile_pending.id, values)
                : mollieConnectionService.storeProfile(organization.id, values);

            promise
                .then((res) => {
                    pushSuccess('Opgeslagen!');
                    onChange(res.data.data);
                })
                .catch((err: ResponseError & ResponseErrorThrottled) => {
                    form.setIsLocked(false);
                    form.setErrors(
                        [429, 503].includes(err.status) ? { throttle: [err.data.message] } : err.data.errors,
                    );

                    onResponseError?.(err);
                })
                .finally(() => setProgress(100));
        },
    );

    const { update: updateProfileForm } = form;

    const updateCurrentProfile = useCallback(
        (profileId: number) => {
            setProgress(0);

            mollieConnectionService
                .update(organization.id, { mollie_connection_profile_id: profileId })
                .then((res) => onChange(res.data.data))
                .catch((err: ResponseError & ResponseErrorThrottled) => onResponseError?.(err))
                .finally(() => setProgress(100));
        },
        [setProgress, mollieConnectionService, organization.id, onChange, onResponseError],
    );

    useEffect(() => {
        if (mollieConnection) {
            const profile = mollieConnection.profiles.find((profile) => profile.current);

            setCurrentProfile(profile);
            setCurrentProfileId(profile?.id);

            if (!mollieConnection.profile_active && mollieConnection.profile_pending) {
                updateProfileForm(mollieConnection.profile_pending);
            }
        }
    }, [mollieConnection, mollieConnectionService, updateProfileForm]);

    return (
        <Fragment>
            {mollieConnection.profile_active ? (
                <div className="card">
                    <div className="card-header">
                        <div className="flex flex-grow card-title">
                            {translate('mollie_connection.titles.current_profile_information')}
                        </div>
                        <div className="card-header-filters">
                            <div className="block block-inline-filters">
                                {mollieConnection.profiles.length && (
                                    <MollieConnectionProfileSelector
                                        profiles={mollieConnection.profiles}
                                        currentProfile={currentProfile}
                                        currentProfileId={currentProfileId}
                                        onSelect={(currentProfileId) => setCurrentProfileId(currentProfileId)}
                                        onChange={() => updateCurrentProfile(currentProfileId)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card-section">
                        <div className="card-block card-block-keyvalue">
                            <KeyValueItem label={translate('mollie_connection.labels.name')}>
                                {mollieConnection.profile_active.name}
                            </KeyValueItem>

                            <KeyValueItem label={translate('mollie_connection.labels.phone')}>
                                {mollieConnection.profile_active.phone}
                            </KeyValueItem>

                            <KeyValueItem label={translate('mollie_connection.labels.email')}>
                                {mollieConnection.profile_active.email}
                            </KeyValueItem>

                            <KeyValueItem label={translate('mollie_connection.labels.website')}>
                                {mollieConnection.profile_active.website}
                            </KeyValueItem>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <form className="form" onSubmit={form.submit}>
                        <div className="card-header">
                            <div className="flex flex-grow card-title">
                                {translate('mollie_connection.header_update_profile.title')}
                            </div>
                            <div className="card-header-filters">
                                <div className="block block-inline-filters">
                                    {mollieConnection.profiles.length > 0 && (
                                        <MollieConnectionProfileSelector
                                            profiles={mollieConnection.profiles}
                                            currentProfile={currentProfile}
                                            currentProfileId={currentProfileId}
                                            onSelect={(currentProfileId) => setCurrentProfileId(currentProfileId)}
                                            onChange={() => updateCurrentProfile(currentProfileId)}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="card-section card-section-primary">
                            <div className="form-group">
                                <div className="row">
                                    <div className="col col-lg-9 col-lg-12">
                                        <div className="form-group form-group-inline">
                                            <label className="form-label">&nbsp;</label>
                                            <div className="form-title">
                                                {translate('mollie_connection.titles.profile_information')}
                                            </div>
                                        </div>

                                        <div className="form-group form-group-inline">
                                            <label className="form-label">
                                                {translate('mollie_connection.labels.profile_name')}
                                            </label>
                                            <input
                                                className="form-control"
                                                onChange={(e) => form.update({ name: e.target.value })}
                                                value={form.values.name || ''}
                                                type="text"
                                                placeholder={translate('mollie_connection.labels.profile_name')}
                                            />
                                            <FormError error={form.errors.name} />
                                        </div>

                                        <div className="form-group form-group-inline">
                                            <label className="form-label">
                                                {translate('mollie_connection.labels.email')}
                                            </label>
                                            <input
                                                className="form-control"
                                                onChange={(e) => form.update({ email: e.target.value })}
                                                value={form.values.email || ''}
                                                type="text"
                                                placeholder={translate('mollie_connection.labels.email')}
                                            />
                                            <FormError error={form.errors.email} />
                                        </div>

                                        <div className="form-group form-group-inline">
                                            <label className="form-label">
                                                {translate('mollie_connection.labels.phone')}
                                            </label>
                                            <input
                                                className="form-control"
                                                onChange={(e) => form.update({ phone: e.target.value })}
                                                value={form.values.phone || ''}
                                                type="text"
                                                placeholder={translate('mollie_connection.labels.phone')}
                                            />
                                            <FormError error={form.errors.phone} />
                                        </div>

                                        <div className="form-group form-group-inline">
                                            <label className="form-label">
                                                {translate('mollie_connection.labels.website')}
                                            </label>
                                            <input
                                                className="form-control"
                                                onChange={(e) => form.update({ website: e.target.value })}
                                                value={form.values.website || ''}
                                                type="text"
                                                placeholder={translate('mollie_connection.labels.website')}
                                            />
                                            <FormError error={form.errors.website} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <InfoBox iconPosition={'top'} iconColor={'primary'}>
                                <p>{translate('mollie_connection.create_form.info_content')}</p>
                            </InfoBox>
                        </div>

                        <div className="card-section">
                            <div className="button-group flex-center">
                                <button className="button button-primary" type="submit">
                                    {translate('mollie_connection.buttons.submit')}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </Fragment>
    );
}
