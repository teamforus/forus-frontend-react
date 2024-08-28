import React, { useMemo } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import classNames from 'classnames';
import FormGroup from '../elements/forms/controls/FormGroup';
import SelectControl from '../elements/select-control/SelectControl';
import useFormBuilder from '../../hooks/useFormBuilder';
import CheckboxControl from '../elements/forms/controls/CheckboxControl';
import FundRequest from '../../props/models/FundRequest';
import { ModalButton } from './elements/ModalButton';
import { strLimit } from '../../helpers/string';
import Organization from '../../props/models/Organization';
import { useFundRequestValidatorService } from '../../services/FundRequestValidatorService';
import { ResponseError } from '../../props/ApiResponses';

type AmountType = 'formula' | 'custom' | 'predefined';

export default function ModalApproveFundRequest({
    modal,
    onDone,
    onError,
    fundRequest,
    activeOrganization,
}: {
    modal: ModalState;
    onDone?: () => void;
    onError?: (err: ResponseError) => void;
    fundRequest: FundRequest;
    activeOrganization: Organization;
}) {
    const fundRequestService = useFundRequestValidatorService();

    const amountOptions = useMemo(() => {
        return [
            fundRequest?.fund?.allow_custom_amounts_validator
                ? { key: 'custom', name: 'Vaste bedragen op basis van categorieën' }
                : null,
            fundRequest?.fund?.allow_preset_amounts_validator && fundRequest.fund?.amount_presets.length > 0
                ? { key: 'predefined', name: 'Vrij bedrag' }
                : null,
        ].filter((option) => option) as Array<{ key: AmountType; name: string }>;
    }, [fundRequest]);

    const amountValueOptions = useMemo(() => {
        const options = fundRequest?.fund?.allow_preset_amounts_validator ? fundRequest.fund?.amount_presets : [];

        return options.map((item) => ({
            ...item,
            label: `${item.name} ${item.amount_locale}`,
        }));
    }, [fundRequest]);

    const formula = useMemo(() => {
        return fundRequest.formula;
    }, [fundRequest.formula]);

    const form = useFormBuilder<{
        type: AmountType;
        amount: string;
        note?: string;
        fund_amount_preset_id?: number;
    }>(
        {
            type: formula?.items?.length > 0 ? 'formula' : amountOptions[0]?.key,
            amount: null,
            fund_amount_preset_id: amountValueOptions[0]?.id,
            note: null,
        },
        ({ type, amount, fund_amount_preset_id, note }) => {
            fundRequestService
                .approve(
                    activeOrganization.id,
                    fundRequest?.id,
                    type === 'formula'
                        ? { note }
                        : {
                              ...(type === 'predefined' ? { fund_amount_preset_id, note } : {}),
                              ...(type === 'custom' ? { amount, note } : {}),
                          },
                )
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
        <div className={classNames('modal', 'modal-lg', 'modal-animated', modal.loading && 'modal-loading')}>
            <div className="modal-backdrop" onClick={modal.close} />
            <form className="modal-window" onSubmit={form.submit}>
                <div className="modal-close mdi mdi-close" onClick={modal.close} />
                <div className="modal-header">
                    <div className="modal-title">Aanvraag keuren en te ontvangen zaken vaststellen</div>
                </div>
                <div className="modal-body form">
                    <div className="modal-section">
                        <div className="block block-approve-fund-request">
                            <div className="approve-request-title">
                                Weet u zeker dat u de gegevens wilt goedkeuren en dat de uit te keren tegoeden en
                                betalingen correct zijn?
                                <div className="approve-request-description">
                                    Een beoordeling kan niet ongedaan worden gemaakt en de aanvrager ontvangt bericht
                                    over het besluit.
                                </div>
                            </div>
                            {[...formula.items, ...formula.products].length > 0 && (
                                <div className="approve-request-formula">
                                    <div className="approve-request-formula-header">Rekenregels</div>
                                    <div className="approve-request-formula-body">
                                        <div className="table-wrapper">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Soort</th>
                                                        <th>Type</th>
                                                        <th>Ontvangt</th>
                                                        <th>Aantal</th>
                                                        <th className={'text-right'}>Resultaat</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[...formula.items, ...formula.products].map((item, index) => (
                                                        <tr key={index}>
                                                            <td>{item.record}</td>
                                                            <td>{item.type}</td>
                                                            <td title={item.value}>{strLimit(item.value)}</td>
                                                            <td>{item.count}</td>
                                                            <td className={'text-right'} title={item.total}>
                                                                {strLimit(item.total)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="approve-request-formula-footer">
                                        {formula.products.length > 0 && (
                                            <div className="approve-request-formula-totals">
                                                <div className="approve-request-formula-totals-label">
                                                    Totaal aantal tegoeden
                                                </div>
                                                <div
                                                    className={classNames(
                                                        'approve-request-formula-totals-value',
                                                        form.values.type !== 'formula' &&
                                                            'text-line-through text-muted',
                                                    )}>
                                                    {formula.total_products}
                                                </div>
                                            </div>
                                        )}
                                        <div className="approve-request-formula-totals">
                                            <div className="approve-request-formula-totals-label">
                                                {amountOptions?.length > 0 && (
                                                    <CheckboxControl
                                                        className={classNames(
                                                            'checkbox-narrow',
                                                            'approve-request-formula-totals-checkbox',
                                                        )}
                                                        checked={form.values.type === 'formula'}
                                                        onChange={(e) => {
                                                            form.update({
                                                                type: e.target.checked
                                                                    ? 'formula'
                                                                    : amountOptions?.[0]?.key,
                                                            });
                                                        }}
                                                        title={
                                                            'Gebruik de berekende uitkomst op basis van de rekenregels.'
                                                        }
                                                    />
                                                )}
                                            </div>
                                            <div
                                                className={classNames(
                                                    'approve-request-formula-totals-value',
                                                    form.values.type !== 'formula' && 'text-line-through text-muted',
                                                )}>
                                                {formula.total_amount}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="form flex flex-vertical flex-gap">
                                {form.values.type !== 'formula' && (
                                    <div className="row">
                                        {amountOptions.length > 1 && (
                                            <div className="col col-xs-12 col-lg-6">
                                                <FormGroup
                                                    label={'Toewijzingsmethode'}
                                                    error={form.errors.type}
                                                    input={(id) => (
                                                        <SelectControl
                                                            id={id}
                                                            propKey={'key'}
                                                            propValue={'name'}
                                                            options={amountOptions}
                                                            value={form.values.type}
                                                            onChange={(type: AmountType) => form.update({ type })}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        )}
                                        <div
                                            className={classNames(
                                                'col col-xs-12',
                                                amountOptions.length > 1 ? 'col-lg-6' : 'col-lg-12',
                                            )}>
                                            <FormGroup
                                                label={
                                                    form.values.type === 'predefined'
                                                        ? 'Categorie en bedrag'
                                                        : 'Vrij bedrag'
                                                }
                                                error={form.errors.amount}
                                                input={(id) =>
                                                    form.values.type === 'predefined' ? (
                                                        <SelectControl
                                                            id={id}
                                                            propKey={'id'}
                                                            propValue={'label'}
                                                            options={amountValueOptions}
                                                            value={form.values.fund_amount_preset_id}
                                                            onChange={(amount_option_id: number) => {
                                                                form.update({
                                                                    fund_amount_preset_id: amount_option_id,
                                                                });
                                                            }}
                                                        />
                                                    ) : (
                                                        <input
                                                            id={id}
                                                            type={'number'}
                                                            className="form-control"
                                                            placeholder={'Amount'}
                                                            value={form.values.amount || ''}
                                                            step=".01"
                                                            min={fundRequest.fund.custom_amount_min}
                                                            max={fundRequest.fund.custom_amount_max}
                                                            onChange={(e) => form.update({ amount: e.target.value })}
                                                        />
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                <FormGroup
                                    label={'Voeg een notitie toe'}
                                    input={(id) => (
                                        <textarea
                                            id={id}
                                            value={form.values.note || ''}
                                            placeholder={'Notitie'}
                                            className={'form-control'}
                                            onChange={(e) => form.update({ note: e.target.value })}
                                        />
                                    )}
                                />
                            </div>
                            <div className="block block-info">
                                <em className="mdi mdi-information block-info-icon" />
                                Door middel van de bovenstaande instelling kunnen de uit te keren bedragen en/of
                                tegoeden worden vastgesteld.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer flex-horizontal flex-center">
                    <div className="button-groups">
                        <ModalButton button={{ onClick: modal.close }} text="Sluiten" type="default" />
                        <button type="submit" className={'button button-primary'}>
                            Bevestigen
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
