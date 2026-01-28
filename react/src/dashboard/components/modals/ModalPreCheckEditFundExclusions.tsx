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
import usePreCheckService from '../../services/PreCheckService';
import Implementation from '../../props/models/Implementation';
import FormGroup from '../elements/forms/elements/FormGroup';

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
                        <div className="form-group">
                            <label className="form-label form-label-required">Fonds</label>
                            <FormGroupInfo
                                error={form.errors?.fund_id}
                                info={
                                    <Fragment>
                                        De naam van de regeling (het fonds) waarvoor u wilt instellen of deze wordt
                                        meegenomen in de Regelingencheck.
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

                        <div className="form-group">
                            <label className="form-label form-label-required">Uitgesloten</label>

                            <FormGroupInfo
                                error={form.errors?.pre_check_excluded}
                                info={
                                    <Fragment>
                                        Geef aan of deze regeling moet worden uitgesloten van de Regelingencheck. Als u
                                        kiest voor Ja, worden er geen vragen gesteld over de voorwaarden van dit fonds
                                        en wordt het niet meegenomen in het eindadvies.
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

                        {!form.values.excluded && (
                            <FormGroup
                                required={true}
                                label="Uitleg"
                                error={form.errors['exclusion.note']}
                                input={(id) => (
                                    <textarea
                                        className="form-control"
                                        id={id}
                                        placeholder="Voeg omschrijving toe"
                                        value={form.values.note}
                                        onChange={(e) => form.update({ note: e.target.value })}
                                    />
                                )}
                            />
                        )}

                        <div className="form-group">
                            <div className="block block-info">
                                <em className="mdi mdi-information block-info-icon" />
                                Soms is het wenselijk dat een regeling niet wordt meegenomen in de Regelingencheck. Door
                                het fonds aan deze lijst toe te voegen, worden de bijbehorende voorwaarden niet getoond
                                aan de gebruiker en wordt de regeling niet meegenomen in het uiteindelijke advies.
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
