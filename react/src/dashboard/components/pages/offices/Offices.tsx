import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useFilter from '../../../hooks/useFilter';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { NavLink, useNavigate } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { hasPermission } from '../../../helpers/utils';
import useAssetUrl from '../../../hooks/useAssetUrl';
import Office from '../../../props/models/Office';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import useOpenModal from '../../../hooks/useOpenModal';
import useOfficeService from '../../../services/OfficeService';
import OfficeSchedule from '../../../props/models/OfficeSchedule';
import ModalNotification from '../../modals/ModalNotification';
import ModalDangerZone from '../../modals/ModalDangerZone';
import useSetProgress from '../../../hooks/useSetProgress';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import { ResponseError } from '../../../props/ApiResponses';
import useTranslate from '../../../hooks/useTranslate';

interface OfficeLocal extends Office {
    scheduleByDay: { [key: string]: OfficeSchedule };
}

export default function Offices() {
    const assetUrl = useAssetUrl();
    const openModal = useOpenModal();
    const translate = useTranslate();
    const organization = useActiveOrganization();
    const navigate = useNavigate();

    const officeService = useOfficeService();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushDanger = usePushDanger();

    const [weekDays] = useState(officeService.scheduleWeekDays());
    const [offices, setOffices] = useState<Array<OfficeLocal>>(null);

    const filter = useFilter({
        q: '',
        per_page: 100,
    });

    const fetchOffices = useCallback(() => {
        setProgress(0);

        officeService
            .list(organization.id, filter.activeValues)
            .then((res) => {
                setOffices(
                    res.data.data.map((office) => ({
                        ...office,
                        scheduleByDay: office.schedule.reduce(
                            (item, schedule) => ({ ...item, ...{ [schedule.week_day]: schedule } }),
                            {},
                        ),
                    })),
                );
            })
            .finally(() => setProgress(100));
    }, [setProgress, officeService, organization.id, filter.activeValues]);

    const confirmDelete = useCallback(
        (office) => {
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    title={translate('offices.confirm_delete.title')}
                    description={translate('offices.confirm_delete.description')}
                    buttonSubmit={{
                        onClick: () => {
                            modal.close();
                            officeService
                                .destroy(office.organization_id, office.id)
                                .then(() => {
                                    fetchOffices();
                                    pushSuccess('Vestiging is verwijderd.');
                                })
                                .catch((err: ResponseError) => pushDanger(err.data.message));
                        },
                    }}
                    buttonCancel={{
                        onClick: () => modal.close(),
                    }}
                />
            ));
        },
        [fetchOffices, officeService, openModal, pushDanger, pushSuccess, translate],
    );

    const confirmHasEmployees = useCallback(() => {
        openModal((modal) => (
            <ModalDangerZone
                modal={modal}
                title={translate('offices.confirm_has_employees.title')}
                description_text={translate('offices.confirm_has_employees.description')}
                buttonCancel={{
                    text: translate('offices.confirm_has_employees.buttons.cancel'),
                    onClick: modal.close,
                }}
                buttonSubmit={{
                    type: 'primary',
                    text: translate('offices.confirm_has_employees.buttons.confirm'),
                    onClick: () => {
                        modal.close();
                        navigate(getStateRouteUrl('employees', { organizationId: organization.id }));
                    },
                }}
            />
        ));
    }, [organization.id, navigate, openModal, translate]);

    const deleteOffice = useCallback(
        (office: Office) => {
            if (!office.employees_count) {
                return confirmDelete(office);
            }

            return confirmHasEmployees();
        },
        [confirmDelete, confirmHasEmployees],
    );

    useEffect(() => {
        fetchOffices();
    }, [fetchOffices]);

    if (!offices) {
        return <LoadingCard />;
    }

    return (
        <>
            <div className="card">
                <div className="card-section">
                    <div className="card-section-actions">
                        {hasPermission(organization, 'manage_organization') && (
                            <NavLink
                                id="edit_office"
                                to={getStateRouteUrl('organizations-edit', { organizationId: organization.id })}
                                className="button button-default">
                                <em className="mdi mdi-pen icon-start" />
                                {translate('offices.buttons.adjust')}
                            </NavLink>
                        )}
                    </div>
                    <div className="card-block card-block-provider">
                        <div className="provider-img">
                            <img
                                src={
                                    organization.logo?.sizes.thumbnail ||
                                    assetUrl('/assets/img/placeholders/organization-thumbnail.png')
                                }
                                alt={''}
                            />
                        </div>
                        <div className="provider-details">
                            <NavLink
                                className="provider-title"
                                to={getStateRouteUrl('organizations-edit', { organizationId: organization.id })}>
                                {organization.name}
                            </NavLink>
                        </div>
                    </div>
                </div>
                <div className="card-section card-section-primary">
                    <div className="card-block card-block-keyvalue card-block-keyvalue-horizontal row">
                        <div className="keyvalue-item col-xs-12 col-sm-6 col-lg-4">
                            <div className="keyvalue-key">{translate('offices.labels.business_type')}</div>
                            <div className={`keyvalue-value ${!organization.business_type?.name ? 'text-muted' : ''}`}>
                                {organization.business_type?.name || 'Geen data'}
                            </div>
                        </div>
                        <div className="keyvalue-item col-xs-12 col-sm-6 col-lg-4">
                            <div className="keyvalue-key">{translate('offices.labels.mail')}</div>
                            <div
                                className={`keyvalue-value ${
                                    !organization.email ? 'text-muted' : 'text-primary-light'
                                }`}>
                                {organization.email || 'Geen data'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-section card-section-primary">
                    <div className="card-block card-block-keyvalue card-block-keyvalue-horizontal row">
                        <div className="keyvalue-item col-xs-12 col-sm-6 col-lg-4">
                            <div className="keyvalue-key">KVK</div>
                            <div className={`keyvalue-value ${!organization.kvk ? 'text-muted' : ''}`}>
                                {organization.kvk || 'Geen data'}
                            </div>
                        </div>
                        <div className="keyvalue-item col-xs-12 col-sm-6 col-lg-4">
                            <div className="keyvalue-key">BTW</div>
                            <div className={`keyvalue-value ${!organization.btw ? 'text-muted' : ''}`}>
                                {organization.btw || 'Geen data'}
                            </div>
                        </div>
                        <div className="keyvalue-item col-xs-12 col-sm-6 col-lg-4">
                            <div className="keyvalue-key">IBAN</div>
                            <div className={`keyvalue-value ${!organization.iban ? 'text-muted' : ''}`}>
                                {organization.iban || 'Geen data'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {offices && (
                <div className="card">
                    <div className="card-header card-header-next">
                        <div className="card-title flex flex-grow">
                            {translate('offices.labels.offices')} ({offices?.length})
                        </div>

                        <div className="card-header-filters">
                            <div className="block block-inline-filters">
                                <StateNavLink
                                    name={'offices-create'}
                                    params={{ organizationId: organization.id }}
                                    className="button button-primary">
                                    <em className="mdi mdi-plus-circle icon-start" />
                                    Voeg een nieuwe vestiging toe
                                </StateNavLink>

                                <div className="form">
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Zoeken"
                                            value={filter.values.q}
                                            onChange={(e) => filter.update({ q: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {offices?.map((office) => (
                <div className="card" key={office.id}>
                    <div className="card-section">
                        <div className="card-block card-block-provider">
                            <div className="provider-img">
                                <img
                                    src={
                                        office.photo?.sizes.thumbnail ||
                                        assetUrl('/assets/img/placeholders/office-thumbnail.png')
                                    }
                                    alt={''}
                                />
                            </div>
                            <div className="provider-details">
                                <NavLink
                                    className="provider-title"
                                    to={getStateRouteUrl('offices-edit', {
                                        id: office.id,
                                        organizationId: office.organization_id,
                                    })}>
                                    {office.address}
                                </NavLink>
                                <div className="provider-subtitle">{office.branch_name || 'Geen naam'}</div>
                            </div>
                            <div className="provider-actions">
                                <div className="button-group">
                                    <NavLink
                                        className="button button-default"
                                        to={getStateRouteUrl('offices-edit', {
                                            id: office.id,
                                            organizationId: office.organization_id,
                                        })}>
                                        <em className="mdi mdi-pen icon-start" />
                                        {translate('offices.buttons.adjust')}
                                    </NavLink>
                                    {offices.length > 1 && (
                                        <a className="button button-default" onClick={() => deleteOffice(office)}>
                                            <em className="mdi mdi-delete icon-start" />
                                            {translate('offices.buttons.delete')}
                                        </a>
                                    )}
                                    {office.lat && office.lon && (
                                        <a
                                            className="button button-primary"
                                            href={`https://www.google.com/maps/place/${office.lat},${office.lon}`}
                                            rel="noreferrer"
                                            target="_blank">
                                            <em className="mdi mdi-map-marker icon-start" />
                                            {translate('offices.buttons.map')}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="card-block card-block-listing">
                                <div className="listing-item col-xs-6 col-md-3 col-lg-2">
                                    <div className="listing-item-label">{translate('offices.labels.phone')}</div>
                                    <div className="listing-item-value">
                                        {office.phone ? (
                                            <strong>{office.phone}</strong>
                                        ) : (
                                            <span className="text-muted">{translate('offices.labels.none')}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="listing-item col-xs-6 col-md-3 col-lg-2">
                                    <div className="listing-item-label">
                                        {translate('offices.labels.branch_number')}
                                    </div>
                                    <div className="listing-item-value">
                                        {office.branch_number ? (
                                            <strong>{office.branch_number}</strong>
                                        ) : (
                                            <span className="text-muted">{translate('offices.labels.none')}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="listing-item col-xs-6 col-md-3 col-lg-2">
                                    <div className="listing-item-label">{translate('offices.labels.branch_id')}</div>
                                    <div className="listing-item-value">
                                        {office.branch_id ? (
                                            <strong>{office.branch_id}</strong>
                                        ) : (
                                            <span className="text-muted">{translate('offices.labels.none')}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {office.schedule.length != 0 && (
                        <div className="card-section card-section-primary">
                            <div className="card-block card-block-schedule">
                                <div className="card-block-schedule-title">{translate('offices.labels.hours')}</div>
                                <div className="card-block-schedule-list">
                                    <div className="card-block card-block-listing">
                                        {Object.keys(weekDays)?.map((weekDayKey) => (
                                            <div
                                                key={weekDayKey}
                                                style={{
                                                    display:
                                                        !office.scheduleByDay[weekDayKey]?.start_time &&
                                                        !office.scheduleByDay[weekDayKey]?.end_time
                                                            ? 'none'
                                                            : undefined,
                                                }}
                                                className="listing-item">
                                                <div className="listing-item-label">{weekDays[weekDayKey]}</div>
                                                <div className="listing-item-value">
                                                    {office.scheduleByDay[weekDayKey]?.start_time || 'Geen data'}
                                                    {' - '}
                                                    {office.scheduleByDay[weekDayKey]?.end_time || 'Geen data'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {!offices?.length && (
                <EmptyCard
                    description={'Je hebt momenteel geen vestigingen.'}
                    button={{
                        text: 'Vestiging toevoegen',
                        to: getStateRouteUrl('offices-create', { organizationId: organization.id }),
                    }}
                />
            )}
        </>
    );
}
