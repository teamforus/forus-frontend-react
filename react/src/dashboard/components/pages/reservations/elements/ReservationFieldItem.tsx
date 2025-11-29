import React, { Fragment, useCallback, useState } from 'react';
import ReservationField from '../../../../props/models/ReservationField';
import { ResponseErrorData } from '../../../../props/ApiResponses';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import SelectControl from '../../../elements/select-control/SelectControl';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useTranslate from '../../../../hooks/useTranslate';
import FormGroup from '../../../elements/forms/elements/FormGroup';
import CheckboxControl from '../../../elements/forms/controls/CheckboxControl';
import FormPane from '../../../elements/forms/elements/FormPane';

type FieldsLocal = ReservationField & { expanded?: boolean };

export default function ReservationFieldItem({
    field,
    fields,
    onChange,
    errors,
    index,
    id,
}: {
    field: FieldsLocal;
    fields: Array<FieldsLocal>;
    onChange: React.Dispatch<React.SetStateAction<Array<FieldsLocal>>>;
    errors: ResponseErrorData;
    index: number;
    id: string;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();

    const [types] = useState([
        { key: 'text', name: 'Tekst' },
        { key: 'number', name: 'Nummer' },
        { key: 'boolean', name: 'Ja / Nee' },
        { key: 'file', name: 'Document upload' },
    ]);

    const [fillableByTypes] = useState([
        { key: 'provider', name: translate('reservation_settings.fillable_by.provider') },
        { key: 'requester', name: translate('reservation_settings.fillable_by.requester') },
    ]);

    const askConfirmation = useCallback(
        (onConfirm: () => void) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('modals.danger_zone.remove_reservation_field.title')}
                    description={translate('modals.danger_zone.remove_reservation_field.description')}
                    buttonCancel={{
                        text: translate('modals.danger_zone.remove_reservation_field.buttons.cancel'),
                        onClick: modal.close,
                    }}
                    buttonSubmit={{
                        text: translate('modals.danger_zone.remove_reservation_field.buttons.confirm'),
                        onClick: () => {
                            onConfirm();
                            modal.close();
                        },
                    }}
                />
            ));
        },
        [openModal, translate],
    );

    const removeField = useCallback(
        (index: number) => {
            askConfirmation(() => {
                fields.splice(index, 1);
                onChange([...fields]);
            });
        },
        [fields, onChange, askConfirmation],
    );

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div className="question-item" ref={setNodeRef} style={style}>
            <div className="question-header">
                <em className="mdi mdi-dots-vertical question-drag" {...attributes} {...listeners} />
                <div className="question-title">
                    {field.expanded ? (
                        <span>{!field.id ? 'Nieuw veld' : 'Veld aanpassen'}</span>
                    ) : (
                        <span>{field.label || 'Geen label'}</span>
                    )}
                </div>
                <div className="question-actions">
                    {field.expanded ? (
                        <div
                            className="button button-default button-sm"
                            onClick={() => {
                                field.expanded = false;
                                onChange([...fields]);
                            }}>
                            <em className="mdi mdi-arrow-collapse-vertical icon-start" />
                            {translate('reservation_settings.buttons.collapse')}
                        </div>
                    ) : (
                        <div
                            className="button button-primary button-sm"
                            onClick={() => {
                                field.expanded = true;
                                onChange([...fields]);
                            }}>
                            <em className="mdi mdi-arrow-expand-vertical icon-start" />
                            {translate('reservation_settings.buttons.expand')}
                        </div>
                    )}

                    <div className="button button-danger button-sm" onClick={() => removeField(index)}>
                        <em className="mdi mdi-trash-can-outline icon-start" />
                        {translate('reservation_settings.buttons.delete')}
                    </div>
                </div>
            </div>
            {field.expanded && (
                <div className="question-body form">
                    <FormPane title={'Beschrijving'}>
                        <FormGroup
                            label={translate('reservation_settings.labels.label')}
                            error={errors['fields.' + index + '.label']}
                            hint="Max. 200 tekens"
                            info={
                                <Fragment>
                                    <p className={'text-strong'}>Voeg een juist label toe</p>
                                    <p>
                                        Vul voor het label een passende tekst toe. Het label geeft aan om wat voor een
                                        reservering het gaat.
                                    </p>
                                </Fragment>
                            }
                            input={(id) => (
                                <Fragment>
                                    <input
                                        id={id}
                                        className="form-control"
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => {
                                            field.label = e.target.value;
                                            onChange([...fields]);
                                        }}
                                        placeholder={translate('reservation_settings.labels.label')}
                                    />
                                </Fragment>
                            )}
                        />

                        <FormGroup
                            label={translate('reservation_settings.labels.description')}
                            error={errors['fields.' + index + '.description']}
                            hint="Max. 1000 tekens"
                            info={
                                <Fragment>
                                    <p className={'text-strong'}>Voeg een beschrijving toe</p>
                                    <p>
                                        Geef in de beschrijving aan wat dient te worden ingevuld tijdens het maken van
                                        een reservering.
                                    </p>
                                </Fragment>
                            }
                            input={(id) => (
                                <textarea
                                    id={id}
                                    className="form-control r-n"
                                    value={field.description}
                                    onChange={(e) => {
                                        field.description = e.target.value;
                                        onChange([...fields]);
                                    }}
                                    placeholder={translate('reservation_settings.labels.description')}
                                />
                            )}
                        />

                        <FormGroup
                            label={translate('reservation_settings.labels.type')}
                            error={errors['fields.' + index + '.type']}
                            info={
                                <Fragment>
                                    <p className={'text-strong'}>Kies de juiste instelling</p>
                                    <p>
                                        Geef aan of het om een tekstveld gaat of dat er een nummer dient te worden
                                        ingevuld.
                                    </p>
                                </Fragment>
                            }
                            input={() => (
                                <SelectControl
                                    className="form-control"
                                    propKey={'key'}
                                    allowSearch={false}
                                    value={field.type}
                                    onChange={(value: 'number' | 'text' | 'boolean' | 'file') => {
                                        field.type = value;
                                        onChange([...fields]);
                                    }}
                                    options={types}
                                />
                            )}
                        />

                        <FormGroup
                            label={translate('reservation_settings.labels.fillable_by')}
                            error={errors['fields.' + index + '.fillable_by']}
                            info={
                                <Fragment>
                                    <p>Fillable by description</p>
                                </Fragment>
                            }
                            input={() => (
                                <SelectControl
                                    className="form-control"
                                    propKey={'key'}
                                    allowSearch={false}
                                    value={field.fillable_by}
                                    onChange={(value: 'requester' | 'provider') => {
                                        field.fillable_by = value;
                                        onChange([...fields]);
                                    }}
                                    options={fillableByTypes}
                                />
                            )}
                        />

                        <CheckboxControl
                            id={`required_${index}`}
                            checked={field.required}
                            onChange={(e) => {
                                field.required = e.target.checked;
                                onChange([...fields]);
                            }}
                            title={translate('reservation_settings.labels.required')}
                        />
                    </FormPane>
                </div>
            )}
        </div>
    );
}
