import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useOrganizationService } from '../../../services/OrganizationService';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useTranslate from '../../../hooks/useTranslate';
import useFormBuilder from '../../../hooks/useFormBuilder';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushApiError from '../../../hooks/usePushApiError';
import { mainContext } from '../../../contexts/MainContext';
import useSetProgress from '../../../hooks/useSetProgress';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import InfoBox from '../../elements/info-box/InfoBox';
import FormGroup from '../../elements/forms/elements/FormGroup';
import FormGroupInfo from '../../elements/forms/elements/FormGroupInfo';
import { currencyFormat, numberFormat } from '../../../helpers/string';
import { dateFormat, dateParse } from '../../../helpers/dates';
import BlockLabelTabs from '../../elements/block-label-tabs/BlockLabelTabs';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { StringParam } from 'use-query-params';
import {
    endOfDay,
    endOfMonth,
    endOfWeek,
    endOfYear,
    format,
    startOfDay,
    startOfMonth,
    startOfWeek,
    startOfYear,
    subMonths,
    subWeeks,
} from 'date-fns';
import { ResponseError } from '../../../props/ApiResponses';
import { TranslationStats } from '../../../props/models/Organization';
import CardHeaderFilter from '../../elements/tables/elements/CardHeaderFilter';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import TranslationStatsTable from './elements/TranslationStatsTable';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import EmptyValue from '../../elements/empty-value/EmptyValue';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function OrganizationsTranslations() {
    const activeOrganization = useActiveOrganization();
    const { setOrganizationData } = useContext(mainContext);

    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const organizationService = useOrganizationService();

    const [stats, setStats] = useState<{ data: TranslationStats; current_month: TranslationStats }>(null);

    const dateOptions = useMemo(() => {
        const date = new Date();

        return [
            {
                value: 'today',
                label: `Vandaag`,
                dates: [dateFormat(startOfDay(date)), dateFormat(endOfDay(date))],
            },
            {
                value: 'week',
                label: `Deze week`,
                dates: [dateFormat(startOfWeek(date)), dateFormat(endOfWeek(date))],
            },
            {
                value: 'month',
                label: `Deze maand`,
                dates: [dateFormat(startOfMonth(date)), dateFormat(endOfMonth(date))],
            },
            {
                value: 'year',
                label: `Dit jaar`,
                dates: [dateFormat(startOfYear(date)), dateFormat(endOfYear(date))],
            },
            {
                value: 'last_week',
                label: `Vorige week`,
                dates: [dateFormat(startOfWeek(subWeeks(date, 1))), dateFormat(endOfWeek(subWeeks(date, 1)))],
            },
            {
                value: 'last_month',
                label: `Vorige maand`,
                dates: [dateFormat(startOfMonth(subMonths(date, 1))), dateFormat(endOfMonth(subMonths(date, 1)))],
            },
        ];
    }, []);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{ from: string; to: string }>(
        {
            from: dateFormat(startOfDay(new Date())),
            to: dateFormat(endOfDay(new Date())),
        },
        { queryParams: { from: StringParam, to: StringParam } },
    );

    const range = useMemo(() => {
        return dateOptions?.find(
            (option) => option.dates[0] === filterValues?.from && option.dates[1] === filterValues?.to,
        );
    }, [dateOptions, filterValues?.from, filterValues?.to]);

    const rangeLabel = useMemo(() => {
        let label: string;

        const to = filterValues?.to ? format(dateParse(filterValues?.to), 'd MMM, yyyy') : null;
        const from = filterValues?.from ? format(dateParse(filterValues?.from), 'd MMM, yyyy') : null;

        if (from && to) {
            label = from == to ? from : `${from} - ${to}`;
        } else {
            label = from ? from : to ? to : null;
        }

        return label ? `(${label})`.replaceAll('.', '') : label;
    }, [filterValues]);

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

    const fetchStats = useCallback(() => {
        setStats(null);

        organizationService
            .translationStats(activeOrganization?.id, { ...filterValuesActive })
            .then((res) => setStats(res.data))
            .catch((err: ResponseError) => pushApiError(err));
    }, [organizationService, activeOrganization?.id, filterValuesActive, pushApiError]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

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
                                            <InfoBox type={'primary'}>
                                                Door dit vakje aan te vinken, staat u automatische vertalingen toe voor
                                                de webshops van uw organisatie. Nadat u deze optie heeft ingeschakeld,
                                                gaat u naar de configuratiepagina van elke webshop om de
                                                vertaalfunctionaliteit in te schakelen en de talen te selecteren die u
                                                wilt ondersteunen.
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
                        <InfoBox type={'primary'}>
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
                                    {`${numberFormat(stats?.current_month?.total.symbols || 0)}/${numberFormat(form.values.translations_monthly_limit || 0)} symbolen`}
                                    {` (${(((stats?.current_month?.total.symbols || 0) / form.values.translations_monthly_limit || 0) * 100).toFixed(2)}%)`}
                                </strong>
                            </p>
                        </InfoBox>
                    </div>
                    <div className="card-section card-section-primary">
                        <div className="text-center">
                            <StateNavLink
                                name={DashboardRoutes.ORGANIZATIONS}
                                className="button button-default"
                                id="cancel">
                                {translate('organization_translations.buttons.cancel')}
                            </StateNavLink>
                            <button className="button button-primary" type="submit">
                                {translate('organization_translations.buttons.submit')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex flex-grow">
                        <div className="card-title">{translate('organization_translations.title_statistics')}</div>
                    </div>
                    <div className={'card-header-filters'}>
                        <div className="block block-inline-filters">
                            <BlockLabelTabs
                                value={range?.value}
                                setValue={(range) => {
                                    const option = dateOptions.find((option) => {
                                        return option.value === range;
                                    });

                                    if (option) {
                                        filterUpdate({ from: option?.dates[0], to: option?.dates[1] });
                                    }
                                }}
                                tabs={dateOptions}
                            />

                            <CardHeaderFilter filter={filter}>
                                <FilterItemToggle label={translate('transactions.labels.from')}>
                                    <DatePickerControl
                                        value={dateParse(filter.values.from)}
                                        placeholder={translate('jjjj-MM-dd')}
                                        onChange={(from: Date) => {
                                            filter.update({ from: dateFormat(from) });
                                        }}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('transactions.labels.to')}>
                                    <DatePickerControl
                                        value={dateParse(filter.values.to)}
                                        placeholder={translate('jjjj-MM-dd')}
                                        onChange={(to: Date) => {
                                            filter.update({ to: dateFormat(to) });
                                        }}
                                    />
                                </FilterItemToggle>
                            </CardHeaderFilter>
                        </div>
                    </div>
                </div>

                <div className="card-section card-section-primary">
                    <div className="block block-translation-stats">
                        <div className="translation-stats-col">
                            <div className="translation-stats-col-label">
                                Vertaalde symbolen
                                <div className="translation-stats-col-label-period">{`${range?.label} ${rangeLabel}`}</div>
                            </div>
                            <div className="translation-stats-col-value">
                                {stats?.data?.total?.symbols || stats?.data?.total?.symbols === 0 ? (
                                    numberFormat(stats?.data?.total?.symbols)
                                ) : (
                                    <EmptyValue />
                                )}
                            </div>
                        </div>
                        <div className="translation-stats-col">
                            <div className="translation-stats-col-label">
                                Kostenraming
                                <div className="translation-stats-col-label-period">{`${range?.label} ${rangeLabel}`}</div>
                            </div>
                            <div className="translation-stats-col-value">
                                {stats?.data?.total?.cost || <EmptyValue />}
                            </div>
                        </div>
                    </div>

                    <div className="card card-outline">
                        <div className="card-header">
                            <div className="card-title">{translate('translation_stats.header.title')}</div>
                        </div>
                        <div className="card-body">
                            {!stats ? <LoadingCard type={'card-section'} /> : <TranslationStatsTable stats={stats} />}
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
