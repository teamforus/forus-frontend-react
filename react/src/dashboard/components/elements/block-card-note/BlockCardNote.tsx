import FilterModel from '../../../types/FilterModel';
import FormValuesModel from '../../../types/FormValuesModel';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { ApiResponse, ApiResponseSingle, PaginationData } from '../../../props/ApiResponses';
import Paginator from '../../../modules/paginator/components/Paginator';
import useFilters from '../../../hooks/useFilters';
import React from 'react';
import usePushDanger from '../../../hooks/usePushDanger';
import useOpenModal from '../../../hooks/useOpenModal';
import ModalDangerZone from '../../modals/ModalDangerZone';
import usePushSuccess from '../../../hooks/usePushSuccess';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import Note from '../../../props/models/Note';
import LoadingCard from '../loading-card/LoadingCard';
import ModalAddNote from '../../modals/ModalAddNote';
import useSetProgress from '../../../hooks/useSetProgress';

export default function BlockCardNote({
    isAssigned,
    fetchNotes,
    deleteNote,
    storeNote,
}: {
    isAssigned: boolean;
    fetchNotes: (value: FilterModel) => Promise<ApiResponse<Note>>;
    deleteNote: (note: Note) => Promise<ApiResponseSingle<null>>;
    storeNote: (values: FormValuesModel) => Promise<ApiResponseSingle<Note>>;
}) {
    const { t } = useTranslation();
    const [notes, setNotes] = useState<PaginationData<Note>>(null);
    const identity = useAuthIdentity();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const filters = useFilters({
        q: '',
        per_page: 10,
    });

    useEffect(() => {
        setProgress(0);

        fetchNotes(filters.activeValues)
            .then((res) => setNotes(res.data))
            .finally(() => setProgress(100));
    }, [fetchNotes, filters.activeValues, setProgress]);

    const onDeleteNote = useCallback(
        (note) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={t('modals.danger_zone.remove_note.title')}
                    description={t('modals.danger_zone.remove_note.description')}
                    buttonCancel={{
                        onClick: modal.close,
                        text: t('modals.danger_zone.remove_note.buttons.cancel'),
                    }}
                    buttonSubmit={{
                        onClick: () => {
                            modal.close();
                            setProgress(0);

                            deleteNote(note)
                                .then(
                                    () => {
                                        filters.update({ ...filters.activeValues });
                                        pushSuccess('Gelukt!', 'Notitie verwijderd.');
                                    },
                                    (res) => {
                                        pushDanger('Foutmelding!', res.data.message);
                                    },
                                )
                                .finally(() => setProgress(100));
                        },
                        text: t('modals.danger_zone.remove_note.buttons.confirm'),
                    }}
                />
            ));
        },
        [deleteNote, filters, openModal, pushDanger, pushSuccess, setProgress, t],
    );

    const onAddNote = useCallback(() => {
        openModal((modal) => (
            <ModalAddNote
                modal={modal}
                storeNote={storeNote}
                description={'De notitie is alleen zichtbaar voor medewerkers met dezelfde rechten.'}
                onCreated={() => {
                    filters.update({ ...filters.activeValues });
                    pushSuccess('Gelukt!', 'Note created.');
                }}
            />
        ));
    }, [filters, openModal, pushSuccess, storeNote]);

    if (!notes) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex-row">
                    <div className="flex flex-grow">
                        <div className="card-title">
                            {t('notes.header.title')}&nbsp;
                            <span className="span-count">{notes.meta.total}</span>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="block block-inline-filters">
                            {isAssigned && (
                                <div className="button button-primary" onClick={onAddNote}>
                                    <em className="mdi mdi-plus-circle icon-start" />
                                    {t('notes.buttons.add_new')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {notes.meta.total > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table table-align-top">
                                <tbody>
                                    <tr>
                                        <th>{t('notes.labels.id')}</th>
                                        <th>{t('notes.labels.created_at')}</th>
                                        <th>{t('notes.labels.created_by')}</th>
                                        <th>{t('notes.labels.note')}</th>
                                        <th className="text-right">{t('notes.labels.actions')}</th>
                                    </tr>
                                    {notes.data?.map((note) => (
                                        <tr key={note.id}>
                                            <td className="td-narrow nowrap">{note.id}</td>
                                            <td className="nowrap">{note.created_at_locale}</td>
                                            <td className="nowrap text-primary">{note.employee.email}</td>
                                            <td>
                                                {note.description?.split('\n').map((line: string, index) => (
                                                    <div key={index} className="td-text">
                                                        {line}
                                                    </div>
                                                ))}
                                            </td>
                                            <td className="text-right">
                                                {note.employee.identity_address === identity.address ? (
                                                    <div className="td-drawn">
                                                        <button
                                                            className="button button-default button-icon"
                                                            onClick={() => onDeleteNote(note)}>
                                                            <div className="mdi mdi-delete-outline" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span>-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {notes?.meta.last_page > 1 && (
                <div className="card-section">
                    <Paginator meta={notes.meta} filters={filters.values} updateFilters={filters.update} />
                </div>
            )}

            {notes.meta.total == 0 && (
                <div className="card-section">
                    <div className="block block-empty text-center">
                        <div className="empty-title">Geen notites</div>
                    </div>
                </div>
            )}
        </div>
    );
}
