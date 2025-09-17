import React, { useCallback, useEffect, useState } from 'react';
import PhotoSelector from '../../../elements/photo-selector/PhotoSelector';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import FormError from '../../../elements/forms/errors/FormError';
import { NavLink } from 'react-router';
import { getStateRouteUrl, useNavigateState } from '../../../../modules/state_router/Router';
import { useMediaService } from '../../../../services/MediaService';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import useSetProgress from '../../../../hooks/useSetProgress';
import ScheduleControl from './ScheduleControl';
import useOfficeService from '../../../../services/OfficeService';
import Office from '../../../../props/models/Office';
import Organization from '../../../../props/models/Organization';
import OfficeSchedule from '../../../../props/models/OfficeSchedule';
import { ResponseError } from '../../../../props/ApiResponses';
import Media from '../../../../props/models/Media';
import useTranslate from '../../../../hooks/useTranslate';
import usePushApiError from '../../../../hooks/usePushApiError';

export default function OfficesForm({ organization, id }: { organization: Organization; id?: number }) {
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();

    const mediaService = useMediaService();
    const officeService = useOfficeService();

    const [office, setOffice] = useState<Office>(null);
    const [media, setMedia] = useState<Media>(null);
    const [mediaFile, setMediaFile] = useState<Blob>(null);

    const [showBranchNameTooltip, setShowBranchNameTooltip] = useState<boolean>(false);
    const [showBranchIdTooltip, setShowBranchIdTooltip] = useState<boolean>(false);
    const [showBranchNumberTooltip, setShowBranchNumberTooltip] = useState<boolean>(false);

    const fetchOffice = useCallback(
        (id: number) => {
            setProgress(0);

            officeService
                .read(organization.id, id)
                .then((res) => setOffice(res.data.data))
                .finally(() => setProgress(100));
        },
        [officeService, organization, setProgress],
    );

    const uploadMedia = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!mediaFile) {
                return resolve(media?.uid);
            }

            setProgress(0);

            return mediaService
                .store('office_photo', mediaFile)
                .then((res) => {
                    setMedia(res.data.data);
                    setMediaFile(null);
                    resolve(res.data.data.uid);
                }, reject)
                .finally(() => setProgress(100));
        });
    }, [media, mediaFile, mediaService, setProgress]);

    const form = useFormBuilder<{
        address?: string;
        phone?: string;
        branch_number?: string;
        branch_name?: string;
        branch_id?: string;
        schedule?: Array<OfficeSchedule>;
    }>(null, (values) => {
        uploadMedia().then((media_uid: string) => {
            setProgress(0);

            const promise = office
                ? officeService.update(office.organization_id, office.id, { ...values, media_uid })
                : officeService.store(organization.id, { ...values, media_uid });

            promise
                .then(() => {
                    navigateState('offices', { organizationId: organization.id });
                    pushSuccess('Gelukt!');
                })
                .catch((err: ResponseError) => {
                    form.setIsLocked(false);
                    form.setErrors(err.data.errors);
                    pushApiError(err);
                })
                .finally(() => setProgress(100));
        });
    });

    const { update: updateForm } = form;

    const onScheduleChange = useCallback(
        (schedule: OfficeSchedule[]) => {
            updateForm({ schedule: schedule });
        },
        [updateForm],
    );

    useEffect(() => {
        if (office) {
            updateForm({ ...officeService.apiResourceToForm(office) });
        }
    }, [updateForm, office, officeService]);

    useEffect(() => {
        if (id) {
            fetchOffice(id);
        }
    }, [id, fetchOffice]);

    if (!organization || (id && !office)) {
        return <LoadingCard />;
    }

    return (
        <form className="card form" onSubmit={form.submit}>
            <div className="card-header">
                <div className="card-title">
                    {translate(id ? 'offices_edit.header.title_edit' : 'offices_edit.header.title_add')}
                </div>
            </div>

            <div className="card-section card-section-primary">
                <div className="row">
                    <div className="col col-md-8 col-md-offset-2 col-xs-12">
                        <div className="form-group">
                            <label className="form-label">&nbsp;</label>

                            <PhotoSelector
                                type="office_photo"
                                thumbnail={office?.photo?.sizes?.thumbnail}
                                selectPhoto={(file) => setMediaFile(file)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-section card-section-primary">
                <div className="row">
                    <div className="col col-md-8 col-md-offset-2 col-xs-12">
                        <div className="form-group">
                            <label className="form-label form-label-required">
                                {translate('offices_edit.labels.address')}
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder={translate('offices_edit.labels.address')}
                                value={form.values?.address || ''}
                                onChange={(e) => form.update({ address: e.target.value })}
                                autoComplete="street-address"
                            />
                            <FormError error={form.errors?.address} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{translate('offices_edit.labels.phone')}</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder={translate('offices_edit.labels.phone')}
                                value={form.values?.phone || ''}
                                onChange={(e) => form.update({ phone: e.target.value })}
                                autoComplete="tel"
                            />
                            <FormError error={form.errors?.address} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-section card-section-primary">
                <div className="row">
                    <div className="col col-md-8 col-md-offset-2 col-xs-12">
                        <div className="form-group">
                            <label className="form-label">{translate('offices_edit.labels.branch_number')}</label>
                            <div className="form-group-info">
                                <div className="form-group-info-control">
                                    <input
                                        className="form-control"
                                        placeholder={translate('offices_edit.labels.branch_number')}
                                        value={form.values?.branch_number || ''}
                                        onChange={(e) => form.update({ branch_number: e.target.value })}
                                    />

                                    <div className="form-group-info-button">
                                        <div
                                            className={`button button-default button-icon pull-left ${
                                                showBranchNumberTooltip ? 'active' : ''
                                            }`}
                                            onClick={() => setShowBranchNumberTooltip(!showBranchNumberTooltip)}>
                                            <em className="mdi mdi-information" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <FormError error={form.errors?.branch_number} />
                        </div>

                        {showBranchNumberTooltip && (
                            <div className="form-group">
                                <div className="block block-info">
                                    <em className="mdi mdi-information block-info-icon" />
                                    {translate('offices_edit.info.branch_number')}
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">{translate('offices_edit.labels.branch_name')}</label>
                            <div className="form-group-info">
                                <div className="form-group-info-control">
                                    <input
                                        type="text"
                                        className="form-control"
                                        minLength={3}
                                        maxLength={100}
                                        placeholder={translate('offices_edit.labels.branch_name')}
                                        value={form.values?.branch_name || ''}
                                        onChange={(e) => form.update({ branch_name: e.target.value })}
                                    />

                                    <div className="form-group-info-button">
                                        <div
                                            className={`button button-default button-icon pull-left ${
                                                showBranchNameTooltip ? 'active' : ''
                                            }`}
                                            onClick={() => setShowBranchNameTooltip(!showBranchNameTooltip)}>
                                            <em className="mdi mdi-information" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <FormError error={form.errors?.branch_name} />
                        </div>

                        {showBranchNameTooltip && (
                            <div className="form-group">
                                <div className="block block-info">
                                    <em className="mdi mdi-information block-info-icon" />
                                    {translate('offices_edit.info.branch_name')}
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">{translate('offices_edit.labels.branch_id')}</label>
                            <div className="form-group-info">
                                <div className="form-group-info-control">
                                    <input
                                        type="text"
                                        className="form-control"
                                        minLength={3}
                                        maxLength={20}
                                        placeholder={translate('offices_edit.labels.branch_id')}
                                        value={form.values?.branch_id || ''}
                                        onChange={(e) => form.update({ branch_id: e.target.value })}
                                    />

                                    <div className="form-group-info-button">
                                        <div
                                            className={`button button-default button-icon pull-left ${
                                                showBranchIdTooltip ? 'active' : ''
                                            }`}
                                            onClick={() => setShowBranchIdTooltip(!showBranchIdTooltip)}>
                                            <em className="mdi mdi-information" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <FormError error={form.errors?.branch_id} />
                        </div>

                        {showBranchIdTooltip && (
                            <div className="form-group">
                                <div className="block block-info">
                                    <em className="mdi mdi-information block-info-icon" />
                                    {translate('offices_edit.info.branch_id')}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card-section card-section-primary">
                <div className="row">
                    <div className="col col-md-8 col-md-offset-2 col-xs-12">
                        <div className="form-group">
                            <label className="form-label">&nbsp;</label>

                            {(form.values || !id) && (
                                <ScheduleControl
                                    schedule={form.values?.schedule || []}
                                    onChange={onScheduleChange}
                                    errors={form.errors}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-section card-section-primary">
                <div className="text-center">
                    <NavLink
                        id="cancel"
                        to={getStateRouteUrl('offices', { organizationId: organization.id })}
                        type="button"
                        className="button button-default">
                        {translate('offices_edit.buttons.cancel')}
                    </NavLink>

                    <button type="submit" className="button button-primary">
                        {translate('offices_edit.buttons.confirm')}
                    </button>
                </div>
            </div>
        </form>
    );
}
