import React from 'react';
import FormGroup from '../../../elements/forms/elements/FormGroup';
import FormPane from '../../../elements/forms/elements/FormPane';
import InfoBox from '../../../elements/info-box/InfoBox';
import SelectControl from '../../../elements/select-control/SelectControl';
import CheckboxControl from '../../../elements/forms/controls/CheckboxControl';
import { ClarificationFormValues, Requirement } from '../types';

export default function ClarificationForm({
    values,
    errors,
    isEditing,
    onUpdate,
    onContinue,
    onCancel,
}: {
    values: ClarificationFormValues;
    errors: Partial<Record<keyof ClarificationFormValues, Array<string>>>;
    isEditing: boolean;
    onUpdate: (values: Partial<ClarificationFormValues>) => void;
    onContinue: () => void;
    onCancel: () => void;
}) {
    return (
        <form
            className="modal-window form"
            onSubmit={(e) => {
                e.preventDefault();
                onContinue();
            }}>
            <a className="mdi mdi-close modal-close" onClick={onCancel} role="button" />
            <div className="modal-icon">
                <div className="mdi mdi-message-text-outline" />
            </div>
            <div className="modal-body form">
                <div className="modal-section modal-section-pad flex flex-vertical flex-gap">
                    <div className="text-center">
                        <div className="modal-heading">Aanvullingsverzoek</div>
                        <div className="modal-text">
                            Vraag de aanvrager om extra informatie als de aanvraag incompleet of onduidelijk is. Voeg
                            een bericht toe aan dit verzoek.
                        </div>
                    </div>
                    <FormPane title={'Benodigde informatie'}>
                        <div className="row">
                            <div className="col col-xs-12 col-sm-6">
                                <FormGroup
                                    label={'Tekstuele uitleg'}
                                    error={errors.text_requirement}
                                    input={(id) => (
                                        <SelectControl
                                            id={id}
                                            propKey={'value'}
                                            propValue={'name'}
                                            value={values.text_requirement}
                                            options={[
                                                { name: 'Verplicht', value: 'required' },
                                                { name: 'Optioneel', value: 'optional' },
                                                { name: 'Niet nodig', value: 'no' },
                                            ]}
                                            onChange={(text_requirement: Requirement) => {
                                                return onUpdate({ text_requirement });
                                            }}
                                        />
                                    )}
                                />
                            </div>
                            <div className="col col-xs-12 col-sm-6">
                                <FormGroup
                                    label={'Uploaden bestand'}
                                    error={errors.files_requirement}
                                    input={(id) => (
                                        <SelectControl
                                            id={id}
                                            propKey={'value'}
                                            propValue={'name'}
                                            value={values.files_requirement}
                                            options={[
                                                { name: 'Verplicht', value: 'required' },
                                                { name: 'Optioneel', value: 'optional' },
                                                { name: 'Niet nodig', value: 'no' },
                                            ]}
                                            onChange={(files_requirement: Requirement) => {
                                                return onUpdate({ files_requirement });
                                            }}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </FormPane>
                    <FormPane title={'Aanvulverzoek'}>
                        <FormGroup
                            error={errors?.question}
                            input={(id) => (
                                <textarea
                                    id={id}
                                    className="form-control"
                                    value={values.question}
                                    onChange={(e) => onUpdate({ question: e.target.value })}
                                    placeholder="Bericht aan aanvrager"
                                />
                            )}
                        />
                    </FormPane>

                    {isEditing && (
                        <FormPane title={'Informeer de inwoner'}>
                            <CheckboxControl
                                title="Stuur de inwoner een nieuw bericht over deze wijziging."
                                checked={values.notify_requester}
                                onChange={(e) => {
                                    onUpdate({
                                        notify_requester: e.target.checked,
                                    });
                                }}
                            />
                        </FormPane>
                    )}

                    <InfoBox>
                        Gebruik deze functie om de aanvrager te vragen om extra informatie of documenten, zodat de
                        aanvraag alsnog beoordeeld kan worden. Geef aan wat bij de aanvraag nodig is. Een tekstuele
                        uitleg bij de aanvraag, een document dat ingevuld dient te worden en het bericht met de vraag
                        voor de aanvrager
                    </InfoBox>
                </div>
            </div>
            <div className="modal-footer text-center">
                <button type="button" className="button button-default" onClick={onCancel}>
                    Annuleer
                </button>
                <button type="submit" className="button button-primary">
                    Bevestigen
                </button>
            </div>
        </form>
    );
}
