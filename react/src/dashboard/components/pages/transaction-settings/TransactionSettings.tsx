import React, { Fragment, useMemo, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import useFormBuilder from '../../../hooks/useFormBuilder';
import { useOrganizationService } from '../../../services/OrganizationService';
import { ResponseError } from '../../../props/ApiResponses';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import SelectControl from '../../elements/select-control/SelectControl';

export default function TransactionSettings() {
    const activeOrganization = useActiveOrganization();

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();

    const organizationService = useOrganizationService();

    const [showExampleTooltip, setShowExampleTooltip] = useState<boolean>(false);

    const [testData] = useState({
        bank_transaction_id: '#12345',
        bank_transaction_date: '2024-01-01',
        bank_transaction_time: '00:00:00',
        bank_reservation_number: '#12345678',
        bank_branch_number: '112233445566',
        bank_branch_id: '6789',
        bank_branch_name: 'Voorbeeld van een vestigingsnaam',
        bank_fund_name: 'Fondsnaam',
        bank_note: 'Voorbeeld van een notitie van een medewerker',
    });

    const [separatorOptions] = useState([
        { key: '-', value: '-' },
        { key: '/', value: '/' },
        { key: '+', value: '+' },
        { key: ':', value: ':' },
        { key: '--', value: '--' },
        { key: '//', value: '//' },
        { key: '++', value: '++' },
        { key: '::', value: '::' },
    ]);

    const form = useFormBuilder(activeOrganization.bank_statement_details, (values) => {
        organizationService
            .updateBankFields(activeOrganization.id, values)
            .then(() => pushSuccess('Opgeslagen!'))
            .catch((e: ResponseError) => pushDanger('Mislukt!', e?.data.message || 'Onbekende foutmelding.'))
            .finally(() => form.setIsLocked(false));
    });

    const statementExample = useMemo(() => {
        return [
            form.values.bank_transaction_id ? testData.bank_transaction_id : null,
            form.values.bank_transaction_date ? testData.bank_transaction_date : null,
            form.values.bank_transaction_time ? testData.bank_transaction_time : null,
            form.values.bank_reservation_number ? testData.bank_reservation_number : null,
            form.values.bank_branch_number ? testData.bank_branch_number : null,
            form.values.bank_branch_id ? testData.bank_branch_id : null,
            form.values.bank_branch_name ? testData.bank_branch_name : null,
            form.values.bank_fund_name ? testData.bank_fund_name : null,
            form.values.bank_note ? testData.bank_note : null,
        ]
            .filter((value) => value)
            .join(` ${form.values.bank_separator} `);
    }, [testData, form.values]);

    return (
        <Fragment>
            <div className="card">
                <form className="form" onSubmit={form.submit}>
                    <div className="card-header">
                        <div className="card-title">Betaalopdrachten instellingen</div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-xs-12 col-md-12">
                                <div className="form-group form-group-inline form-group-inline-xl">
                                    <label className="form-label">Select data</label>
                                    <div className="form-offset flex flex-vertical">
                                        <CheckboxControl
                                            id="bank_transaction_id"
                                            title="Transactie ID"
                                            checked={!!form.values?.bank_transaction_id}
                                            onChange={(e) => form.update({ bank_transaction_id: e.target.checked })}
                                        />
                                        <CheckboxControl
                                            id="bank_transaction_date"
                                            title="Transactie Datum"
                                            checked={!!form.values?.bank_transaction_date}
                                            onChange={(e) => form.update({ bank_transaction_date: e.target.checked })}
                                        />
                                        <CheckboxControl
                                            id="bank_transaction_time"
                                            title="Transactie Tijd"
                                            checked={!!form.values?.bank_transaction_time}
                                            onChange={(e) => form.update({ bank_transaction_time: e.target.checked })}
                                        />
                                        <CheckboxControl
                                            id="bank_reservation_number"
                                            title="Reserveringsnummer"
                                            checked={!!form.values?.bank_reservation_number}
                                            onChange={(e) => form.update({ bank_reservation_number: e.target.checked })}
                                        />
                                        <CheckboxControl
                                            id="bank_branch_number"
                                            title="Vestigingsnummer"
                                            checked={!!form.values?.bank_branch_number}
                                            onChange={(e) => form.update({ bank_branch_number: e.target.checked })}
                                        />
                                        <CheckboxControl
                                            id="bank_branch_id"
                                            title="Vestiging ID"
                                            checked={!!form.values?.bank_branch_id}
                                            onChange={(e) => form.update({ bank_branch_id: e.target.checked })}
                                        />
                                        <CheckboxControl
                                            id="bank_branch_name"
                                            title="Vestigingsnaam"
                                            checked={!!form.values?.bank_branch_name}
                                            onChange={(e) => form.update({ bank_branch_name: e.target.checked })}
                                        />
                                        <CheckboxControl
                                            id="bank_fund_name"
                                            title="Fondsnaam"
                                            checked={!!form.values?.bank_fund_name}
                                            onChange={(e) => form.update({ bank_fund_name: e.target.checked })}
                                        />
                                        <CheckboxControl
                                            id="bank_note"
                                            title="Notitie"
                                            checked={!!form.values?.bank_note}
                                            onChange={(e) => form.update({ bank_note: e.target.checked })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group form-group-inline form-group-inline-xl">
                                    <label className="form-label">Scheidingsteken</label>
                                    <div className="form-offset flex flex-vertical">
                                        <SelectControl
                                            className="form-control"
                                            propValue={'value'}
                                            propKey={'key'}
                                            allowSearch={false}
                                            value={form.values?.bank_separator}
                                            onChange={(bank_separator: string) => form.update({ bank_separator })}
                                            options={separatorOptions}
                                            optionsComponent={SelectControlOptions}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-xs-12 col-md-12">
                                <div className="form-group form-group-inline form-group-inline-xl">
                                    <label className="form-label">Voorbeeld omschrijving bankafschrift</label>

                                    <div className="form-offset">
                                        <div className="form-group-info form-group-info-dashed">
                                            <div className="form-group-info-control">
                                                <input
                                                    type="text"
                                                    disabled={true}
                                                    className="form-control"
                                                    value={statementExample}
                                                />

                                                <div className="form-group-info-button">
                                                    <div
                                                        className="button button-default button-icon pull-left"
                                                        onClick={() => setShowExampleTooltip(!showExampleTooltip)}>
                                                        <em className="mdi mdi-information" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-hint">
                                            De omschrijving op het bankafschrift kan maximaal 140 karakters bevatten.
                                        </div>

                                        <div className="form-hint form-hint-margin-less">
                                            Fondsnaam, Vestgingsnaam en Notitie worden afgekort indien het limiet van
                                            140 karakters is overschreden
                                        </div>

                                        {showExampleTooltip && (
                                            <div className="block block-info block-info-list">
                                                <div className="block-info-list-title">
                                                    <em className="mdi mdi-information block-info-icon" />
                                                    Gegevens gebruikt in het voorbeeld:
                                                </div>

                                                <ul className="block-info-list-items">
                                                    <li className="block-info-list-item">
                                                        Transactie ID:
                                                        <span className="block-info-list-item-value">
                                                            {testData.bank_transaction_id} • 10 karakters
                                                        </span>
                                                    </li>

                                                    <li className="block-info-list-item">
                                                        Transactiedatum:
                                                        <span className="block-info-list-item-value">
                                                            {testData.bank_transaction_date} • 10 karakters
                                                        </span>
                                                    </li>

                                                    <li className="block-info-list-item">
                                                        Transactietijd:
                                                        <span className="block-info-list-item-value">
                                                            {testData.bank_transaction_time} • 8 karakters
                                                        </span>
                                                    </li>

                                                    <li className="block-info-list-item">
                                                        Reserveringsnummer:
                                                        <span className="block-info-list-item-value">
                                                            {testData.bank_reservation_number} • 9 karakters
                                                        </span>
                                                    </li>

                                                    <li className="block-info-list-item">
                                                        Vestigingsnummer:
                                                        <span className="block-info-list-item-value">
                                                            {testData.bank_branch_number} • 12 karakters
                                                        </span>
                                                    </li>

                                                    <li className="block-info-list-item">
                                                        Vestiging ID:
                                                        <span className="block-info-list-item-value">
                                                            {testData.bank_branch_id} • 3-20 karakters
                                                        </span>
                                                    </li>

                                                    <li className="block-info-list-item">
                                                        Vestigingsnaam:
                                                        <span className="block-info-list-item-value">
                                                            {testData.bank_branch_name} • 3-100 karakters
                                                        </span>
                                                    </li>

                                                    <li className="block-info-list-item">
                                                        Fondsnaam:
                                                        <span className="block-info-list-item-value">
                                                            {testData.bank_fund_name} • 3-100 karakters
                                                        </span>
                                                    </li>

                                                    <li className="block-info-list-item">
                                                        Notitie:
                                                        <span className="block-info-list-item-value">
                                                            {testData.bank_note} • 255 karakters
                                                        </span>
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="text-center">
                            <StateNavLink
                                name={'transactions'}
                                params={{ organizationId: activeOrganization.id }}
                                className="button button-default">
                                Annuleer
                            </StateNavLink>

                            <button type="submit" className="button button-primary">
                                Bevestigen
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Fragment>
    );
}
