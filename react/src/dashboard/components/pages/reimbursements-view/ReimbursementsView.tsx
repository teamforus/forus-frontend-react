import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import usePushDanger from '../../../hooks/usePushDanger';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useSetProgress from '../../../hooks/useSetProgress';
import useOpenModal from '../../../hooks/useOpenModal';
import { useParams } from 'react-router-dom';
import { useReimbursementsService } from '../../../services/ReimbursementService';
import Reimbursement from '../../../props/models/Reimbursement';
import File from '../../../props/models/File';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import usePushSuccess from '../../../hooks/usePushSuccess';
import TransactionDetails from '../transactions-view/elements/TransactionDetails';
import { hasPermission } from '../../../helpers/utils';
import BlockCardNote from '../../elements/block-card-note/BlockCardNote';
import Note from '../../../props/models/Note';
import { ApiResponseSingle, ResponseError } from '../../../props/ApiResponses';
import ModalReimbursementResolve from '../../modals/ModalReimbursementResolve';
import ModalReimbursementDetailsEdit from '../../modals/ModalReimbursementDetailsEdit';
import useFilePreview from '../../../services/helpers/useFilePreview';
import { useFileService } from '../../../services/FileService';

export default function ReimbursementsView() {
    const { t } = useTranslation();
    const { id } = useParams();

    const authIdentity = useAuthIdentity();
    const activeOrganization = useActiveOrganization();

    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const filePreview = useFilePreview();

    const fileService = useFileService();
    const reimbursementService = useReimbursementsService();

    const [reimbursement, setReimbursement] = useState<Reimbursement>(null);

    const [stateLabels] = useState({
        pending: 'label-default',
        approved: 'label-success',
        declined: 'label-danger',
    });

    const fetchReimbursement = useCallback(() => {
        setProgress(0);

        reimbursementService
            .show(activeOrganization.id, parseInt(id))
            .then((res) => setReimbursement(res.data.data))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data?.message))
            .finally(() => setProgress(100));
    }, [setProgress, reimbursementService, activeOrganization.id, id, pushDanger]);

    const handleOnReimbursementUpdated = useCallback(
        (promise: Promise<ApiResponseSingle<Reimbursement>>, successMessage: string = null) => {
            setProgress(0);

            promise
                .then((res: ApiResponseSingle<Reimbursement>) => {
                    setReimbursement(res.data.data);
                    pushSuccess('Success!', successMessage);
                })
                .catch((err: ResponseError) => {
                    pushDanger(err.data?.title || 'Foutmelding!', err.data?.message || 'Onbekende foutmelding!');
                })
                .finally(() => setProgress(100));
        },
        [pushDanger, pushSuccess, setProgress],
    );

    const assign = useCallback(() => {
        handleOnReimbursementUpdated(
            reimbursementService.assign(activeOrganization.id, reimbursement.id),
            'Declaratie verzoek toegewezen.',
        );
    }, [activeOrganization.id, handleOnReimbursementUpdated, reimbursement?.id, reimbursementService]);

    const resolve = useCallback(
        (approve: boolean) => {
            openModal((modal) => (
                <ModalReimbursementResolve
                    modal={modal}
                    organization={activeOrganization}
                    reimbursement={reimbursement}
                    approve={approve}
                    onSubmit={(res: ApiResponseSingle<Reimbursement>) => setReimbursement(res.data.data)}
                />
            ));
        },
        [activeOrganization, openModal, reimbursement],
    );

    const resign = useCallback(() => {
        handleOnReimbursementUpdated(
            reimbursementService.resign(activeOrganization.id, reimbursement.id),
            'Declaratie verzoek niet meer toegewezen.',
        );
    }, [activeOrganization.id, handleOnReimbursementUpdated, reimbursement?.id, reimbursementService]);

    const downloadFile = useCallback(
        (file: File) => {
            setProgress(0);

            fileService
                .download(file)
                .then((res) => fileService.downloadFile(file.original_name, res.data))
                .catch((err: ResponseError) => pushDanger('Mislukt!', err.data?.message))
                .finally(() => setProgress(100));
        },
        [fileService, pushDanger, setProgress],
    );

    const hasFilePreview = useCallback((file) => {
        return ['pdf', 'png', 'jpeg', 'jpg'].includes(file.ext);
    }, []);

    const previewFile = useCallback(
        (e: React.MouseEvent<HTMLElement>, file: File) => {
            e?.preventDefault();
            e?.stopPropagation();

            filePreview(file);
        },
        [filePreview],
    );

    const editReimbursementDetails = useCallback(() => {
        openModal((modal) => (
            <ModalReimbursementDetailsEdit
                modal={modal}
                description={null}
                organization={activeOrganization}
                reimbursement={reimbursement}
                onSubmit={(res: ApiResponseSingle<Reimbursement>) => setReimbursement(res.data.data)}
            />
        ));
    }, [activeOrganization, openModal, reimbursement]);

    const setTransaction = useCallback(() => {
        fetchReimbursement();
    }, [fetchReimbursement]);

    const fetchNotes = useCallback(
        (query = {}) => {
            return reimbursementService.notes(activeOrganization.id, reimbursement?.id, query);
        },
        [activeOrganization.id, reimbursement?.id, reimbursementService],
    );

    const deleteNote = useCallback(
        (note: Note) => {
            return reimbursementService.noteDestroy(activeOrganization.id, reimbursement?.id, note.id);
        },
        [activeOrganization.id, reimbursement?.id, reimbursementService],
    );

    const storeNote = useCallback(
        (data) => {
            return reimbursementService.storeNote(activeOrganization.id, reimbursement?.id, data);
        },
        [activeOrganization.id, reimbursement?.id, reimbursementService],
    );

    useEffect(() => {
        fetchReimbursement();
    }, [fetchReimbursement]);

    if (!reimbursement) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            {activeOrganization && (
                <div className="block block-breadcrumbs">
                    <StateNavLink
                        className="breadcrumb-item"
                        name="reimbursements"
                        params={{ organizationId: activeOrganization.id }}>
                        Reimbursements
                    </StateNavLink>

                    <div className="breadcrumb-item active">{'#' + reimbursement.code}</div>
                </div>
            )}

            {reimbursement && (
                <div className="card">
                    {reimbursement.expired && (
                        <div className="card-header card-header-warning card-header-sm">
                            <div className="card-title text-small">
                                <strong>Waarschuwing!</strong>&nbsp; Het fonds of tegoed van deze declaratie is verlopen
                                of het saldo is niet meer toereikend. De decalartie kan niet meer worden behandeld.
                            </div>
                        </div>
                    )}

                    {reimbursement.deactivated && (
                        <div className="card-header card-header-warning card-header-sm">
                            <div className="card-title text-small">
                                <strong>Waarschuwing!</strong>&nbsp; Het tegoed is gedeactiveerd. Om de declaratie te
                                behandelen moet het tegoed opnieuw worden geactiveerd.
                            </div>
                        </div>
                    )}

                    <div className="card-header">
                        <div className="flex">
                            <div className="flex flex-grow">
                                <div className="flex flex-vertical">
                                    <div className="card-title">
                                        <div className="flex">
                                            <div className="flex flex-vertical">
                                                <div className="flex">
                                                    <span className="text-muted">NR:&nbsp;</span>
                                                    {reimbursement.code} &nbsp;
                                                </div>
                                            </div>

                                            <div className="flex flex-vertical flex-center">
                                                <div className="flex flex-horizontal">
                                                    {!reimbursement.expired && (
                                                        <label
                                                            className={`label ${
                                                                stateLabels[reimbursement.state] || ''
                                                            }`}>
                                                            {reimbursement.state_locale}
                                                        </label>
                                                    )}

                                                    {reimbursement.expired && (
                                                        <label className="label label-danger-light">
                                                            {reimbursement.expired}
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-subtitle">
                                        <div className="flex">
                                            <div className="mdi mdi-clock-outline" />
                                            {reimbursement.created_at_locale}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {reimbursement.state === 'pending' && (
                                <div className="flex flex-self-start">
                                    <div className="flex-row">
                                        {!reimbursement.employee &&
                                            !reimbursement.expired &&
                                            !reimbursement.deactivated && (
                                                <div className="button-group" data-dusk="reimbursementAssign">
                                                    <div
                                                        className="button button-primary button-sm"
                                                        onClick={() => assign()}>
                                                        <em className="mdi mdi-account-plus-outline icon-start" />
                                                        Toewijzen aan mij
                                                    </div>
                                                </div>
                                            )}

                                        {reimbursement.employee &&
                                            reimbursement.employee.identity_address == authIdentity.address && (
                                                <div className="button-group">
                                                    {!reimbursement.expired && !reimbursement.deactivated && (
                                                        <div
                                                            className="button button-primary button-sm"
                                                            data-dusk="reimbursementApprove"
                                                            onClick={() => resolve(true)}>
                                                            <em className="mdi mdi-check-circle icon-start" />
                                                            Accepteren
                                                        </div>
                                                    )}

                                                    {!reimbursement.expired && !reimbursement.deactivated && (
                                                        <div
                                                            className="button button-default button-sm"
                                                            data-dusk="reimbursementDecline"
                                                            onClick={() => resolve(false)}>
                                                            <em className="mdi mdi-close-circle icon-start" />
                                                            Weigeren
                                                        </div>
                                                    )}

                                                    <div
                                                        className="button button-primary-light button-sm"
                                                        data-dusk="reimbursementResign"
                                                        onClick={() => resign()}>
                                                        <em className="mdi mdi-account-minus icon-start" />
                                                        Meld af
                                                    </div>
                                                </div>
                                            )}

                                        {reimbursement.employee &&
                                            reimbursement.employee.identity_address != authIdentity.address && (
                                                <div className="card-title">
                                                    <div className="text-small">
                                                        Assigned to:&nbsp;
                                                        <span className="text-primary text-strong">
                                                            {reimbursement.employee.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <table className="table table-fixed">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <div className="text-strong text-md text-primary">
                                                    {t('reimbursements.labels.email')}
                                                </div>
                                                <div
                                                    className={
                                                        reimbursement.identity_email
                                                            ? 'text-medium text-black'
                                                            : 'text-medium text-muted'
                                                    }>
                                                    {reimbursement.identity_email || 'Geen E-mail'}
                                                </div>
                                            </td>

                                            <td>
                                                <div className="text-strong text-md text-primary">
                                                    {t('reimbursements.labels.bsn')}
                                                </div>
                                                {activeOrganization.bsn_enabled ? (
                                                    <div
                                                        className={`${
                                                            reimbursement.identity_bsn
                                                                ? 'text-medium text-black'
                                                                : 'text-medium text-muted'
                                                        }`}>
                                                        {reimbursement.identity_bsn || 'Geen BSN'}
                                                    </div>
                                                ) : (
                                                    <div className="text-medium text-muted">Not available</div>
                                                )}
                                            </td>

                                            <td>
                                                <div className="text-strong text-md text-primary">
                                                    {t('reimbursements.labels.fund')}
                                                </div>
                                                <div className="text-medium text-black">{reimbursement.fund.name}</div>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>
                                                <div className="text-strong text-md text-primary">
                                                    {t('reimbursements.labels.employee')}
                                                </div>
                                                <div
                                                    className={`text-medium ${
                                                        reimbursement.employee_id ? 'text-black' : 'text-muted'
                                                    }`}>
                                                    {reimbursement.employee?.email || 'Niet toegewezen'}
                                                </div>
                                            </td>

                                            <td>
                                                <div className="text-strong text-md text-primary">
                                                    {t('reimbursements.labels.lead_time')}
                                                </div>
                                                <div className="text-medium text-black">
                                                    {reimbursement.lead_time_locale}
                                                </div>
                                            </td>

                                            {!reimbursement.resolved && (
                                                <td>
                                                    {!reimbursement.expired && (
                                                        <div className="text-strong text-md text-primary">
                                                            {t('reimbursements.labels.expired_at')}
                                                        </div>
                                                    )}

                                                    {reimbursement.expired && (
                                                        <div className="text-strong text-md text-primary">
                                                            {t('reimbursements.labels.expired_at')}
                                                        </div>
                                                    )}

                                                    <div className="text-medium text-black">
                                                        {reimbursement.expire_at_locale}
                                                    </div>
                                                </td>
                                            )}

                                            {reimbursement.resolved && (
                                                <td>
                                                    <div className="text-strong text-md text-primary">
                                                        {t('reimbursements.labels.resolved_at')}
                                                    </div>
                                                    <div className="text-medium text-black">
                                                        {reimbursement.resolved_at_locale}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {reimbursement && (
                <div className="card" data-dusk="reimbursementDetails">
                    <div className="card-header">
                        <div className="card-title">Gegevens</div>
                    </div>

                    <div className="card-section">
                        <div className="flex">
                            <div className="flex">
                                <div className="card-block card-block-keyvalue">
                                    <div className="keyvalue-item">
                                        <div className="keyvalue-key">{t('reimbursements.labels.iban')}</div>
                                        <div className="keyvalue-value" data-dusk="reimbursementIBAN">
                                            {reimbursement.iban}
                                        </div>
                                    </div>

                                    <div className="keyvalue-item">
                                        <div className="keyvalue-key">{t('reimbursements.labels.iban_name')}</div>
                                        <div className="keyvalue-value" data-dusk="reimbursementIBANName">
                                            {reimbursement.iban_name}
                                        </div>
                                    </div>

                                    <div className="keyvalue-item">
                                        <div className="keyvalue-key">{t('reimbursements.labels.amount')}</div>
                                        <div
                                            className="keyvalue-value text-primary text-md"
                                            data-dusk="reimbursementAmount">
                                            {reimbursement.amount_locale}
                                        </div>
                                    </div>

                                    <div className="keyvalue-item">
                                        <div className="keyvalue-key">{t('reimbursements.labels.state')}</div>
                                        <div className="keyvalue-value">
                                            <label
                                                className={`label ${stateLabels[reimbursement.state] || ''}`}
                                                data-dusk="reimbursementState">
                                                {reimbursement.state_locale}
                                            </label>
                                        </div>
                                    </div>

                                    <div className="keyvalue-item">
                                        <div className="keyvalue-key">{t('reimbursements.labels.title')}</div>
                                        <div className="keyvalue-value" data-dusk="reimbursementTitle">
                                            {reimbursement.title}
                                        </div>
                                    </div>

                                    <div className="keyvalue-item">
                                        <div className="keyvalue-key">{t('reimbursements.labels.description')}</div>
                                        <div className="keyvalue-value" data-dusk="reimbursementDescription">
                                            {reimbursement.description}
                                        </div>
                                    </div>

                                    <div className="keyvalue-item">
                                        <div className="keyvalue-key">{t('reimbursements.labels.created_at')}</div>
                                        <div className="keyvalue-value">{reimbursement.created_at_locale}</div>
                                    </div>

                                    <div className="keyvalue-item">
                                        <div className="keyvalue-key">{t('reimbursements.labels.files')}</div>
                                        <div className="keyvalue-value">
                                            {reimbursement.files.length > 0 && (
                                                <div className="block block-attachments-list">
                                                    {reimbursement.files.map((file: File, index) => (
                                                        <a
                                                            key={index}
                                                            className="attachment-item"
                                                            onClick={() => {
                                                                downloadFile(file);
                                                            }}
                                                            target="_blank"
                                                            rel="noreferrer">
                                                            <div className="attachment-icon">
                                                                <div className="mdi mdi-file" />
                                                                <div className="attachment-size">{file.size}</div>
                                                            </div>

                                                            <div className="attachment-name">{file.original_name}</div>
                                                            <div className="attachment-date">
                                                                {reimbursement.created_at_locale}
                                                            </div>
                                                            {hasFilePreview(file) && (
                                                                <div
                                                                    title={
                                                                        file.ext == 'pdf'
                                                                            ? 'Bekijk PDF-bestand'
                                                                            : 'Bekijk file'
                                                                    }
                                                                    className="attachment-preview"
                                                                    onClick={(e) => {
                                                                        previewFile(e, file);
                                                                    }}>
                                                                    <div className="mdi mdi-eye" />
                                                                </div>
                                                            )}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {reimbursement && (
                <div className="card">
                    <div className="card-header">
                        <div className="flex-row">
                            <div className="flex flex-grow">
                                <div className="card-title">Extra informatie</div>
                            </div>
                            <div className="flex">
                                <div className="block block-inline-filters">
                                    {reimbursement.employee?.identity_address === authIdentity.address && (
                                        <div
                                            className="button button-primary"
                                            onClick={() => editReimbursementDetails()}>
                                            <em className="mdi mdi-pencil icon-start" />
                                            Bewerk
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-section">
                        <div className="flex">
                            <div className="flex">
                                <div className="card-block card-block-keyvalue">
                                    <div className="keyvalue-item">
                                        <div className="keyvalue-key">{t('reimbursements.labels.provider')}</div>
                                        {reimbursement.provider_name ? (
                                            <div className="keyvalue-value">{reimbursement.provider_name}</div>
                                        ) : (
                                            <div className="keyvalue-value text-muted">Geen aanbieder</div>
                                        )}
                                    </div>

                                    <div className="keyvalue-item">
                                        <div className="keyvalue-key">{t('reimbursements.labels.category')}</div>
                                        {reimbursement.reimbursement_category?.name ? (
                                            <div className="keyvalue-value">
                                                {reimbursement.reimbursement_category.name}
                                            </div>
                                        ) : (
                                            <div className="keyvalue-value text-muted">Geen categorie</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {reimbursement.voucher_transaction && hasPermission(activeOrganization, 'view_finances') && (
                <TransactionDetails
                    transaction={reimbursement.voucher_transaction}
                    setTransaction={setTransaction}
                    showReservationPageButton={true}
                />
            )}

            <BlockCardNote
                isAssigned={reimbursement.employee?.identity_address === authIdentity.address}
                fetchNotes={fetchNotes}
                deleteNote={deleteNote}
                storeNote={storeNote}
            />
        </Fragment>
    );
}
