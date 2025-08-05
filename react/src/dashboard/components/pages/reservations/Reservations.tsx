import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useSetProgress from '../../../hooks/useSetProgress';
import { PaginationData } from '../../../props/ApiResponses';
import useOpenModal from '../../../hooks/useOpenModal';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useProductReservationService from '../../../services/ProductReservationService';
import Reservation from '../../../props/models/Reservation';
import usePushSuccess from '../../../hooks/usePushSuccess';
import { useOrganizationService } from '../../../services/OrganizationService';
import ModalDangerZone from '../../modals/ModalDangerZone';
import { hasPermission } from '../../../helpers/utils';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import useUpdateActiveOrganization from '../../../hooks/useUpdateActiveOrganization';
import ModalReservationCreate from '../../modals/ModalReservationCreate';
import ModalReservationUpload from '../../modals/ModalReservationUpload';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import useTableToggles from '../../../hooks/useTableToggles';
import useReservationSelectedTableMeta from './hooks/useReservationSelectedTableMeta';
import EmptyValue from '../../elements/empty-value/EmptyValue';
import useReservationsTableActions from './hooks/useReservationsTableActions';
import ReservationsTable from './elements/ReservationsTable';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { createEnumParam, NumberParam, StringParam } from 'use-query-params';
import ReservationsTableFilters, { ReservationsTableFiltersProps } from './elements/ReservationsTableFilters';

export default function Reservations() {
    const identity = useAuthIdentity();
    const activeOrganization = useActiveOrganization();
    const updateActiveOrganization = useUpdateActiveOrganization();

    const openModal = useOpenModal();
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const paginatorService = usePaginatorService();
    const organizationService = useOrganizationService();
    const productReservationService = useProductReservationService();

    const [paginatorKey] = useState('reservations');

    const [loading, setLoading] = useState(true);
    const { selected, setSelected, toggleAll, toggle } = useTableToggles();

    const [reservations, setReservations] = useState<PaginationData<Reservation>>(null);

    const [activeReservations, setActiveReservations] = useState<PaginationData<Reservation>>(null);
    const [archivedReservations, setArchivedReservations] = useState<PaginationData<Reservation>>(null);

    const [shownReservationsType, setShownReservationType] = useState('active');
    const [acceptedByDefault, setAcceptByDefault] = useState(activeOrganization.reservations_auto_accept);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<ReservationsTableFiltersProps>(
        {
            q: '',
            state: null,
            from: null,
            to: null,
            fund_id: null,
            product_id: null,
            order_by: 'created_at',
            order_dir: 'desc',
            per_page: paginatorService.getPerPage(paginatorKey),
        },
        {
            queryParams: {
                q: StringParam,
                from: StringParam,
                to: StringParam,
                state: createEnumParam([
                    'waiting',
                    'pending',
                    'accepted',
                    'rejected',
                    'expired',
                    'canceled',
                    'canceled_by_client',
                    'canceled_by_sponsor',
                    'canceled_payment_expired',
                    'canceled_payment_canceled',
                    'canceled_payment_failed',
                ]),
                fund_id: NumberParam,
                product_id: NumberParam,
                per_page: NumberParam,
                order_by: StringParam,
                order_dir: StringParam,
                page: NumberParam,
            },
        },
    );

    const fetchReservations = useCallback(
        (query: object, archived = false) => {
            return productReservationService.list(activeOrganization.id, {
                ...query,
                archived: archived ? 1 : 0,
            });
        },
        [activeOrganization.id, productReservationService],
    );

    const fetchAllReservations = useCallback(() => {
        setSelected([]);
        setLoading(true);
        setProgress(0);

        Promise.all([
            fetchReservations(filterValuesActive).then((res) => setActiveReservations(res.data)),
            fetchReservations(filterValuesActive, true).then((res) => setArchivedReservations(res.data)),
        ]).finally(() => {
            setLoading(false);
            setProgress(100);
        });
    }, [fetchReservations, filterValuesActive, setProgress, setSelected]);

    const selectedMeta = useReservationSelectedTableMeta(reservations?.data || [], selected);

    const { acceptReservations, rejectReservations, archiveReservations, unarchiveReservations } =
        useReservationsTableActions(activeOrganization, fetchAllReservations);

    const toggleAcceptByDefault = useCallback(
        async (value: boolean) => {
            setAcceptByDefault(value);

            const onEnable = () => {
                organizationService
                    .updateAcceptReservations(activeOrganization.id, value)
                    .then((res) => {
                        updateActiveOrganization(res.data.data);
                        setAcceptByDefault(res.data.data.reservations_auto_accept);
                        pushSuccess('Opgeslagen!');
                    })
                    .catch(pushApiError);
            };

            const onDisable = () => {
                organizationService
                    .updateAcceptReservations(activeOrganization.id, value)
                    .then((res) => {
                        updateActiveOrganization(res.data.data);
                        setAcceptByDefault(res.data.data.reservations_auto_accept);
                        pushSuccess('Opgeslagen!');
                    })
                    .catch(pushApiError);
            };

            const onCancel = () => {
                organizationService.read(activeOrganization.id, value).then((res) => {
                    updateActiveOrganization(res.data.data);
                    setAcceptByDefault(res.data.data.reservations_auto_accept);
                });
            };

            if (!value) {
                return onDisable();
            }

            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title="Let op! Met deze instelling worden alle reserveringen direct geaccepteerd."
                    description_text={[
                        'Wilt u reserveringen automatisch accepteren? Ga dan akkoord met onderstaande voorwaarden:',
                        '',
                        '- Het product of de dienst kan worden geleverd.',
                        '- De transactie wordt na veertien dagen verwerkt.',
                        '- De transactie kan op verzoek van de klant binnen veertien dagen worden geannuleerd.',
                    ]}
                    confirmation="Ik ga akkoord met de voorwaarden."
                    buttonSubmit={{
                        text: 'Bevestigen',
                        onClick: () => {
                            onEnable();
                            modal.close();
                        },
                    }}
                    buttonCancel={{
                        text: 'Annuleren',
                        onClick: () => {
                            onCancel();
                            modal.close();
                        },
                    }}
                />
            ));
        },
        [activeOrganization, updateActiveOrganization, openModal, organizationService, pushApiError, pushSuccess],
    );

    const makeReservation = useCallback(() => {
        openModal((modal) => (
            <ModalReservationCreate
                modal={modal}
                organization={activeOrganization}
                onCreated={() => fetchAllReservations()}
            />
        ));
    }, [activeOrganization, fetchAllReservations, openModal]);

    const uploadReservations = useCallback(() => {
        openModal((modal) => (
            <ModalReservationUpload
                modal={modal}
                organization={activeOrganization}
                onCreated={() => fetchAllReservations()}
            />
        ));
    }, [activeOrganization, fetchAllReservations, openModal]);

    // Fetch active and archived reservations
    useEffect(() => {
        fetchAllReservations();
    }, [fetchAllReservations]);

    // Update reservations when active or archived reservations change
    useEffect(() => {
        if (!activeReservations || !archivedReservations) {
            return;
        }

        setReservations(shownReservationsType == 'active' ? activeReservations : archivedReservations);
    }, [activeReservations, archivedReservations, shownReservationsType]);

    if (!reservations) {
        return <LoadingCard />;
    }

    return (
        <div className="card" data-dusk="tableReservationContent">
            <div className="card-header">
                <div className="card-title flex flex-grow" data-dusk="reservationsTitle">
                    {translate('reservations.header.title')}

                    {!loading && selected.length > 0 && ` (${selected.length}/${reservations.data.length})`}
                    {!loading && selected.length == 0 && ` (${reservations.meta.total})`}
                </div>
                <div className="card-header-filters">
                    <div className="flex block block-inline-filters">
                        {selectedMeta?.selected.length > 0 ? (
                            <Fragment>
                                {selectedMeta?.selected_acceptable?.length > 0 && (
                                    <button
                                        type={'button'}
                                        className="button button-primary button-sm"
                                        onClick={() => acceptReservations(selectedMeta?.selected_acceptable)}>
                                        <em className="mdi mdi-check-all icon-start" />
                                        Accepteren
                                    </button>
                                )}
                                {selectedMeta?.selected_rejectable?.length > 0 && (
                                    <button
                                        type={'button'}
                                        className="button button-danger button-sm"
                                        onClick={() => rejectReservations(selectedMeta?.selected_rejectable)}>
                                        <em className="mdi mdi-close-box-multiple icon-start" />
                                        Afwijzen
                                    </button>
                                )}
                                {selectedMeta?.selected_archivable?.length > 0 && (
                                    <button
                                        type={'button'}
                                        className="button button-default button-sm"
                                        onClick={() => archiveReservations(selectedMeta?.selected_archivable)}>
                                        <em className="mdi mdi-archive-outline icon-start" />
                                        Archief
                                    </button>
                                )}
                                {selectedMeta?.selected_archived?.length > 0 && (
                                    <button
                                        type={'button'}
                                        className="button button-default button-sm"
                                        onClick={() => unarchiveReservations(selectedMeta?.selected_archived)}>
                                        <em className="mdi mdi-archive-arrow-up-outline icon-start" />
                                        Herstellen
                                    </button>
                                )}
                                {!selectedMeta.hasActions && (
                                    <EmptyValue>Geen gemeenschappelijke acties beschikbaar</EmptyValue>
                                )}
                            </Fragment>
                        ) : (
                            <Fragment>
                                {activeOrganization.reservations_enabled && (
                                    <div onClick={makeReservation} className="button button-primary button-sm">
                                        <em className="mdi mdi-plus-circle icon-start" />
                                        Aanmaken
                                    </div>
                                )}

                                {hasPermission(activeOrganization, 'manage_organization') && (
                                    <StateNavLink
                                        name="reservations-settings"
                                        params={{ organizationId: activeOrganization.id }}
                                        className="button button-primary button-sm">
                                        <em className="mdi mdi-cog icon-start" />
                                        Instellingen
                                    </StateNavLink>
                                )}

                                {activeOrganization.allow_batch_reservations && (
                                    <div className="button button-primary button-sm" onClick={uploadReservations}>
                                        <em className="mdi mdi-upload icon-start" />
                                        Upload bulkbestand
                                    </div>
                                )}

                                <div className="flex-col">
                                    <div className="block block-label-tabs pull-right">
                                        <div className="label-tab-set">
                                            <div
                                                className={`label-tab label-tab-sm ${
                                                    shownReservationsType == 'active' ? 'active' : ''
                                                }`}
                                                onClick={() => setShownReservationType('active')}>
                                                Lopend ({activeReservations.meta.total})
                                            </div>
                                            <div
                                                className={`label-tab label-tab-sm ${
                                                    shownReservationsType == 'archived' ? 'active' : ''
                                                }`}
                                                onClick={() => setShownReservationType('archived')}>
                                                Archief ({archivedReservations.meta.total})
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <ReservationsTableFilters
                                    reservations={reservations}
                                    filter={filter}
                                    filterValues={filterValuesActive}
                                    filterUpdate={filterUpdate}
                                    organization={activeOrganization}
                                />
                            </Fragment>
                        )}
                    </div>
                </div>
            </div>

            <ReservationsTable
                loading={loading}
                paginatorKey={paginatorKey}
                reservations={reservations}
                organization={activeOrganization}
                filter={filter}
                filterValues={filterValues}
                filterUpdate={filterUpdate}
                fetchReservations={fetchAllReservations}
                selected={selected}
                toggleAll={toggleAll}
                toggle={toggle}
                type={'provider'}>
                {activeOrganization.identity_address == identity.address && (
                    <div className="card-section form">
                        <div className="flex flex flex-end">
                            <label>
                                <div className="form-toggle flex">
                                    <input
                                        type="checkbox"
                                        id="accepted_by_default"
                                        checked={acceptedByDefault}
                                        onChange={(e) => toggleAcceptByDefault(e.target.checked)}
                                    />
                                    <div className="form-toggle-inner">
                                        <em className="mdi mdi-information-outline flex" />
                                        &nbsp;Reserveringen automatisch accepteren &nbsp;
                                        <div className="toggle-input">
                                            <div className="toggle-input-dot" role="button" />
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                )}
            </ReservationsTable>
        </div>
    );
}
