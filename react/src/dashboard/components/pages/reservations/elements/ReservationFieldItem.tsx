import React, { Fragment, useCallback, useState } from 'react';
import ReservationField from '../../../../props/models/ReservationField';
import { ResponseErrorData } from '../../../../props/ApiResponses';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import FormError from '../../../elements/forms/errors/FormError';
import FormGroupInfo from '../../../elements/forms/elements/FormGroupInfo';
import SelectControl from '../../../elements/select-control/SelectControl';
import SelectControlOptions from '../../../elements/select-control/templates/SelectControlOptions';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useTranslate from '../../../../hooks/useTranslate';

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
                <div className="question-body">
                    <div className="form">
                        <div className="form-group">
                            <label className="form-label form-label-required">
                                {translate('reservation_settings.labels.label')}
                            </label>
                            <FormGroupInfo
                                info={
                                    <Fragment>
                                        <h4>Voeg een juist label toe</h4>
                                        <p>
                                            Vul voor het label een passende tekst toe. Het label geeft aan om wat voor
                                            een reservering het gaat.
                                        </p>
                                    </Fragment>
                                }>
                                <input
                                    className="form-control"
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => {
                                        field.label = e.target.value;
                                        onChange([...fields]);
                                    }}
                                    placeholder={translate('reservation_settings.labels.label')}
                                />
                            </FormGroupInfo>
                            <div className="form-hint">Max. 200 tekens</div>
                            <FormError error={errors['fields.' + index + '.label']} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{translate('reservation_settings.labels.description')}</label>
                            <FormGroupInfo
                                info={
                                    <Fragment>
                                        <h4>Voeg een beschrijving toe</h4>
                                        <p>
                                            Geef in de beschrijving aan wat dient te worden ingevuld tijdens het maken
                                            van een reservering.
                                        </p>
                                    </Fragment>
                                }>
                                <textarea
                                    className="form-control r-n"
                                    value={field.description}
                                    onChange={(e) => {
                                        field.description = e.target.value;
                                        onChange([...fields]);
                                    }}
                                    placeholder={translate('reservation_settings.labels.description')}
                                />
                            </FormGroupInfo>
                            <div className="form-hint">Max. 1000 tekens</div>
                            <FormError error={errors['fields.' + index + '.description']} />
                        </div>

                        <div className="form-group">
                            <label className="form-label form-label-required">
                                {translate('reservation_settings.labels.type')}
                            </label>

                            <FormGroupInfo
                                info={
                                    <Fragment>
                                        <h4>Kies de juiste instelling</h4>
                                        <p>
                                            Geef aan of het om een tekstveld gaat of dat er een nummer dient te worden
                                            ingevuld.
                                        </p>
                                    </Fragment>
                                }>
                                <SelectControl
                                    className="form-control"
                                    propKey={'key'}
                                    allowSearch={false}
                                    value={field.type}
                                    onChange={(value: 'number' | 'text') => {
                                        field.type = value;
                                        onChange([...fields]);
                                    }}
                                    options={types}
                                    optionsComponent={SelectControlOptions}
                                />
                            </FormGroupInfo>

                            <FormError error={errors['fields.' + index + '.type']} />
                        </div>
                        <div className="form-group">
                            <label className="checkbox checkbox-narrow" htmlFor={`required_${index}`}>
                                <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => {
                                        field.required = e.target.checked;
                                        onChange([...fields]);
                                    }}
                                    id={`required_${index}`}
                                />
                                <div className="checkbox-label">
                                    <div className="checkbox-box">
                                        <div className="mdi mdi-check" />
                                    </div>
                                    {translate('reservation_settings.labels.required')}
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
