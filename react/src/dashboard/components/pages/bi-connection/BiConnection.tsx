import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import BiConnectionIcon from '../../../../../assets/forus-platform/resources/platform-general/assets/img/svg/bi-connection-icon.svg';
import useFormBuilder from '../../../hooks/useFormBuilder';
import Auth2FARestriction from '../../elements/auth2fa-restriction/Auth2FARestriction';
import SelectControl from '../../elements/select-control/SelectControl';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import FormError from '../../elements/forms/errors/FormError';
import { useBiConnectionService } from '../../../services/BiConnectionService';
import { chunk } from 'lodash';
import ModalDangerZone from '../../modals/ModalDangerZone';
import useOpenModal from '../../../hooks/useOpenModal';
import usePushSuccess from '../../../hooks/usePushSuccess';
import BiConnectionDataType from '../../../props/models/BiConnectionDataType';
import { StringParam } from 'use-query-params';
import useTranslate from '../../../hooks/useTranslate';
import useAuthIdentity2FAState from '../../../hooks/useAuthIdentity2FAState';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { ResponseError } from '../../../props/ApiResponses';
import useSetProgress from '../../../hooks/useSetProgress';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import InfoBox from '../../elements/info-box/InfoBox';
import FormGroupInfo from '../../elements/forms/elements/FormGroupInfo';
import BlockLabelTabs from '../../elements/block-label-tabs/BlockLabelTabs';
import usePushApiError from '../../../hooks/usePushApiError';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function BiConnection() {
    const auth2FAState = useAuthIdentity2FAState();
    const auth2faRestricted = useMemo(() => auth2FAState?.restrictions?.bi_connections?.restricted, [auth2FAState]);
    const activeOrganization = useActiveOrganization();

    const openModal = useOpenModal();
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const biConnectionService = useBiConnectionService();

    const [ip, setIp] = useState<string>('');
    const [ips, setIps] = useState<Array<{ value: string }>>(null);
    const [ipError, setIpError] = useState<string>('');
    const [headerKey] = useState<string>('X-API-KEY');
    const [dataTypes, setDataTypes] = useState(null);
    const [connection, setConnection] = useState(null);
    const [availableDataTypes, setAvailableDataTypes] = useState<Array<Array<BiConnectionDataType>>>(null);

    const [viewTypes] = useState<Array<'settings' | 'security'>>(['settings', 'security']);

    const [filterValues, , filtersUpdate] = useFilterNext<{
        view_type: 'settings' | 'security';
    }>({ view_type: 'settings' }, { queryParams: { view_type: StringParam }, throttledValues: ['view_type'] });

    const [authTypes] = useState([
        { value: 0, name: translate('bi_connection.labels.option_disabled') },
        { value: 1, name: translate('bi_connection.labels.option_enabled') },
    ]);

    const [expirationPeriods] = useState([
        { value: 1, name: translate('bi_connection.expiration_periods.24_hour') },
        { value: 7, name: translate('bi_connection.expiration_periods.1_week') },
        { value: 30, name: translate('bi_connection.expiration_periods.1_month') },
    ]);

    const form = useFormBuilder<{
        enabled: 0 | 1;
        expiration_period?: number;
    }>(
        {
            enabled: 0,
            expiration_period: 1,
        },
        (values) => {
            const formData = {
                ips: ips.map((ip) => ip.value),
                data_types: Object.keys(dataTypes).filter((key) => dataTypes[key]),
                ...values,
            };

            const promise = connection?.id
                ? biConnectionService.update(activeOrganization.id, formData)
                : biConnectionService.store(activeOrganization.id, formData);

            setProgress(0);

            promise
                .then((res) => {
                    setConnection(res.data.data);
                    form.setErrors(null);
                    pushSuccess('Opgeslagen!');
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data.errors);
                    const errorKeys = Object.keys(form.errors);

                    const hasIpsErrors = errorKeys.filter((key) => key.startsWith('ips')).length > 0;
                    const hasDataTypesErrors = errorKeys.filter((key) => key.startsWith('data_types')).length > 0;
                    const hasExpirationPeriodErrors =
                        errorKeys.filter((key) => key.startsWith('expiration_period')).length > 0;

                    if (hasDataTypesErrors) {
                        filtersUpdate({ view_type: 'settings' });
                    } else if (hasIpsErrors || hasExpirationPeriodErrors) {
                        filtersUpdate({ view_type: 'security' });
                    }

                    pushApiError(err);
                })
                .finally(() => {
                    setIpError(null);
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    const { update: updateForm } = form;

    const askConfirmation = useCallback(
        (onConfirm: () => void) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('modals.danger_zone.recreate_bi_connection.title')}
                    description={translate('modals.danger_zone.recreate_bi_connection.description')}
                    buttonCancel={{
                        text: translate('modals.danger_zone.recreate_bi_connection.buttons.cancel'),
                        onClick: modal.close,
                    }}
                    buttonSubmit={{
                        text: translate('modals.danger_zone.recreate_bi_connection.buttons.confirm'),
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

    const resetToken = useCallback(() => {
        setProgress(0);

        askConfirmation(() => {
            biConnectionService
                .resetToken(activeOrganization.id)
                .then((res) => {
                    setConnection(res.data.data);
                    pushSuccess('Opgeslagen!');
                })
                .catch(pushApiError)
                .finally(() => setProgress(100));
        });
    }, [setProgress, activeOrganization.id, askConfirmation, biConnectionService, pushApiError, pushSuccess]);

    const addIp = useCallback(() => {
        if (!ip) {
            return setIpError('Het IP veld is verplicht.');
        }

        ips.push({ value: ip });
        setIp('');
        setIps([...ips]);
        setIpError(null);
    }, [ip, ips]);

    const removeIp = useCallback(
        (index: number) => {
            ips.splice(index, 1);
            setIps([...ips]);
        },
        [ips],
    );

    const fetchBiConnection = useCallback(() => {
        setProgress(0);

        biConnectionService
            .active(activeOrganization.id)
            .then((res) => {
                const data = res.data?.data?.id ? res.data?.data : null;

                setConnection(data);
                setIps((data?.ips || []).reduce((items, ip) => [...items, { value: ip }], []));
                setDataTypes((data?.data_types || []).reduce((types, type) => ({ ...types, [type]: true }), {}));

                if (data?.id) {
                    updateForm({
                        enabled: data.enabled ? 1 : 0,
                        expiration_period: data.expiration_period,
                    });
                }
            })
            .finally(() => setProgress(100));
    }, [setProgress, activeOrganization.id, biConnectionService, updateForm]);

    const fetchAvailableDataTypes = useCallback(() => {
        setProgress(0);

        biConnectionService
            .availableDataTypes(activeOrganization.id)
            .then((res) => setAvailableDataTypes(chunk(res.data.data, 2)))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, biConnectionService, setProgress]);

    useEffect(() => {
        if (auth2FAState?.restrictions?.bi_connections?.restricted) {
            return;
        }

        fetchBiConnection();
    }, [auth2FAState, fetchBiConnection]);

    useEffect(() => {
        if (auth2FAState?.restrictions?.bi_connections?.restricted) {
            return;
        }

        fetchAvailableDataTypes();
    }, [auth2FAState, fetchAvailableDataTypes]);

    if (!auth2FAState) {
        return <LoadingCard />;
    }

    if (auth2FAState && auth2faRestricted) {
        return (
            <Auth2FARestriction
                type={'bi_connections'}
                items={auth2FAState?.restrictions?.bi_connections?.funds}
                itemName={'name'}
                itemThumbnail={'logo.sizes.thumbnail'}
                defaultThumbnail={'fund-thumbnail'}
            />
        );
    }
    return (
        <Fragment>
            <div className="card">
                <div className="card-section">
                    <div className="block block-bi-info">
                        <div className="bi-info-icon">
                            <BiConnectionIcon />
                        </div>

                        <div className="bi-info-content">
                            <div className="block block-markdown">
                                <h4>Verbind uw BI-tools om toegang te krijgen tot uitgebreide statistische gegevens</h4>
                                <p>
                                    Configureer onderstaande URL in de BI-tool. Hiermee krijgt u toegang tot de gegevens
                                    uit het platform. Stuur een verzoek en de gevraagde gegevens worden verstuurd.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <form className="form" onSubmit={form.submit}>
                    <div className="card-header">
                        <div className="card-title flex flex-grow">{translate('bi_connection.title')}</div>
                        <BlockLabelTabs
                            value={filterValues.view_type}
                            setValue={(type: 'settings' | 'security') => filtersUpdate({ view_type: type })}
                            tabs={viewTypes.map((type) => ({
                                label: translate(`bi_connection.tabs.${type}`),
                                value: type,
                            }))}
                        />
                    </div>

                    {filterValues.view_type === 'settings' && (
                        <div className="card-section card-section-primary">
                            <div className="row">
                                <div className="col col-md-10 col-md-offset-2 col-xs-12">
                                    <div className="form-group">
                                        <div className="form-label">{translate('bi_connection.labels.enabled')}</div>

                                        <FormGroupInfo
                                            error={form.errors?.enabled}
                                            info={
                                                <Fragment>
                                                    <h4>Kies de juiste instelling</h4>
                                                    <p>
                                                        Vul bij de header bovenstaande naam en sleutelcode in. Voor het
                                                        instellen van de token zijn er twee opties:
                                                    </p>
                                                    <ul></ul>
                                                    <ul>
                                                        <li>
                                                            URL-parameter: Kies deze optie als uw BI-tool token
                                                            ondersteunt. Voeg de token toe als een parameter in de URL
                                                        </li>
                                                        <li>
                                                            Header: Kies deze optie als uw BI-tool header ondersteunt.
                                                            Voeg de token toe in de header
                                                        </li>
                                                    </ul>
                                                </Fragment>
                                            }>
                                            <SelectControl
                                                className="form-control"
                                                propKey={'value'}
                                                value={form.values.enabled}
                                                options={authTypes}
                                                allowSearch={false}
                                                onChange={(enabled: 0 | 1) => form.update({ enabled })}
                                            />
                                        </FormGroupInfo>
                                    </div>

                                    {form && !!form.values.enabled && (
                                        <Fragment>
                                            <div className="form-group">
                                                <div className="form-label">
                                                    {translate('bi_connection.labels.url')}
                                                </div>

                                                <FormGroupInfo
                                                    dashed={true}
                                                    copyShow={true}
                                                    copyValue={activeOrganization.bi_connection_url}
                                                    copyDisable={!connection?.access_token}
                                                    info={
                                                        <p>
                                                            Dit is de URL voor het exporteren van gegevens. Kopieer deze
                                                            naar de BI-tool.
                                                        </p>
                                                    }>
                                                    <input
                                                        type={'text'}
                                                        className="form-control form-control-dashed"
                                                        disabled={!connection?.access_token}
                                                        defaultValue={activeOrganization.bi_connection_url}
                                                        readOnly={true}
                                                    />
                                                </FormGroupInfo>
                                            </div>

                                            <div className="form-group">
                                                <div className="form-label">
                                                    {translate('bi_connection.labels.data_types')}
                                                </div>

                                                <div className="checkbox-container-compact">
                                                    {availableDataTypes?.map((types, index: number) => (
                                                        <div className="row" key={index}>
                                                            {types.map((type, index: number) => (
                                                                <div className="col col-xs-12 col-lg-6" key={index}>
                                                                    <CheckboxControl
                                                                        id={`data_type_name_${type.key}`}
                                                                        className="checkbox-compact"
                                                                        title={type.name}
                                                                        checked={!!dataTypes[type.key]}
                                                                        onChange={(e) => {
                                                                            dataTypes[type.key] = e.target.checked;
                                                                            setDataTypes({ ...dataTypes });
                                                                        }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ))}
                                                    <FormError error={form.errors?.data_types} />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <div className="form-label">
                                                    {translate('bi_connection.labels.header_name')}
                                                </div>

                                                <FormGroupInfo
                                                    dashed={true}
                                                    copyShow={true}
                                                    copyValue={headerKey}
                                                    info={
                                                        <p>
                                                            Dit is de naam van de key die wordt gebruikt voor de
                                                            verificatie van verzoeken. Kopieer en plak deze waarde in de{' '}
                                                            {'"key"'} waarde van de header {'"X-API-KEY"'} in de
                                                            BI-tool.
                                                        </p>
                                                    }>
                                                    <input
                                                        type={'text'}
                                                        className="form-control form-control-dashed"
                                                        defaultValue={headerKey}
                                                        readOnly={true}
                                                    />
                                                </FormGroupInfo>
                                            </div>

                                            <div className="form-group">
                                                <div className="form-label">
                                                    {translate('bi_connection.labels.header_key')}
                                                </div>

                                                <FormGroupInfo
                                                    dashed={true}
                                                    copyShow={true}
                                                    copyValue={connection?.access_token}
                                                    copyDisable={!connection?.access_token}
                                                    info={
                                                        <p>
                                                            Dit is de waarde van de X-API-KEY key header, die wordt
                                                            gebruikt als token voor verificatie van verzoeken. Het is
                                                            mogelijk om het handmatig te regenereren en de vervalperiode
                                                            in te stellen op het tabblad {'"Beveilging"'}. Kopieer deze
                                                            waarde en plak het in het veld {'"value"'} van de header{' '}
                                                            {'"X-API-KEY"'} in de BI-tool.
                                                        </p>
                                                    }>
                                                    <input
                                                        type={'text'}
                                                        className="form-control form-control-dashed"
                                                        disabled={!connection?.access_token}
                                                        value={connection?.access_token || ''}
                                                        placeholder={translate(
                                                            'bi_connection.labels.token_placeholder',
                                                        )}
                                                        readOnly={true}
                                                    />
                                                </FormGroupInfo>
                                            </div>

                                            {connection?.id && (
                                                <div className="form-group">
                                                    <div className="form-label" />
                                                    <button
                                                        type="button"
                                                        className="button button-default button-sm"
                                                        onClick={() => resetToken()}>
                                                        <em className="mdi mdi-refresh icon-start" />
                                                        {translate('bi_connection.buttons.generate_new_key')}
                                                    </button>

                                                    {!connection?.expired && (
                                                        <div className="expiration-value">
                                                            {`Verloopt ${connection?.expire_after_locale}`}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {connection?.expired && (
                                                <div className="form-group">
                                                    <div className="form-label">&nbsp;</div>

                                                    <div className="block block-info-box block-warning-box block-info-box-dashed">
                                                        <em className="info-box-icon mdi mdi-alert-outline" />

                                                        <div className="info-box-content">
                                                            <div className="block block-markdown">
                                                                <p>Token verlopen. Genereer een nieuwe.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="form-group">
                                                <div className="form-label">&nbsp;</div>

                                                <InfoBox>
                                                    <h4>Gegevens exporteren naar de BI-tool</h4>
                                                    <ul>
                                                        <li>Open de BI-tool en ga naar instellingen.</li>
                                                        <li>
                                                            Voeg een nieuwe gegevensbron of verbinding toe en selecteer
                                                            de optie om verbinding te maken met een externe URL.
                                                        </li>
                                                        <li>Voer de bovenstaande URL in.</li>
                                                        <li>Vul bij de header bovenstaande naam en sleutelcode in.</li>
                                                    </ul>
                                                </InfoBox>
                                            </div>
                                        </Fragment>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {filterValues.view_type === 'security' && (
                        <div className="card-section card-section-primary">
                            <div className="row">
                                <div className="col col-md-10 col-md-offset-2 col-xs-12">
                                    <div className="form-group">
                                        <div className="form-label">
                                            {translate('bi_connection.labels.expiration_period')}
                                        </div>

                                        <FormGroupInfo
                                            error={form.errors?.expiration_period}
                                            info={
                                                <p>
                                                    Kies een vervalperiode voor het authenticatietoken. Nadat het token
                                                    is verlopen, moet het opnieuw worden gegenereerd door te klikken op{' '}
                                                    {'"Vernieuwen"'}.
                                                </p>
                                            }>
                                            <SelectControl
                                                className="form-control"
                                                propKey={'value'}
                                                value={form.values.expiration_period}
                                                options={expirationPeriods}
                                                allowSearch={false}
                                                onChange={(expiration_period: number) => {
                                                    form.update({ expiration_period });
                                                }}
                                            />
                                        </FormGroupInfo>
                                    </div>

                                    <div className="form-group">
                                        <div className="form-label">IP-adressen op de witte lijst</div>

                                        {ips?.map((ipItem, index: number) => (
                                            <div className="form-group" key={index}>
                                                <div className="form-group-info">
                                                    <div className="form-group-info-control">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={ipItem.value}
                                                            placeholder={`${translate('bi_connection.labels.ip')} ${
                                                                index + 1
                                                            }`}
                                                            onChange={(e) => {
                                                                setIps((ips) => {
                                                                    ips[index].value = e.target.value;
                                                                    return [...ips];
                                                                });
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="form-group-info-button">
                                                        <div
                                                            className="button button-default button-icon pull-left"
                                                            onClick={() => removeIp(index)}>
                                                            <em className="mdi mdi-trash-can-outline" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <FormError error={form.errors?.[`ips.${index}`]} />

                                                {index == ips?.length - 1 && (
                                                    <div className="flex-row">
                                                        <div className="flex-col">
                                                            <div className="form-group-divider" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        <div className="form-group">
                                            <div className="flex-row">
                                                <div className="flex-col flex-grow">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={ip}
                                                        onChange={(e) => setIp(e.target.value)}
                                                        placeholder={`${translate('bi_connection.labels.ip')} ${
                                                            ips?.length + 1
                                                        }`}
                                                    />
                                                </div>
                                                <div className="flex-col">
                                                    <div className="button button-primary nowrap" onClick={addIp}>
                                                        IP-adres toevoegen
                                                    </div>
                                                </div>
                                            </div>
                                            <FormError error={ipError} />
                                            <FormError error={form.errors?.ips} />
                                        </div>

                                        <div className="form-group">
                                            <InfoBox>
                                                Het whitelisten van IP-adressen is een veiligheidsmaatregel om de lijst
                                                van gebruikers te beperken die gegevens van het account kunnen
                                                downloaden. Bij het gebruik van een zelf gehoste BI-tool of handmatige
                                                gegevensexport, vraag dan de IT-afdeling om het IP-adres. Bij het
                                                gebruik van een BI-tool als SaaS-product is het whitelisten van
                                                IP-adressen niet van toepassing.
                                            </InfoBox>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="card-section">
                        <div className="button-group flex-center">
                            <StateNavLink
                                id="cancel"
                                name={DashboardRoutes.ORGANIZATIONS}
                                className={'button button-default'}>
                                {translate('bi_connection.buttons.cancel')}
                            </StateNavLink>

                            <button type="submit" className="button button-primary">
                                {translate('bi_connection.buttons.submit')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Fragment>
    );
}
