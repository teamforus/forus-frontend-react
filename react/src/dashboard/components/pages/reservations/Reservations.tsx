import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useSetProgress from '../../../hooks/useSetProgress';
import useProductService from '../../../services/ProductService';
import Product from '../../../props/models/Product';
import { PaginationData } from '../../../props/ApiResponses';
import useFilter from '../../../hooks/useFilter';
import useOpenModal from '../../../hooks/useOpenModal';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import Paginator from '../../../modules/paginator/components/Paginator';
import useProductReservationService from '../../../services/ProductReservationService';
import Reservation from '../../../props/models/Reservation';
import usePushSuccess from '../../../hooks/usePushSuccess';
import { useOrganizationService } from '../../../services/OrganizationService';
import ModalDangerZone from '../../modals/ModalDangerZone';
import useProductReservationsExporter from '../../../services/exporters/useProductReservationsExporter';
import useProviderFundService from '../../../services/ProviderFundService';
import Fund from '../../../props/models/Fund';
import { hasPermission } from '../../../helpers/utils';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SelectControl from '../../elements/select-control/SelectControl';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import CardHeaderFilter from '../../elements/tables/elements/CardHeaderFilter';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import { strLimit } from '../../../helpers/string';
import { dateFormat, dateParse } from '../../../helpers/dates';
import useUpdateActiveOrganization from '../../../hooks/useUpdateActiveOrganization';
import ModalReservationCreate from '../../modals/ModalReservationCreate';
import ModalReservationUpload from '../../modals/ModalReservationUpload';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../hooks/useTranslate';
import useConfigurableTable from '../vouchers/hooks/useConfigurableTable';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import TableRowActions from '../../elements/tables/TableRowActions';
import usePushApiError from '../../../hooks/usePushApiError';
import BlockInlineCopy from '../../elements/block-inline-copy/BlockInlineCopy';
import classNames from 'classnames';
import ReservationLabel from './elements/ReservationLabel';
import TableCheckboxControl from '../../elements/tables/elements/TableCheckboxControl';
import useTableToggles from '../../../hooks/useTableToggles';
import useReservationSelectedTableMeta from './hooks/useReservationSelectedTableMeta';
import EmptyValue from '../../elements/empty-value/EmptyValue';
import useReservationsTableActions from './hooks/useReservationsTableActions';

export default function Reservations() {
    const identity = useAuthIdentity();
    const activeOrganization = useActiveOrganization();
    const updateActiveOrganization = useUpdateActiveOrganization();

    const openModal = useOpenModal();
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const productService = useProductService();
    const paginatorService = usePaginatorService();
    const providerFundService = useProviderFundService();
    const organizationService = useOrganizationService();
    const productReservationService = useProductReservationService();
    const productReservationsExporter = useProductReservationsExporter();

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [products, setProducts] = useState<Array<Partial<Product>>>(null);
    const [paginatorKey] = useState('reservations');

    const [loading, setLoading] = useState(true);
    const { selected, setSelected, toggleAll, toggle } = useTableToggles();

    const [reservations, setReservations] = useState<PaginationData<Reservation>>(null);

    const [activeReservations, setActiveReservations] = useState<PaginationData<Reservation>>(null);
    const [archivedReservations, setArchivedReservations] = useState<PaginationData<Reservation>>(null);

    const [shownReservationsType, setShownReservationType] = useState('active');
    const [acceptedByDefault, setAcceptByDefault] = useState(activeOrganization.reservations_auto_accept);

    const showExtraPayments = useMemo(() => {
        const hasExtraPaymentsOnPage =
            reservations?.data.filter((reservation) => {
                return reservation.extra_payment !== null;
            }).length > 0;

        return activeOrganization.can_view_provider_extra_payments || hasExtraPaymentsOnPage;
    }, [activeOrganization, reservations]);

    const [extraPaymentStates] = useState([
        { key: 'canceled_payment_expired', name: 'Geannuleerd door verlopen bijbetaling' }, // Canceled payment expired
        { key: 'canceled_payment_canceled', name: 'Geannuleerd door ingetrokken bijbetaling' }, // Canceled payment canceled
        { key: 'canceled_payment_failed', name: 'Geannuleerd door mislukte bijbetaling' }, // Canceled payment failed
    ]);

    const [states] = useState([
        { key: null, name: 'Alle' }, // All
        { key: 'waiting', name: 'Wachtend op bijbetaling' }, // Waiting
        { key: 'pending', name: 'In afwachting' }, // Pending
        { key: 'accepted', name: 'Geaccepteerd' }, // Accepted
        { key: 'rejected', name: 'Geweigerd' }, // Rejected
        { key: 'expired', name: 'Verlopen' }, // Expired
        { key: 'canceled', name: 'Geannuleerd door aanbieder' }, // Canceled by provider
        { key: 'canceled_by_client', name: 'Geannuleerd door aanvrager' }, // Canceled by client
        { key: 'canceled_by_sponsor', name: 'Geannuleerd door sponsor' }, // Canceled by sponsor
        ...(activeOrganization.can_view_provider_extra_payments ? extraPaymentStates : []), // Extra payment states
    ]);

    const filter = useFilter({
        q: '',
        state: states[0].key,
        from: null,
        to: null,
        fund_id: null,
        product_id: null,
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const { headElement, configsElement } = useConfigurableTable(
        productReservationService.getColumns(showExtraPayments),
        {
            filter: filter,
            sortable: true,
            trPrepend: (
                <th className="th-narrow">
                    <TableCheckboxControl
                        checked={selected.length == reservations?.data?.length}
                        onClick={(e) => toggleAll(e, reservations?.data)}
                    />
                </th>
            ),
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
            fetchReservations(filter.activeValues).then((res) => setActiveReservations(res.data)),
            fetchReservations(filter.activeValues, true).then((res) => setArchivedReservations(res.data)),
        ]).finally(() => {
            setLoading(false);
            setProgress(100);
        });
    }, [fetchReservations, filter.activeValues, setProgress, setSelected]);

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

    const exportReservations = useCallback(() => {
        productReservationsExporter.exportData(activeOrganization.id, filter.values);
    }, [activeOrganization.id, filter.values, productReservationsExporter]);

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

    // Fetch filter models
    useEffect(() => {
        providerFundService.listFunds(activeOrganization.id, { per_page: 100 }).then((res) => {
            setFunds([{ id: null, name: 'Alle tegoeden' }, ...res.data.data.map((item) => item.fund)]);
        });

        productService.list(activeOrganization.id, { per_page: 100 }).then((res) => {
            setProducts([{ id: null, name: 'Alle aanbod' }, ...res.data.data]);
        });
    }, [activeOrganization, productService, providerFundService]);

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
                                    <Fragment>
                                        <div onClick={makeReservation} className="button button-primary button-sm">
                                            <em className="mdi mdi-plus-circle icon-start" />
                                            Aanmaken
                                        </div>

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
                                            <div
                                                className="button button-primary button-sm"
                                                onClick={uploadReservations}>
                                                <em className="mdi mdi-upload icon-start" />
                                                Upload bulkbestand
                                            </div>
                                        )}
                                    </Fragment>
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

                                {filter.show ? (
                                    <div className="button button-text" onClick={filter.resetFilters}>
                                        <em className="mdi mdi-close icon-start" />
                                        <span>Wis filters</span>
                                    </div>
                                ) : (
                                    <div className="form">
                                        <div className="form-group">
                                            <input
                                                className="form-control"
                                                value={filter.values.q}
                                                data-dusk="tableReservationSearch"
                                                placeholder={translate('reservations.filters.search')}
                                                onChange={(e) => filter.update({ q: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <CardHeaderFilter filter={filter}>
                                    <FilterItemToggle label={translate('reservations.filters.search')} show={true}>
                                        <input
                                            className="form-control"
                                            value={filter.values.q}
                                            onChange={(e) => filter.update({ q: e.target.value })}
                                            placeholder={translate('reservations.filters.search')}
                                        />
                                    </FilterItemToggle>

                                    <FilterItemToggle label={translate('reservations.filters.fund')}>
                                        {funds && (
                                            <SelectControl
                                                className="form-control"
                                                propKey={'id'}
                                                allowSearch={false}
                                                options={funds}
                                                onChange={(fund_id: number) => filter.update({ fund_id })}
                                            />
                                        )}
                                    </FilterItemToggle>

                                    <FilterItemToggle label={translate('reservations.filters.product')}>
                                        {products && (
                                            <SelectControl
                                                className="form-control"
                                                propKey={'id'}
                                                allowSearch={true}
                                                options={products}
                                                onChange={(product_id: number) => filter.update({ product_id })}
                                            />
                                        )}
                                    </FilterItemToggle>

                                    <FilterItemToggle label={translate('reservations.filters.from')}>
                                        <DatePickerControl
                                            value={dateParse(filter.values.from)}
                                            placeholder={translate('jjjj-MM-dd')}
                                            onChange={(from: Date) => {
                                                filter.update({ from: dateFormat(from) });
                                            }}
                                        />
                                    </FilterItemToggle>

                                    <FilterItemToggle label={translate('reservations.filters.to')}>
                                        <DatePickerControl
                                            value={dateParse(filter.values.to)}
                                            placeholder={translate('jjjj-MM-dd')}
                                            onChange={(to: Date) => {
                                                filter.update({ to: dateFormat(to) });
                                            }}
                                        />
                                    </FilterItemToggle>

                                    <FilterItemToggle label={translate('reservations.filters.state')}>
                                        <SelectControl
                                            className="form-control"
                                            propKey={'key'}
                                            allowSearch={false}
                                            value={filter.values.state}
                                            options={states}
                                            onChange={(state: string) => filter.update({ state })}
                                        />
                                    </FilterItemToggle>

                                    <div className="form-actions">
                                        <button
                                            className="button button-primary button-wide"
                                            onClick={() => exportReservations()}
                                            data-dusk="export"
                                            disabled={reservations.meta.total == 0}>
                                            <em className="mdi mdi-download icon-start"> </em>
                                            {translate('components.dropdown.export', {
                                                total: reservations.meta.total,
                                            })}
                                        </button>
                                    </div>
                                </CardHeaderFilter>
                            </Fragment>
                        )}
                    </div>
                </div>
            </div>

            {reservations.meta.total > 0 && (
                <div className="card-section card-section-padless">
                    {configsElement}

                    <TableTopScroller>
                        <table className="table form">
                            {headElement}

                            <tbody>
                                {reservations.data?.map((reservation) => (
                                    <StateNavLink
                                        name="reservations-show"
                                        params={{
                                            organizationId: activeOrganization.id,
                                            id: reservation.id,
                                        }}
                                        className={classNames(
                                            'tr-clickable',
                                            selected.includes(reservation.id) && 'selected',
                                        )}
                                        dataDusk={`tableReservationRow${reservation.id}`}
                                        customElement={'tr'}
                                        key={reservation.id}>
                                        <td className="td-narrow">
                                            <TableCheckboxControl
                                                checked={selected.includes(reservation.id)}
                                                onClick={(e) => toggle(e, reservation)}
                                            />
                                        </td>
                                        <td>
                                            <StateNavLink
                                                name={'reservations-show'}
                                                params={{
                                                    organizationId: activeOrganization.id,
                                                    id: reservation.id,
                                                }}
                                                className="text-strong">{`#${reservation.code}`}</StateNavLink>
                                        </td>
                                        <td>
                                            <StateNavLink
                                                name={'products-show'}
                                                disabled={!hasPermission(activeOrganization, 'manage_products')}
                                                params={{
                                                    organizationId: reservation.product.organization_id,
                                                    id: reservation.product.id,
                                                }}
                                                className={classNames(
                                                    `text-strong text-primary`,
                                                    reservation.product?.deleted
                                                        ? 'text-strike'
                                                        : 'text-decoration-link',
                                                )}
                                                title={reservation.product.name}>
                                                {strLimit(reservation.product.name, 45)}
                                            </StateNavLink>
                                            <div className="text-strong text-small text-muted-dark">
                                                {reservation.price_locale}
                                            </div>
                                        </td>
                                        <td>{reservation.amount_locale}</td>

                                        {showExtraPayments && (
                                            <td>{reservation.amount_extra ? reservation.amount_extra_locale : '-'}</td>
                                        )}

                                        <td>
                                            <div className={'flex flex-vertical'}>
                                                {reservation.identity_physical_card ? (
                                                    <div className={'flex flex-vertical'}>
                                                        <div className="text-strong text-primary">
                                                            {reservation.identity_physical_card}
                                                        </div>
                                                        <BlockInlineCopy
                                                            className="text-strong text-small text-muted-dark"
                                                            value={reservation.identity_email}>
                                                            {strLimit(reservation.identity_email, 27)}
                                                        </BlockInlineCopy>
                                                    </div>
                                                ) : (
                                                    <BlockInlineCopy
                                                        className={'text-strong text-primary'}
                                                        value={reservation.identity_email}>
                                                        {strLimit(reservation.identity_email, 27)}
                                                    </BlockInlineCopy>
                                                )}
                                                {(reservation.first_name || reservation.last_name) && (
                                                    <strong>
                                                        {reservation.first_name + ' ' + reservation.last_name}
                                                    </strong>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <strong className="text-primary">{reservation.created_at_locale}</strong>
                                        </td>
                                        <td data-dusk="reservationState">
                                            <ReservationLabel reservation={reservation} />
                                        </td>

                                        <td className={'table-td-actions text-right'}>
                                            <TableRowActions
                                                content={(e) => (
                                                    <div className="dropdown dropdown-actions">
                                                        <StateNavLink
                                                            name="reservations-show"
                                                            params={{
                                                                organizationId: activeOrganization.id,
                                                                id: reservation.id,
                                                            }}
                                                            className="dropdown-item">
                                                            <em className="mdi mdi-eye icon-start" />
                                                            Bekijk
                                                        </StateNavLink>

                                                        {reservation.acceptable && (
                                                            <div
                                                                className="dropdown-item"
                                                                onClick={() => {
                                                                    acceptReservations([reservation]);
                                                                    e.close();
                                                                }}>
                                                                <em className="mdi mdi-check icon-start" />
                                                                Accepteren
                                                            </div>
                                                        )}

                                                        {reservation.rejectable && (
                                                            <div
                                                                className="dropdown-item"
                                                                onClick={() => {
                                                                    rejectReservations([reservation]);
                                                                    e.close();
                                                                }}>
                                                                <em className="mdi mdi-close icon-start" />
                                                                Afwijzen
                                                            </div>
                                                        )}

                                                        {reservation.archivable && (
                                                            <div
                                                                className="dropdown-item"
                                                                onClick={() => {
                                                                    archiveReservations([reservation]);
                                                                    e.close();
                                                                }}>
                                                                <em className="mdi mdi-archive-outline icon-start" />
                                                                Archief
                                                            </div>
                                                        )}

                                                        {reservation.archived && (
                                                            <div
                                                                className="dropdown-item"
                                                                onClick={() => {
                                                                    unarchiveReservations([reservation]);
                                                                    e.close();
                                                                }}>
                                                                <em className="mdi mdi-archive-arrow-up-outline icon-start" />
                                                                Herstellen
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                        </td>
                                    </StateNavLink>
                                ))}
                            </tbody>
                        </table>
                    </TableTopScroller>
                </div>
            )}

            {reservations.meta.total == 0 && (
                <div className="card-section">
                    <div className="card-subtitle text-center">Geen reserveringen.</div>
                </div>
            )}

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

            {reservations?.meta && (
                <div className="card-section">
                    <Paginator
                        meta={reservations.meta}
                        filters={filter.values}
                        updateFilters={filter.update}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}
        </div>
    );
}
