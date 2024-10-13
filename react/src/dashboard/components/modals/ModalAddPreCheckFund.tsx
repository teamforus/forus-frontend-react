import React, { useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import classNames from 'classnames';
import useFormBuilder from '../../hooks/useFormBuilder';
import Organization from '../../props/models/Organization';
import { ResponseError } from '../../props/ApiResponses';
import FormError from '../elements/forms/errors/FormError';
import Fund from '../../props/models/Fund';
import { useFundService } from '../../services/FundService';
import SelectControl from '../elements/select-control/SelectControl';
import FormGroupInfo from '../elements/forms/elements/FormGroupInfo';
import SelectControlOptionsFund from '../elements/select-control/templates/SelectControlOptionsFund';

export default function ModalAddPreCheckFund({
    modal,
    funds,
    fund_id,
    activeOrganization,
    onDone,
    onError,
}: {
    modal: ModalState;
    funds: Array<Fund>;
    fund_id?: number;
    activeOrganization: Organization;
    onDone?: () => void;
    onError?: (err: ResponseError) => void;
}) {
    const fundService = useFundService();

    const [disableOptions] = useState([
        { value: false, label: 'Nee' },
        { value: true, label: 'Ja' },
    ]);

    const form = useFormBuilder<{
        fund_id?: number;
        pre_check_note?: string;
        pre_check_excluded?: boolean;
    }>(
        {
            fund_id: fund_id || funds[0]?.id,
            pre_check_note: '',
            pre_check_excluded: true,
        },
        ({ fund_id, pre_check_excluded, pre_check_note }) => {
            fundService
                .updatePreCheckSettings(activeOrganization.id, fund_id, { pre_check_excluded, pre_check_note })
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
                        onError?.(err);
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
                                    info={`Naam van het fonds dat te dienen worden uitgesloten of dat een afwijkend resultaat dient te hebben.`}>
                                    <SelectControl
                                        className="form-control inline-filter-control"
                                        disabled={!!fund_id}
                                        propKey={'id'}
                                        propValue={'name'}
                                        options={funds}
                                        value={form.values.fund_id}
                                        onChange={(fund_id: number) => form.update({ fund_id })}
                                        optionsComponent={SelectControlOptionsFund}
                                    />
                                </FormGroupInfo>

                                <FormError error={form.errors?.fund_id} />
                            </div>
                        </div>

                        <div className="form-group form-group-inline form-group-inline-md">
                            <label className="form-label form-label-required">Uitgesloten</label>
                            <div className="form-offset">
                                <FormGroupInfo info={`De optie om een fonds mee te nemen in de pre-check resultaten.`}>
                                    <SelectControl
                                        className="form-control inline-filter-control"
                                        propKey={'value'}
                                        propValue={'label'}
                                        options={disableOptions}
                                        value={form.values.pre_check_excluded}
                                        onChange={(pre_check_excluded: boolean) => form.update({ pre_check_excluded })}
                                    />
                                </FormGroupInfo>

                                <FormError error={form.errors?.pre_check_excluded} />
                            </div>
                        </div>

                        <div className="form-group form-group-inline form-group-inline-md">
                            <label className="form-label form-label-required">Uitleg</label>
                            <div className="form-offset">
                                <textarea
                                    className="form-control"
                                    placeholder="Add description"
                                    value={form.values.pre_check_note}
                                    onChange={(e) => form.update({ pre_check_note: e.target.value })}
                                />

                                <FormError error={form.errors?.pre_check_note} />
                            </div>
                        </div>

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
                <div className="modal-footer text-center">
                    <button
                        type="button"
                        className="button button-default"
                        disabled={form.isLoading}
                        onClick={modal.close}>
                        Annuleren
                    </button>
                    <div className="flex flex-grow" />
                    <button className="button button-primary" disabled={form.isLoading} type="submit">
                        {form.isLoading && <em className="mdi mdi-loading mdi-spin icon-start" />}
                        Bevestigen
                    </button>
                </div>
            </form>
        </div>
    );
}
