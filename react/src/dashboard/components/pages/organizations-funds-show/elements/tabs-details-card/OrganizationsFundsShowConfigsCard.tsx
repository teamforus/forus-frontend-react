import React, { Fragment } from 'react';
import Fund from '../../../../../props/models/Fund';
import CheckboxControl from '../../../../elements/forms/controls/CheckboxControl';
import useFormBuilder from '../../../../../hooks/useFormBuilder';
import FormGroup from '../../../../elements/forms/elements/FormGroup';
import FormError from '../../../../elements/forms/errors/FormError';
import { useFundService } from '../../../../../services/FundService';
import { ResponseError } from '../../../../../props/ApiResponses';
import usePushSuccess from '../../../../../hooks/usePushSuccess';
import useSetProgress from '../../../../../hooks/useSetProgress';
import usePushApiError from '../../../../../hooks/usePushApiError';

export default function OrganizationsFundsShowConfigsCard({
    fund,
    setFund,
}: {
    fund: Fund;
    setFund: React.Dispatch<React.SetStateAction<Fund>>;
}) {
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const fundService = useFundService();

    const form = useFormBuilder<{
        allow_custom_amounts: boolean;
        allow_custom_amounts_validator: boolean;
        allow_preset_amounts: boolean;
        allow_preset_amounts_validator: boolean;
        custom_amount_min: string;
        custom_amount_max: string;
        amount_presets: Array<{ id?: number; name?: string; amount?: string }>;
    }>(
        {
            allow_custom_amounts: fund.allow_custom_amounts,
            allow_preset_amounts: fund.allow_preset_amounts,
            allow_custom_amounts_validator: fund.allow_custom_amounts_validator,
            allow_preset_amounts_validator: fund.allow_preset_amounts_validator,
            custom_amount_min: fund.custom_amount_min || '',
            custom_amount_max: fund.custom_amount_max || '',
            amount_presets: fund.amount_presets,
        },
        ({
            allow_custom_amounts,
            allow_preset_amounts,
            allow_custom_amounts_validator,
            allow_preset_amounts_validator,
            custom_amount_min,
            custom_amount_max,
            amount_presets,
        }) => {
            setProgress(0);
            form.setErrors(null);

            fundService
                .update(fund.organization_id, fund.id, {
                    allow_custom_amounts,
                    allow_preset_amounts,
                    allow_custom_amounts_validator,
                    allow_preset_amounts_validator,
                    ...(allow_preset_amounts || allow_preset_amounts_validator
                        ? { amount_presets: amount_presets }
                        : {}),
                    ...(allow_custom_amounts || allow_custom_amounts_validator
                        ? { custom_amount_min, custom_amount_max }
                        : {}),
                })
                .then((res) => {
                    pushSuccess('Opgeslagen!');
                    setFund(res.data.data);
                    form.update({
                        allow_custom_amounts: res.data.data.allow_custom_amounts,
                        allow_preset_amounts: res.data.data.allow_preset_amounts,
                        allow_custom_amounts_validator: res.data.data.allow_custom_amounts_validator,
                        allow_preset_amounts_validator: res.data.data.allow_preset_amounts_validator,
                        custom_amount_min: res.data.data.custom_amount_min || '',
                        custom_amount_max: res.data.data.custom_amount_max || '',
                        amount_presets: res.data.data.amount_presets,
                    });
                })
                .catch((err: ResponseError) => {
                    pushApiError(err);
                    form.setErrors(err.data.errors);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    return (
        <Fragment>
            <form className={'card-section card-section-primary'} id={'fund_config_form'} onSubmit={form.submit}>
                <div className={'form flex flex-vertical flex-gap'}>
                    <div className={'block block-fund-amounts'}>
                        <div className="fund-amounts-section">
                            <div className="fund-amounts-details">
                                <div className="fund-amounts-title">Vaste bedragen</div>
                                <div className="fund-amounts-description">
                                    Met deze instellingen kunnen vaste bedragen aan- en uitgezet worden voor zelf in te
                                    stellen categorieën. Als de instelling voor vaste bedragen op de uitbetalingen
                                    pagina actief is, worden de vooraf ingestelde bedragen beschikbaar voor medewerkers
                                    met toegang tot deze pagina. Wanneer de instelling voor vaste bedragen bij het
                                    beoordelen van aanvragen ingeschakeld is, kan de beoordelaar tijdens de beoordeling
                                    kiezen uit de vooraf ingestelde categorieën, gebaseerd op de gegevens uit de
                                    aanvraag.
                                </div>
                            </div>
                            <div className="fund-amounts-controls">
                                <CheckboxControl
                                    narrow={true}
                                    checked={!!form.values.allow_preset_amounts}
                                    onChange={(e) => form.update({ allow_preset_amounts: e.target.checked })}
                                    title={'Vaste bedragen toestaan op de uitbetalingen pagina'}
                                />
                                <CheckboxControl
                                    narrow={true}
                                    checked={!!form.values.allow_preset_amounts_validator}
                                    onChange={(e) => form.update({ allow_preset_amounts_validator: e.target.checked })}
                                    title={'Vaste bedragen toestaan bij het beoordelen van aanvragen'}
                                />
                            </div>
                        </div>
                        {(form.values.allow_preset_amounts || form.values.allow_preset_amounts_validator) && (
                            <div className="fund-amounts-section">
                                {form.values.amount_presets.map((preset, index) => (
                                    <div className="row" key={index}>
                                        <div className="col col-xs-12 col-sm-6 form-group form-group-last">
                                            {index === 0 && <div className="form-label">Naam van categorie</div>}
                                            <input
                                                type="text"
                                                className={'form-control'}
                                                placeholder={`Naam van categorie #${index + 1}`}
                                                value={preset.name || ''}
                                                onChange={(e) => {
                                                    form.values.amount_presets[index].name = e.target.value;
                                                    form.update({ amount_presets: [...form.values.amount_presets] });
                                                }}
                                            />
                                            <FormError error={form.errors?.[`amount_presets.${index}.name`]} />
                                        </div>
                                        <div className="col col-xs-12 col-sm-6">
                                            {index === 0 && <div className="form-label">Bedrag</div>}
                                            <div className="flex flex-gap flex-gap-lg">
                                                <input
                                                    min={'.2'}
                                                    step={'.01'}
                                                    type="number"
                                                    className={'form-control'}
                                                    placeholder={`Bedrag #${index + 1}`}
                                                    value={preset.amount || ''}
                                                    onChange={(e) => {
                                                        form.values.amount_presets[index].amount = e.target.value;
                                                        form.update({
                                                            amount_presets: [...form.values.amount_presets],
                                                        });
                                                    }}
                                                />
                                                <button
                                                    type={'button'}
                                                    className="button button-default button-icon button-flat"
                                                    onClick={() => {
                                                        form.values.amount_presets.splice(index, 1);
                                                        form.update({
                                                            amount_presets: [...form.values.amount_presets],
                                                        });
                                                    }}>
                                                    <em className="mdi mdi-close" />
                                                </button>
                                            </div>
                                            <FormError error={form.errors?.[`amount_presets.${index}.amount`]} />
                                        </div>
                                    </div>
                                ))}

                                {form.values.amount_presets.length > 0 && <div className="fund-amounts-separator" />}

                                <button
                                    type={'button'}
                                    className={'button button-primary'}
                                    onClick={() => {
                                        form.update({
                                            amount_presets: [...form.values.amount_presets, { name: '', amount: '' }],
                                        });
                                    }}>
                                    <em className="mdi mdi-plus icon-start" />
                                    Voeg een categorie toe
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={'block block-fund-amounts'}>
                        <div className="fund-amounts-section">
                            <div className="fund-amounts-details">
                                <div className="fund-amounts-title">Vrije bedragen</div>
                                <div className="fund-amounts-description">
                                    Met deze instellingen kunnen vrije bedragen aan- en uitgezet worden. Wanneer de
                                    optie voor vrije bedragen op de uitbetalingenpagina actief is, kunnen bedragen vrij
                                    worden ingevoerd, zolang deze binnen de ingestelde minimum- en maximumlimieten
                                    blijven. Als de optie voor vrije bedragen bij het beoordelen van aanvragen is
                                    ingeschakeld, kan de beoordelaar tijdens de beoordeling zelf een bedrag invoeren,
                                    eveneens binnen de vastgestelde limieten.
                                </div>
                            </div>
                            <div className="fund-amounts-controls">
                                <CheckboxControl
                                    narrow={true}
                                    checked={!!form.values.allow_custom_amounts}
                                    onChange={(e) => form.update({ allow_custom_amounts: e.target.checked })}
                                    title={'Vrije bedragen toestaan op de uitbetalingen pagina'}
                                />
                                <CheckboxControl
                                    narrow={true}
                                    checked={!!form.values.allow_custom_amounts_validator}
                                    onChange={(e) => form.update({ allow_custom_amounts_validator: e.target.checked })}
                                    title={'Vrije bedragen toestaan bij het beoordelen van aanvragen'}
                                />
                            </div>
                        </div>

                        {(form.values.allow_custom_amounts || form.values.allow_custom_amounts_validator) && (
                            <div className="fund-amounts-section">
                                <div className="row">
                                    <FormGroup
                                        label={'Minimaal bedrag'}
                                        className={'col col-xs-12 col-sm-6 form-group-last'}
                                        input={(id) => (
                                            <input
                                                id={id}
                                                min={'.2'}
                                                step={'.01'}
                                                type="number"
                                                className={'form-control'}
                                                placeholder={'Minimaal bedrag'}
                                                value={form.values.custom_amount_min || ''}
                                                onChange={(e) => form.update({ custom_amount_min: e.target.value })}
                                            />
                                        )}
                                        error={form.errors?.custom_amount_min}
                                    />
                                    <FormGroup
                                        label={'Maximaal bedrag'}
                                        className={'col col-xs-12 col-sm-6 form-group-last'}
                                        input={(id) => (
                                            <input
                                                id={id}
                                                min={'.2'}
                                                step={'.01'}
                                                type="number"
                                                className={'form-control'}
                                                placeholder={'Maximaal bedrag'}
                                                value={form.values.custom_amount_max || ''}
                                                onChange={(e) => form.update({ custom_amount_max: e.target.value })}
                                            />
                                        )}
                                        error={form.errors?.custom_amount_max}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </form>
            <div className="card-footer flex flex-end">
                <button type={'submit'} form={'fund_config_form'} className="button button-primary">
                    Bevestigen
                </button>
            </div>
        </Fragment>
    );
}
