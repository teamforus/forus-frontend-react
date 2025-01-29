import React, { Fragment, useContext, useMemo } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useOrganizationService } from '../../../services/OrganizationService';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useTranslate from '../../../hooks/useTranslate';
import useFormBuilder from '../../../hooks/useFormBuilder';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushApiError from '../../../hooks/usePushApiError';
import { ResponseError } from '../../../props/ApiResponses';
import { mainContext } from '../../../contexts/MainContext';
import useSetProgress from '../../../hooks/useSetProgress';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import InfoBox from '../../elements/info-box/InfoBox';
import FormGroup from '../../elements/forms/controls/FormGroup';
import FormGroupInfo from '../../elements/forms/elements/FormGroupInfo';
import { capitalize } from 'lodash';
import { currencyFormat, numberFormat } from '../../../helpers/string';

export default function OrganizationsTranslations() {
    const activeOrganization = useActiveOrganization();
    const { setOrganizationData } = useContext(mainContext);

    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const organizationService = useOrganizationService();

    const stats = useMemo(() => {
        return activeOrganization?.translations_usage;
    }, [activeOrganization?.translations_usage]);

    const form = useFormBuilder(
        {
            translations_enabled: activeOrganization?.translations_enabled,
            translations_daily_limit: activeOrganization?.translations_daily_limit,
            translations_weekly_limit: activeOrganization?.translations_weekly_limit,
            translations_monthly_limit: activeOrganization?.translations_monthly_limit,
        },
        () => {
            setProgress(0);

            organizationService
                .update(activeOrganization.id, form.values)
                .then((res) => {
                    setOrganizationData(activeOrganization.id, {
                        translations_enabled: res.data.data.translations_enabled,
                        translations_daily_limit: res.data.data.translations_daily_limit,
                        translations_weekly_limit: res.data.data.translations_weekly_limit,
                        translations_monthly_limit: res.data.data.translations_monthly_limit,
                    });
                    pushSuccess('Opgeslagen!');
                    form.setErrors(null);
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data.errors);
                    pushApiError(err);
                })
                .finally(() => {
                    form.setIsLocked(false);
                    setProgress(100);
                });
        },
    );

    // Memoized calculations
    const costDiff = useMemo(() => {
        const formLimit = form.values?.translations_monthly_limit;
        const orgLimit = activeOrganization?.translations_monthly_limit;
        const pricePerMill = activeOrganization?.translations_price_per_mill;

        if (!formLimit || !orgLimit || !pricePerMill) {
            return {
                isSameLimit: true,
                baseCost: 0,
                differenceCost: 0,
            };
        }

        const isSameLimit = formLimit === orgLimit;
        const baseCost = (formLimit / 1_000_000) * pricePerMill;
        const differenceCost = (Math.abs(formLimit - orgLimit) / 1_000_000) * pricePerMill;

        return { isSameLimit, baseCost, differenceCost };
    }, [
        form.values?.translations_monthly_limit,
        activeOrganization?.translations_monthly_limit,
        activeOrganization?.translations_price_per_mill,
    ]);

    return (
        <Fragment>
            <div className="card">
                <form className="form" onSubmit={form.submit}>
                    <div className="card-header">
                        <div className="card-title">{translate('organization_translations.title')}</div>
                    </div>
                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-lg-9 col-xs-12">
                                <FormGroup
                                    inline={true}
                                    inlineSize={'lg'}
                                    label={'Vertalingen inschakelen'}
                                    error={form.errors?.translations_enabled}
                                    input={(id) => (
                                        <Fragment>
                                            <CheckboxControl
                                                id={id}
                                                disabled={!activeOrganization.allow_translations}
                                                checked={!!form.values.translations_enabled}
                                                onChange={(e) =>
                                                    form.update({ translations_enabled: e.target.checked })
                                                }
                                                title={'Automatische vertaalfunctie inschakelen voor uw organisatie'}
                                            />
                                            <InfoBox iconPosition={'top'} type={'primary'}>
                                                <p>
                                                    Door dit vakje aan te vinken, staat u automatische vertalingen toe
                                                    voor de webshops van uw organisatie. Nadat u deze optie heeft
                                                    ingeschakeld, gaat u naar de configuratiepagina van elke webshop om
                                                    de vertaalfunctionaliteit in te schakelen en de talen te selecteren
                                                    die u wilt ondersteunen.
                                                </p>
                                            </InfoBox>
                                        </Fragment>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-lg-9 col-xs-12">
                                <FormGroup
                                    inline={true}
                                    inlineSize={'lg'}
                                    label={'Daglimiet'}
                                    error={form.errors?.translations_daily_limit}
                                    input={(id) => (
                                        <FormGroupInfo
                                            info={
                                                <Fragment>
                                                    Stel een quotalimiet in symbolen in voor dagelijks gebruik om de
                                                    dagelijkse kosten te beheersen.
                                                </Fragment>
                                            }>
                                            <input
                                                id={id}
                                                type={'number'}
                                                className="form-control"
                                                disabled={!activeOrganization.allow_translations}
                                                defaultValue={form.values.translations_daily_limit || ''}
                                                placeholder="Daglimiet"
                                                onChange={(e) => {
                                                    form.update({ translations_daily_limit: parseInt(e.target.value) });
                                                }}
                                            />
                                        </FormGroupInfo>
                                    )}
                                />
                                <FormGroup
                                    inline={true}
                                    inlineSize={'lg'}
                                    label={'Weeklimiet'}
                                    error={form.errors?.translations_weekly_limit}
                                    input={(id) => (
                                        <FormGroupInfo
                                            info={
                                                <Fragment>
                                                    Stel een quotalimiet in symbolen in voor wekelijks gebruik om te
                                                    voorkomen dat u uw budget overschrijdt.
                                                </Fragment>
                                            }>
                                            <input
                                                id={id}
                                                type={'number'}
                                                className="form-control"
                                                disabled={!activeOrganization.allow_translations}
                                                defaultValue={form.values.translations_weekly_limit || ''}
                                                placeholder="Weeklimiet"
                                                onChange={(e) => {
                                                    form.update({
                                                        translations_weekly_limit: parseInt(e.target.value),
                                                    });
                                                }}
                                            />
                                        </FormGroupInfo>
                                    )}
                                />
                                <FormGroup
                                    inline={true}
                                    inlineSize={'lg'}
                                    label={'Maandlimiet'}
                                    error={form.errors?.translations_monthly_limit}
                                    input={(id) => (
                                        <FormGroupInfo
                                            info={
                                                <Fragment>
                                                    Stel een quotalimiet in symbolen in voor maandelijks gebruik om
                                                    overschrijding van kosten te voorkomen.
                                                </Fragment>
                                            }>
                                            <input
                                                id={id}
                                                type={'number'}
                                                className="form-control"
                                                disabled={!activeOrganization.allow_translations}
                                                defaultValue={form.values.translations_monthly_limit || ''}
                                                placeholder="Maandlimiet"
                                                max={activeOrganization.translations_monthly_limit_max}
                                                onChange={(e) => {
                                                    form.update({
                                                        translations_monthly_limit: parseInt(e.target.value),
                                                    });
                                                }}
                                            />
                                        </FormGroupInfo>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-primary">
                        <InfoBox iconPosition={'top'} type={'primary'}>
                            <p>
                                <strong>Belangrijke opmerking over vertaalquota en kosten</strong>
                            </p>
                            <p>
                                Bij het inschakelen van de automatische vertaalfunctie voor uw organisatie, dient u zich
                                ervan bewust te zijn dat hogere quotabeperkingen (dagelijks, wekelijks en maandelijks)
                                mogelijk kunnen leiden tot hogere kosten. Het is belangrijk om uw gebruik en
                                quotainstellingen te monitoren, zodat deze in lijn blijven met uw budget en
                                kostverwachtingen.
                            </p>
                            <p>
                                Houd er rekening mee dat als de quotalimiet wordt overschreden, er geen vertalingen meer
                                zullen worden gegenereerd en de originele, onvertaalde tekst zal worden weergegeven,
                                indien deze nog niet is gegenereerd.
                            </p>
                            <p>
                                Door deze functie in te schakelen, stemt u ermee in deze instellingen verantwoord te
                                beheren, waarbij u begrijpt dat het overschrijden van quota kan leiden tot extra kosten.
                            </p>
                            <br />
                            <p>
                                <strong>Voorbeeld en Gebruik</strong>
                            </p>
                            <p>
                                {costDiff.isSameLimit
                                    ? 'Huidige geschatte maandelijkse kostlimiet is: '
                                    : 'Nieuwe geschatte maandelijkse kostlimiet is: '}
                                <strong>
                                    {currencyFormat(costDiff.baseCost)}
                                    {!costDiff.isSameLimit && (
                                        <span className={'text-muted-dark'}>
                                            {form.values?.translations_monthly_limit >
                                            activeOrganization?.translations_monthly_limit
                                                ? ` (${currencyFormat(costDiff.differenceCost)}) meer`
                                                : ` (${currencyFormat(costDiff.differenceCost)}) minder`}
                                        </span>
                                    )}
                                </strong>
                            </p>
                            <p>
                                {costDiff.isSameLimit ? 'Huidig gebruik: ' : 'Nieuw gebruik: '}
                                <strong>
                                    {`${numberFormat(parseInt(stats.month.total.symbols))}/${numberFormat(form.values.translations_monthly_limit || 0)} symbolen`}
                                    {` (${((parseInt(stats.month.total.symbols) / form.values.translations_monthly_limit || 0) * 100).toFixed(2)}%)`}
                                </strong>
                            </p>
                        </InfoBox>
                    </div>
                    <div className="card-section card-section-primary">
                        <div className="text-center">
                            <StateNavLink name={'organizations'} className="button button-default" id="cancel">
                                {translate('organization_translations.buttons.cancel')}
                            </StateNavLink>
                            <button className="button button-primary" type="submit">
                                {translate('organization_translations.buttons.submit')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {stats && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">{translate('organization_translations.title_statistics')}</div>
                    </div>
                    <div className="card-section card-section-primary">
                        <div className="row block block-markdown">
                            <div className="col col-xs-12 col-sm-6 col-md-4">
                                <h4 className={'text-strong'}> Today</h4>
                                <ul className={'text-medium'}>
                                    <li>Characters Used: {numberFormat(parseInt(stats?.day?.total?.symbols))}</li>
                                    <li className="text-semibold">
                                        <span className="text-semibold">Calculation:</span>{' '}
                                        {currencyFormat(parseInt(stats?.day?.total?.symbols)) +
                                            ' / ' +
                                            currencyFormat(activeOrganization?.translations_daily_limit)}
                                        <ul style={{ margin: '0 0' }}>
                                            {Object.keys(stats?.day?.count_per_type).map((key) => {
                                                const type = stats?.day?.count_per_type[key];
                                                return (
                                                    <li key={key}>
                                                        <span className="text-semibold">{capitalize(key) + 's'}:</span>{' '}
                                                        {type.symbols.toLocaleString()} or ~ {type.cost}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </li>
                                    <li className="text-semibold">Cost estimation: {stats?.day?.total?.cost}</li>
                                </ul>
                            </div>
                            <div className="col col-xs-12 col-sm-6 col-md-4">
                                <h4 className={'text-strong'}>This week</h4>
                                <ul className={'text-medium'}>
                                    <li className="text-semibold">
                                        Characters Used: {numberFormat(parseInt(stats?.week?.total?.symbols))}
                                    </li>
                                    <li>
                                        <span className="text-semibold">Calculation:</span>{' '}
                                        {currencyFormat(parseInt(stats?.week?.total?.symbols)) +
                                            ' / ' +
                                            currencyFormat(activeOrganization?.translations_weekly_limit)}
                                        <ul style={{ margin: '0 0' }}>
                                            {Object.keys(stats?.week?.count_per_type).map((key) => {
                                                const type = stats?.week?.count_per_type[key];
                                                return (
                                                    <li key={key}>
                                                        <span className="text-semibold">{capitalize(key) + 's'}:</span>{' '}
                                                        {type.symbols.toLocaleString()} or ~ {type.cost}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </li>
                                    <li className="text-semibold">Cost estimation: {stats?.week?.total?.cost}</li>
                                </ul>
                            </div>
                            <div className="col col-xs-12 col-sm-6 col-md-4">
                                <h4 className={'text-strong'}>This month</h4>
                                <ul className={'text-medium'}>
                                    <li className="text-semibold">
                                        Characters Used: {numberFormat(parseInt(stats?.month?.total?.symbols))}
                                    </li>
                                    <li>
                                        <span className="text-semibold">Calculation:</span>{' '}
                                        {currencyFormat(parseInt(stats?.month?.total?.symbols)) +
                                            ' / ' +
                                            currencyFormat(activeOrganization?.translations_monthly_limit)}
                                        <ul style={{ margin: '0 0' }}>
                                            {Object.keys(stats?.month?.count_per_type).map((key) => {
                                                const type = stats?.month?.count_per_type[key];
                                                return (
                                                    <li key={key}>
                                                        <span className="text-semibold">{capitalize(key) + 's'}:</span>{' '}
                                                        {type.symbols.toLocaleString()} or ~ {type.cost}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </li>
                                    <li className="text-semibold">Cost estimation: {stats?.month?.total?.cost}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
