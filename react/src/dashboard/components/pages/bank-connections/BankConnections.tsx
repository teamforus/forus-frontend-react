import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useAssetUrl from '../../../hooks/useAssetUrl';
import 'react-image-crop/dist/ReactCrop.css';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import Bank from '../../../props/models/Bank';
import usePushDanger from '../../../hooks/usePushDanger';
import { useBankConnectionService } from '../../../services/BankConnectionService';
import { useBankService } from '../../../services/BankService';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useOpenModal from '../../../hooks/useOpenModal';
import Paginator from '../../../modules/paginator/components/Paginator';
import useFilter from '../../../hooks/useFilter';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import BankConnection from '../../../props/models/BankConnection';
import ModalSwitchBankConnectionAccount from '../../modals/ModalSwitchBankConnectionAccount';
import usePushSuccess from '../../../hooks/usePushSuccess';
import { BooleanParam, StringParam, useQueryParams } from 'use-query-params';
import useConfirmBankConnectionDisable from './hooks/useConfirmBankConnectionDisable';
import useConfirmBankNewConnection from './hooks/useConfirmBankNewConnection';
import LoadingCard from '../../elements/loading-card/LoadingCard';

export default function BankConnections() {
    const activeOrganization = useActiveOrganization();

    const assetUrl = useAssetUrl();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();

    const confirmBankNewConnection = useConfirmBankNewConnection();
    const confirmBankConnectionDisable = useConfirmBankConnectionDisable();

    const bankService = useBankService();
    const paginatorService = usePaginatorService();
    const bankConnectionService = useBankConnectionService();

    const [bank, setBank] = useState<Bank>(null);
    const [banks, setBanks] = useState<PaginationData<Bank>>(null);
    const [paginatorKey] = useState('bank-connections');
    const [bankConnection, setBankConnection] = useState<BankConnection>(null);
    const [bankConnections, setBankConnections] = useState<PaginationData<BankConnection>>(null);
    const [submittingConnection, setSubmittingConnection] = useState<boolean>(false);

    const [{ success, error }, setQueryParams] = useQueryParams({
        success: BooleanParam,
        error: StringParam,
    });

    const filter = useFilter({
        q: '',
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const selectBank = useCallback(
        (bankName: string) => {
            setBank(banks.data.filter((bank) => bank.key == bankName)[0] || null);
        },
        [banks],
    );

    const onRequestError = useCallback(
        (err: ResponseError) => {
            pushDanger('Error', err.data.message || 'Er is iets misgegaan, probeer het later opnieuw.');
        },
        [pushDanger],
    );

    const fetchBanks = useCallback(() => {
        bankService
            .list()
            .then((res) => setBanks(res.data))
            .catch(onRequestError);
    }, [bankService, onRequestError]);

    const fetchBankConnections = useCallback(
        (query: object = {}) => {
            bankConnectionService
                .list(activeOrganization.id, { ...query, ...filter.activeValues })
                .then((res) => setBankConnections(res.data))
                .catch(onRequestError);
        },
        [activeOrganization.id, bankConnectionService, filter.activeValues, onRequestError],
    );

    const fetchActiveBankConnection = useCallback(
        async (updateBank = true): Promise<BankConnection | null> => {
            return bankConnectionService
                .list(activeOrganization.id, { state: 'active' })
                .then((res) => {
                    const connection = res.data.data?.[0];

                    setBankConnection(connection);
                    setBank((bank) => (updateBank ? connection?.bank || null : bank));

                    return connection;
                })
                .catch((err: ResponseError) => {
                    onRequestError(err);
                    return null;
                });
        },
        [activeOrganization.id, bankConnectionService, onRequestError],
    );

    const confirmNewConnection = useCallback(async () => {
        return await fetchActiveBankConnection(false).then(async (connection) => {
            return connection ? await confirmBankNewConnection() : true;
        });
    }, [fetchActiveBankConnection, confirmBankNewConnection]);

    const disableConnection = useCallback(
        (connection_id: number) => {
            confirmBankConnectionDisable().then((confirmed) => {
                if (!confirmed) {
                    return;
                }

                bankConnectionService
                    .update(activeOrganization.id, connection_id, { state: 'disabled' })
                    .then(() => {
                        fetchBankConnections();
                        fetchActiveBankConnection().then();
                    })
                    .catch(onRequestError);
            });
        },
        [
            onRequestError,
            confirmBankConnectionDisable,
            bankConnectionService,
            activeOrganization.id,
            fetchBankConnections,
            fetchActiveBankConnection,
        ],
    );

    const makeBankConnection = useCallback(
        (bank: Bank) => {
            if (submittingConnection) {
                return;
            }

            setSubmittingConnection(true);

            confirmNewConnection().then((confirmed) => {
                if (!confirmed) {
                    setSubmittingConnection(false);
                }

                bankConnectionService
                    .store(activeOrganization.id, { bank_id: bank.id })
                    .then((res) => {
                        const { auth_url, state } = res.data.data;

                        if (state === 'pending' && auth_url) {
                            return (document.location = auth_url);
                        }

                        pushDanger('Error!', 'Er is een onbekende fout opgetreden.');
                    })
                    .catch((res) => {
                        setSubmittingConnection(false);
                        onRequestError(res);
                    });
            });
        },
        [
            activeOrganization.id,
            bankConnectionService,
            confirmNewConnection,
            onRequestError,
            pushDanger,
            submittingConnection,
        ],
    );

    const switchMonetaryAccount = useCallback(
        (bankConnection: BankConnection) => {
            openModal((modal) => (
                <ModalSwitchBankConnectionAccount
                    modal={modal}
                    bankConnection={bankConnection}
                    onChange={(connection) => setBankConnection(connection)}
                />
            ));
        },
        [openModal],
    );

    useEffect(() => {
        fetchBanks();
    }, [fetchBanks]);

    useEffect(() => {
        fetchBankConnections();
    }, [fetchBankConnections]);

    useEffect(() => {
        fetchActiveBankConnection().then();
    }, [fetchActiveBankConnection]);

    useEffect(() => {
        if (success === true) {
            pushSuccess('Succes!', 'De verbinding met bank is tot stand gebracht!');
        }

        if (error) {
            pushDanger(
                'Verbinding mislukt',
                {
                    invalid_grant: 'De autorisatiecode is ongeldig of verlopen.',
                    access_denied: 'Het autorisatieverzoek is geweigerd.',
                    not_pending: 'Verzoek voor verbinding is al behandeld.',
                }[error] || error,
            );
        }

        if (success === true || error) {
            setQueryParams({ success: null, error: null });
        }
    }, [error, pushDanger, pushSuccess, setQueryParams, success]);

    if (!banks || !bankConnections) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            {banks.meta.total === 0 && (
                <div className="card">
                    <div className="card-section">
                        <div className="block block-empty text-center">
                            <div className="empty-title">Niet beschikbaar</div>
                            <div className="empty-details">Geen verbindingen met een bank beschikbaar</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="row">
                <div className="col col-md-6">
                    {bank === null && !bankConnection && (
                        <div className="card">
                            <div className="card-section">
                                <div className="block block-empty text-center">
                                    <div className="empty-icon">
                                        <img
                                            className="empty-icon-img"
                                            src={assetUrl('/assets/img/bunq-logo.jpg')}
                                            alt={''}
                                        />
                                    </div>
                                    <div className="empty-title">Bunq integratie</div>
                                    <div className="empty-actions">
                                        <button className="button button-primary" onClick={() => selectBank('bunq')}>
                                            Selecteer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="col col-md-6">
                    {bank === null && !bankConnection && (
                        <div className="card">
                            <div className="card-section">
                                <div className="block block-empty text-center">
                                    <div className="empty-icon">
                                        <img
                                            className="empty-icon-img empty-icon-img-border"
                                            src={assetUrl('/assets/img/bng-logo.jpg')}
                                            alt={''}
                                        />
                                    </div>
                                    <div className="empty-title">BNG integratie</div>
                                    <div className="empty-actions">
                                        <button className="button button-primary" onClick={() => selectBank('bng')}>
                                            Selecteer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {bank?.key === 'bunq' && !bankConnection && (
                <div className="card">
                    <div className="card-section">
                        <div className="block block-empty text-center">
                            <div className="empty-icon">
                                <img className="empty-icon-img" src={assetUrl('/assets/img/bunq-logo.jpg')} alt={''} />
                            </div>
                            <div className="empty-title">Bank integratie</div>
                            <div className="empty-details">
                                <div className="row">
                                    <div className="col-lg-6 col-sm-8 col-offset-sm-2 col-offset-lg-3">
                                        Gebruik de koppeling met uw bank om rekeninginformatie uit te lezen en
                                        transacties klaar te zetten.
                                    </div>
                                </div>
                            </div>
                            <div className="empty-actions">
                                <button
                                    type="button"
                                    className="button button-primary"
                                    onSubmit={() => makeBankConnection(bank)}>
                                    {submittingConnection ? (
                                        <em className="mdi mdi-loading mdi-spin icon-start" />
                                    ) : (
                                        <em className="mdi mdi-qrcode-scan icon-start" />
                                    )}
                                    Koppelen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {bank?.key === 'bng' && !bankConnection && (
                <div className="card">
                    <div className="card-section">
                        <div className="block block-empty text-center">
                            <div className="empty-icon">
                                <img
                                    className="empty-icon-img empty-icon-img-border"
                                    src={assetUrl('/assets/img/bng-logo.jpg')}
                                    alt={''}
                                />
                            </div>
                            <div className="empty-title">Bank integratie</div>
                            <div className="empty-details">
                                <div className="row">
                                    <div className="col-lg-6 col-sm-8 col-offset-sm-2 col-offset-lg-3">
                                        Gebruik de koppeling met uw bank om rekeninginformatie uit te lezen en
                                        transacties klaar te zetten.
                                    </div>
                                </div>
                            </div>
                            <div className="empty-actions">
                                <button
                                    type="button"
                                    className="button button-primary"
                                    onClick={() => makeBankConnection(bank)}>
                                    {submittingConnection ? (
                                        <em className="mdi mdi-loading mdi-spin icon-start" />
                                    ) : (
                                        <em className="mdi mdi-link-variant icon-start" />
                                    )}
                                    Koppelen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {bank && bankConnection && (
                <div className="card card-collapsed">
                    <div className="card-section">
                        <div className="card-section-actions">
                            <div className="button-group flex-end">
                                <button className="button button-default" onClick={() => makeBankConnection(bank)}>
                                    {bank.key === 'bunq' && <em className="mdi mdi-qrcode-scan icon-start" />}
                                    {bank.key !== 'bunq' && <em className="mdi mdi-link-variant icon-start" />}
                                    Geef opnieuw toestemming
                                </button>

                                <button
                                    className="button button-primary"
                                    onClick={() => disableConnection(bankConnection.id)}>
                                    <em className="mdi mdi-trash-can-outline icon-start" />
                                    Stopzetten
                                </button>
                            </div>
                        </div>

                        <div className="card-block card-block-bank">
                            <div className="card-block-bank-media">
                                <img src={assetUrl('/assets/img/' + bank.key + '-logo.jpg')} alt={''} />
                            </div>

                            <div className="card-block-bank-details">
                                <div className="card-block-bank-name">{bank.name}</div>

                                <div className="card-block-bank-properties">
                                    <div className="card-block-bank-property">
                                        <div className="card-block-bank-property-label">Actieve IBAN</div>

                                        {bankConnection.accounts.length === 1 && (
                                            <div className="card-block-bank-property-value">
                                                <span>{bankConnection.iban}</span>
                                            </div>
                                        )}

                                        {bankConnection.accounts.length > 1 && (
                                            <div
                                                className="card-block-bank-property-value card-block-bank-property-value-link"
                                                onClick={() => switchMonetaryAccount(bankConnection)}>
                                                <span>{bankConnection.iban}</span>
                                                <em className="mdi mdi-pencil-outline" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {bank && bankConnections.meta?.total > 0 && (
                <div className="card card-collapsed">
                    <div className="card-header">
                        <div className="card-title">Status verbindingen</div>
                    </div>

                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th className="th-narrow nowrap">Datum van toestemming</th>
                                            <th>Bank</th>
                                            <th>Verloopdatum</th>
                                            <th>Rekening</th>
                                            <th className="th-narrow text-right">Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {bank &&
                                            bankConnections.data?.map((bankConnection: BankConnection) => (
                                                <tr key={bankConnection.id}>
                                                    <td>{bankConnection.created_at_locale}</td>
                                                    <td>{bankConnection.bank.name}</td>
                                                    <td>
                                                        {bankConnection.expire_at
                                                            ? bankConnection.expire_at_locale
                                                            : 'Geen verloopdatum'}
                                                    </td>
                                                    <td>{bankConnection.iban}</td>
                                                    <td className="text-right">
                                                        <div
                                                            className={
                                                                'label ' +
                                                                (bankConnection.state == 'active'
                                                                    ? 'label-success'
                                                                    : 'label-default')
                                                            }>
                                                            {bankConnection.state_locale}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {bankConnections.meta && (
                        <div className="card-section">
                            <Paginator
                                filters={filter.values}
                                updateFilters={filter.update}
                                meta={bankConnections.meta}
                                perPageKey={paginatorKey}
                            />
                        </div>
                    )}
                </div>
            )}
        </Fragment>
    );
}
