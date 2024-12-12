import React, { Fragment, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import classNames from 'classnames';
import useFormBuilder from '../../hooks/useFormBuilder';
import Organization from '../../props/models/Organization';
import { ResponseError } from '../../props/ApiResponses';
import Fund from '../../props/models/Fund';
import SelectControl from '../elements/select-control/SelectControl';
import FormGroupInfo from '../elements/forms/elements/FormGroupInfo';
import SelectControlOptionsFund from '../elements/select-control/templates/SelectControlOptionsFund';
import FormError from '../elements/forms/errors/FormError';
import usePreCheckService from '../../services/PreCheckService';
import Implementation from '../../props/models/Implementation';

export default function ModalPreCheckEditFundExclusions({
    modal,
    funds,
    fund,
    onDone,
    implementation,
    activeOrganization,
}: {
    modal: ModalState;
    funds: Array<Fund>;
    fund?: Fund;
    onDone?: () => void;
    implementation: Implementation;
    activeOrganization: Organization;
}) {
    const preCheckService = usePreCheckService();

    const [disableOptions] = useState([
        { value: false, label: 'Nee' },
        { value: true, label: 'Ja' },
    ]);

    const form = useFormBuilder<{
        note?: string;
        fund_id?: number;
        excluded?: boolean;
    }>(
        {
            note: fund?.pre_check_note || '',
            fund_id: fund?.id || funds[0]?.id,
            excluded: fund ? fund?.pre_check_excluded : true,
        },
        (values) => {
            preCheckService
                .sync(activeOrganization.id, implementation.id, { exclusion: values })
                .then(() => {
                    modal.close();
                    onDone?.();
                })
                .catch((err: ResponseError) => {
                    if (err.data.errors) {
                        form.setErrors(err.data.errors);
                        form.setIsLocked(false);
                    } else {
                        modal.close();
                    }
                });
        },
    );

    return (
        <div className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading')}>
            <div className="modal-backdrop" onClick={modal.close} />
            <form className="modal-window form" onSubmit={form.submit}>
                <div className="modal-close mdi mdi-close" onClick={modal.close} role="button" />
                <div className="modal-header">Fonds toevoegen</div>
                <div className="modal-body modal-body-visible">
                    <div className="modal-section">
                        <div className="form-group form-group-inline form-group-inline-md">
                            <label className="form-label form-label-required">Fonds</label>
                            <div className="form-offset">
                                <FormGroupInfo
                                    error={form.errors?.fund_id}
                                    info={
                                        <Fragment>
                                            Naam van het fonds dat te dienen worden uitgesloten of dat een afwijkend
                                            resultaat dient te hebben.
                                        </Fragment>
                                    }>
                                    <SelectControl
                                        className="form-control inline-filter-control"
                                        disabled={!!fund?.id}
                                        propKey={'id'}
                                        propValue={'name'}
                                        options={funds}
                                        value={form.values.fund_id}
                                        onChange={(fund_id: number) => form.update({ fund_id })}
                                        optionsComponent={SelectControlOptionsFund}
                                    />
                                </FormGroupInfo>
                            </div>
                        </div>

                        <div className="form-group form-group-inline form-group-inline-md">
                            <label className="form-label form-label-required">Uitgesloten</label>
                            <div className="form-offset">
                                <FormGroupInfo
                                    error={form.errors?.pre_check_excluded}
                                    info={
                                        <Fragment>
                                            De optie om een fonds mee te nemen in de pre-check resultaten.
                                        </Fragment>
                                    }>
                                    <SelectControl
                                        className="form-control inline-filter-control"
                                        propKey={'value'}
                                        propValue={'label'}
                                        options={disableOptions}
                                        value={form.values.excluded}
                                        onChange={(excluded: boolean) => form.update({ excluded })}
                                    />
                                </FormGroupInfo>
                            </div>
                        </div>

                        {!form.values.excluded && (
                            <div className="form-group form-group-inline form-group-inline-md">
                                <label className="form-label form-label-required">Uitleg</label>
                                <div className="form-offset">
                                    <textarea
                                        className="form-control"
                                        placeholder="Voeg omschrijving toe"
                                        value={form.values.note}
                                        onChange={(e) => form.update({ note: e.target.value })}
                                    />

                                    <FormError error={form.errors['exclusion.note']} />
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <div className="form-label" />
                            <div className="form-offset">
                                <div className="block block-info">
                                    <em className="mdi mdi-information block-info-icon" />
                                    Controleer de gegevens. Na het bevestigen is het fonds uitgesloten of heeft een
                                    afwijkend resultaat in de pre-check.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer flex flex-horizontal flex-space-between">
                    <button
                        type="button"
                        className="button button-default"
                        disabled={form.isLoading}
                        onClick={modal.close}>
                        Annuleren
                    </button>
                    <button className="button button-primary" disabled={form.isLoading} type="submit">
                        {form.isLoading && <em className="mdi mdi-loading mdi-spin icon-start" />}
                        Bevestigen
                    </button>
                </div>
            </form>
        </div>
    );
}
