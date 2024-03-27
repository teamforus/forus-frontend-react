import React, { ChangeEvent, Fragment, useCallback, useEffect, useRef, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useFormBuilder from '../../../hooks/useFormBuilder';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import FormError from '../../elements/forms/errors/FormError';
import useSetProgress from '../../../hooks/useSetProgress';
import { ResponseError } from '../../../props/ApiResponses';
import { useParams } from 'react-router-dom';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import Tooltip from '../../elements/tooltip/Tooltip';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import SelectControl from '../../elements/select-control/SelectControl';

export default function FundBackofficeEdit() {
    const { id } = useParams();

    const { t } = useTranslation();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();

    const [fund, setFund] = useState<Fund>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [isConfigured, setIsConfigured] = useState(false);
    const [showInfoBlock, setShowInfoBlock] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [showPolicyInfoBlock, setShowPolicyInfoBlock] = useState(false);

    const fileInput = useRef(null);

    const [fallbackOptions] = useState([
        { value: true, label: 'Geen foutmelding' },
        { value: false, label: 'Foutmelding bij API downtime' },
    ]);

    const [ineligiblePolicyOptions] = useState([
        { value: 'fund_request', label: 'Make fund request through platform' },
        { value: 'redirect', label: 'Redirect to URL' },
    ]);

    const form = useFormBuilder<{
        backoffice_enabled: boolean;
        backoffice_url?: string;
        backoffice_key?: string;
        backoffice_certificate?: string;
        backoffice_fallback: boolean;
        backoffice_ineligible_policy?: string;
        backoffice_ineligible_redirect_url?: string;
    }>(
        {
            backoffice_enabled: false,
            backoffice_url: '',
            backoffice_key: '',
            backoffice_certificate: '',
            backoffice_fallback: true,
            backoffice_ineligible_policy: 'fund_request',
            backoffice_ineligible_redirect_url: '',
        },
        (values) => {
            setProgress(0);

            fundService
                .backofficeUpdate(activeOrganization.id, fund.id, values)
                .then((res) => {
                    setIsConfigured(
                        res.data.data.backoffice &&
                            !!res.data.data.backoffice.backoffice_url &&
                            !!res.data.data.backoffice.backoffice_key &&
                            !!res.data.data.backoffice.backoffice_certificate,
                    );

                    setIsDirty(false);

                    form.update({
                        backoffice_enabled: res.data.data.backoffice.backoffice_enabled,
                        backoffice_url: res.data.data.backoffice.backoffice_url,
                        backoffice_key: res.data.data.backoffice.backoffice_key,
                        backoffice_certificate: res.data.data.backoffice.backoffice_certificate,
                        backoffice_fallback: res.data.data.backoffice.backoffice_fallback,
                        backoffice_ineligible_policy: res.data.data.backoffice.backoffice_ineligible_policy,
                        backoffice_ineligible_redirect_url: res.data.data.backoffice.backoffice_ineligible_redirect_url,
                    });

                    form.setErrors({});
                    pushSuccess('Opgeslagen!', 'Controleer de integratie om de instellingen te testen.');
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data.errors);
                    pushDanger('Mislukt!', err.data.message);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    const { update } = form;

    const onFileChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = (event) => resolve(event.target.result);
                reader.onerror = (error) => reject(error);
                reader.readAsText(e.target.files[0]);
            }).then((certificate: string) => {
                update({ backoffice_certificate: certificate });
                e.target.value = null;
            }, console.error);
        },
        [update],
    );

    const selectCertificateFile = useCallback((e) => {
        e?.preventDefault();
        e?.stopPropagation();

        fileInput.current?.click();
    }, []);

    const testBackofficeConnection = useCallback(() => {
        fundService
            .backofficeTest(activeOrganization.id, parseInt(id))
            .then((res) => {
                if (res.data.state === 'success') {
                    pushSuccess('Succes!', 'De API reageert zonder error codes en de authenticatie werkt.');
                } else {
                    pushDanger(
                        'Error!',
                        {
                            0: 'De API geeft code `0` terug, wat vaak betekent dat het certificaat verkeerd is.',
                            404: 'De API geeft code `404` terug, controleer de api url.',
                            403: 'De API geeft code `403` terug, wat vaak betekent dat het certificaat of de sleutel verkeerd is.',
                        }[res.data.response_code] ||
                            `De api geeft code \`${res.data.response_code}\` terug, controleer de instellingen.`,
                    );
                }
            })
            .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message));
    }, [fundService, activeOrganization.id, id, pushSuccess, pushDanger]);

    const fetchImplementation = useCallback(() => {
        fundService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => setFund(res.data.data))
            .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message));
    }, [activeOrganization.id, fundService, pushDanger, id]);

    useEffect(() => fetchImplementation(), [fetchImplementation]);

    useEffect(() => {
        if (fund) {
            setIsConfigured(
                fund.backoffice &&
                    !!fund.backoffice.backoffice_url &&
                    !!fund.backoffice.backoffice_key &&
                    !!fund.backoffice.backoffice_certificate,
            );

            update({
                backoffice_enabled: fund.backoffice.backoffice_enabled,
                backoffice_url: fund.backoffice.backoffice_url,
                backoffice_key: fund.backoffice.backoffice_key,
                backoffice_certificate: fund.backoffice.backoffice_certificate,
                backoffice_fallback: fund.backoffice.backoffice_fallback,
                backoffice_ineligible_policy: fund.backoffice.backoffice_ineligible_policy,
                backoffice_ineligible_redirect_url: fund.backoffice.backoffice_ineligible_redirect_url,
            });
        }
    }, [update, fund]);

    if (!fund) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'implementations'}
                    params={{ organizationId: activeOrganization.id }}
                    className="breadcrumb-item">
                    Webshops
                </StateNavLink>
                <StateNavLink
                    name={'implementations-view'}
                    params={{ organizationId: activeOrganization.id, id: fund.implementation.id }}
                    className="breadcrumb-item">
                    {fund.name}
                </StateNavLink>
                <div className="breadcrumb-item active">Backoffice integratie</div>
            </div>

            <div className="card">
                <form className="form" onSubmit={form.submit}>
                    <div className="card-header form">
                        <div className="flex-row">
                            <div className="flex flex-grow">
                                <div className="card-title">Backoffice integratie</div>
                            </div>
                            <div className="flex">
                                <div className="form-group">
                                    {isDirty && (
                                        <div className="button button-text button-sm button-disabled button-disabled-visible">
                                            Test de nieuwe instellingen voor het opslaan
                                        </div>
                                    )}

                                    {!isConfigured && !isDirty && (
                                        <div className="button button-text button-sm button-disabled button-disabled-visible">
                                            Vul alle velden in om de integratie te testen
                                        </div>
                                    )}

                                    <button
                                        className="button button-default button-sm"
                                        type="button"
                                        onClick={() => testBackofficeConnection()}
                                        disabled={!isConfigured || isDirty}>
                                        <div className="mdi mdi-connection icon-start" />
                                        Test instellingen
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-lg-9">
                                <div className="form-group form-group-inline">
                                    <label className="form-label">Status</label>
                                    <label className="form-toggle form-label" htmlFor="backoffice_enabled">
                                        <input
                                            className="form-label"
                                            type="checkbox"
                                            id="backoffice_enabled"
                                            checked={form.values?.backoffice_enabled}
                                            onChange={(e) => form.update({ backoffice_enabled: e.target.checked })}
                                        />
                                        <div className="form-toggle-inner flex-end">
                                            <div className="toggle-input">
                                                <div className="toggle-input-dot" />
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                <div className="form-group form-group-inline">
                                    <label className="form-label" htmlFor="backoffice_url">
                                        API url
                                    </label>
                                    <input
                                        id="backoffice_url"
                                        type="text"
                                        className="form-control"
                                        placeholder="Bijv. https://gemeente+1.nl/api/v1/"
                                        value={form.values?.backoffice_url || ''}
                                        onChange={(e) => {
                                            setIsDirty(true);
                                            form.update({ backoffice_url: e.target.value });
                                        }}
                                    />
                                    <FormError error={form.errors.backoffice_url} />
                                </div>
                                <div className="form-group form-group-inline">
                                    <label className="form-label" htmlFor="backoffice_key">
                                        API sleutel
                                    </label>
                                    <input
                                        id="backoffice_key"
                                        type="text"
                                        className="form-control"
                                        placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                        value={form.values?.backoffice_key || ''}
                                        onChange={(e) => {
                                            setIsDirty(true);
                                            form.update({ backoffice_key: e.target.value });
                                        }}
                                    />
                                    <FormError error={form.errors.backoffice_key} />
                                </div>

                                <div className="form-group form-group-inline tooltipped">
                                    <label className="form-label">Upload .PEM bestand</label>
                                    <div className="form-offset">
                                        {form.values.backoffice_certificate && (
                                            <pre className="code">
                                                {showCertificate
                                                    ? form.values.backoffice_certificate
                                                    : 'Certificaat geselecteerd'}
                                            </pre>
                                        )}

                                        <div className="button-group">
                                            <input
                                                type="file"
                                                accept={'.pem'}
                                                hidden={true}
                                                onChange={onFileChange}
                                                ref={fileInput}
                                            />

                                            <div
                                                className="button button-primary"
                                                onClick={(e) => selectCertificateFile(e)}>
                                                <em className="mdi mdi-upload icon-start" />
                                                Upload bestand
                                            </div>

                                            {form.values.backoffice_certificate && (
                                                <Fragment>
                                                    <div
                                                        className="button button-danger"
                                                        onClick={() => form.update({ backoffice_certificate: '' })}>
                                                        <em className="mdi mdi-delete-outline icon-start" />
                                                        Verwijderen bestand
                                                    </div>

                                                    {showCertificate ? (
                                                        <div
                                                            className="button button-text button-text-primary"
                                                            onClick={() => setShowCertificate(!showCertificate)}>
                                                            <em className="mdi mdi-eye-off-outline icon-start" />
                                                            Verberg certificaat
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="button button-text button-text-primary"
                                                            onClick={() => setShowCertificate(!showCertificate)}>
                                                            <em className="mdi mdi-eye-outline icon-start" />
                                                            Bekijk certificaat
                                                        </div>
                                                    )}
                                                </Fragment>
                                            )}
                                        </div>
                                    </div>
                                    <FormError error={form.errors.backoffice_key} />
                                    <Tooltip text="Upload het benodigde certificaat voor het tot stand brengen van een “two-sided” SSL-verbinding tussen het platform en de externe API." />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-lg-9 col-lg-12">
                                <div className="form-group form-group-inline tooltipped">
                                    <label className="form-label">Downtime pad</label>
                                    <div className="form-offset">
                                        <div className="form-group-info">
                                            <div className="form-group-info-control">
                                                <SelectControl
                                                    className={'form-control'}
                                                    options={fallbackOptions}
                                                    propKey={'value'}
                                                    propValue={'label'}
                                                    allowSearch={false}
                                                    value={form.values?.backoffice_fallback}
                                                    optionsComponent={SelectControlOptions}
                                                    onChange={(value?: boolean) =>
                                                        form.update({ backoffice_fallback: value })
                                                    }
                                                />
                                            </div>
                                            <div className="form-group-info-button">
                                                <div
                                                    className={`button button-default button-icon pull-left ${
                                                        showInfoBlock ? 'active' : ''
                                                    }`}
                                                    onClick={() => setShowInfoBlock(!showInfoBlock)}>
                                                    <em className="mdi mdi-information" />
                                                </div>
                                            </div>
                                        </div>

                                        {showInfoBlock && (
                                            <div className="block block-info-box block-info-box-primary">
                                                <div className="info-box-icon mdi mdi-information" />
                                                <div className="info-box-content">
                                                    <div className="block block-markdown">
                                                        <p>
                                                            Stel in wat de gebruiker ziet als de externe API downtime
                                                            heeft.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <FormError error={form.errors.backoffice_fallback} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-lg-9 col-lg-12">
                                <div className="form-group form-group-inline">
                                    <label className="form-label">Ineligibility policy</label>
                                    <div className="form-offset">
                                        <div className="form-group-info">
                                            <div className="form-group-info-control">
                                                <SelectControl
                                                    className={'form-control'}
                                                    options={ineligiblePolicyOptions}
                                                    propKey={'value'}
                                                    propValue={'label'}
                                                    allowSearch={false}
                                                    value={form.values?.backoffice_ineligible_policy}
                                                    optionsComponent={SelectControlOptions}
                                                    onChange={(value?: string) =>
                                                        form.update({ backoffice_ineligible_policy: value })
                                                    }
                                                />
                                            </div>
                                            <div className="form-group-info-button">
                                                <div
                                                    className={`button button-default button-icon pull-left ${
                                                        showPolicyInfoBlock ? 'active' : ''
                                                    }`}
                                                    onClick={() => setShowPolicyInfoBlock(!showPolicyInfoBlock)}>
                                                    <em className="mdi mdi-information" />
                                                </div>
                                            </div>
                                        </div>

                                        {showPolicyInfoBlock && (
                                            <div className="block block-info-box block-info-box-primary">
                                                <div className="info-box-icon mdi mdi-information" />
                                                <div className="info-box-content">
                                                    <div className="block block-markdown">
                                                        <p>What should happen when the requester is not eligible.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <FormError error={form.errors.backoffice_ineligible_policy} />
                                    </div>
                                </div>

                                {form.values.backoffice_ineligible_policy == 'redirect' && (
                                    <div className="form-group form-group-inline">
                                        <label className="form-label">Redirect url</label>
                                        <input
                                            className="form-control"
                                            placeholder="Bijv. https://gemeente+1.nl"
                                            value={form.values.backoffice_ineligible_redirect_url || ''}
                                            onChange={(e) =>
                                                form.update({ backoffice_ineligible_redirect_url: e.target.value })
                                            }
                                        />
                                        <FormError error={form.errors.backoffice_ineligible_redirect_url} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="button-group flex-center">
                            <StateNavLink
                                name={'implementations-view'}
                                params={{
                                    organizationId: activeOrganization.id,
                                    id: fund.implementation.id,
                                }}
                                className="button button-default">
                                {t('funds_edit.buttons.cancel')}
                            </StateNavLink>
                            <button className="button button-primary" type="submit">
                                {t('funds_edit.buttons.confirm')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Fragment>
    );
}
