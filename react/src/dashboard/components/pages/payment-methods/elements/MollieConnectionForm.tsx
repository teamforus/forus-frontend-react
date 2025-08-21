import React, { useState } from 'react';
import MollieConnection from '../../../../props/models/MollieConnection';
import FormError from '../../../elements/forms/errors/FormError';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import { ResponseError, ResponseErrorThrottled } from '../../../../props/ApiResponses';
import useMollieConnectionService from '../../../../services/MollieConnectionService';
import useSetProgress from '../../../../hooks/useSetProgress';
import SelectControl from '../../../elements/select-control/SelectControl';
import { getCountries } from 'libphonenumber-js';
import countries from 'i18n-iso-countries';
import countriesEn from 'i18n-iso-countries/langs/en.json';
import Organization from '../../../../props/models/Organization';
import useTranslate from '../../../../hooks/useTranslate';
import InfoBox from '../../../elements/info-box/InfoBox';

countries.registerLocale(countriesEn);

const getCountryOptions = () => {
    return getCountries()
        .map((code) => ({ code: code, name: countries.getName(code, 'en') }))
        .map((option) => (option.name ? { ...option } : null))
        .filter((option) => option);
};

export default function MollieConnectionForm({
    organization,
    mollieConnection,
    onCancel,
    onResponseError,
}: {
    organization: Organization;
    mollieConnection: MollieConnection;
    onCancel: () => void;
    onResponseError?: (err: ResponseError & ResponseErrorThrottled) => void;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();

    const mollieConnectionService = useMollieConnectionService();

    const [countryOptions] = useState(getCountryOptions);

    const form = useFormBuilder(
        {
            name: '',
            email: '',
            phone: '',
            website: '',
            country_code: 'NL',
            city: '',
            street: '',
            postcode: '',
            first_name: '',
            last_name: '',
            profile_name: '',
        },
        (values) => {
            if (mollieConnection) {
                return;
            }

            setProgress(0);

            mollieConnectionService
                .store(organization.id, values)
                .then((res) => (document.location.href = res.data.url))
                .catch((err: ResponseError & ResponseErrorThrottled) => {
                    form.setIsLocked(false);
                    form.setErrors(
                        [429, 503].includes(err.status) ? { throttle: [err.data.message] } : err.data.errors,
                    );

                    onResponseError?.(err);
                })
                .finally(() => setProgress(100));
        },
    );

    return (
        <div className="card">
            <form className="form" onSubmit={form.submit}>
                <div className="card-header">
                    <div className="card-title">{translate('mollie_connection.header_create.title')}</div>
                </div>

                <div className="card-section card-section-primary">
                    <div className="row">
                        <div className="col col-md-8 col-md-offset-2 col-xs-12">
                            <div className="form-group">
                                <label className="form-label">&nbsp;</label>
                                <div className="form-title">{translate('mollie_connection.titles.address')}</div>
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">
                                    {translate('mollie_connection.labels.country')}
                                </label>
                                <SelectControl
                                    className="form-control"
                                    propKey={'code'}
                                    options={countryOptions}
                                    value={form.values.country_code}
                                    allowSearch={true}
                                    onChange={(country_code: string) => form.update({ country_code })}
                                />
                                <FormError error={form.errors.country_code} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">{translate('mollie_connection.labels.city')}</label>
                                <input
                                    className="form-control"
                                    onChange={(e) => form.update({ city: e.target.value })}
                                    value={form.values.city || ''}
                                    type="text"
                                    placeholder={translate('mollie_connection.labels.city')}
                                />
                                <FormError error={form.errors.city} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">{translate('mollie_connection.labels.street')}</label>
                                <input
                                    className="form-control"
                                    onChange={(e) => form.update({ street: e.target.value })}
                                    value={form.values.street || ''}
                                    type="text"
                                    placeholder={translate('mollie_connection.labels.street')}
                                />
                                <FormError error={form.errors.street} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">{translate('mollie_connection.labels.postcode')}</label>
                                <input
                                    className="form-control"
                                    onChange={(e) => form.update({ postcode: e.target.value })}
                                    value={form.values.postcode || ''}
                                    type="text"
                                    placeholder={translate('mollie_connection.labels.postcode')}
                                />
                                <FormError error={form.errors.postcode} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-section card-section-primary">
                    <div className="row">
                        <div className="col col-md-8 col-md-offset-2 col-xs-12">
                            <div className="form-group">
                                <label className="form-label">&nbsp;</label>
                                <div className="form-title">
                                    {translate('mollie_connection.titles.contact_information')}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">
                                    {translate('mollie_connection.labels.organization_name')}
                                </label>
                                <input
                                    className="form-control"
                                    onChange={(e) => form.update({ name: e.target.value })}
                                    value={form.values.name || ''}
                                    type="text"
                                    placeholder={translate('mollie_connection.labels.organization_name')}
                                />
                                <FormError error={form.errors.name} />
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">
                                    {translate('mollie_connection.labels.first_name')}
                                </label>
                                <input
                                    className="form-control"
                                    onChange={(e) => form.update({ first_name: e.target.value })}
                                    value={form.values.first_name || ''}
                                    type="text"
                                    placeholder={translate('mollie_connection.labels.first_name')}
                                />
                                <FormError error={form.errors.first_name} />
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">
                                    {translate('mollie_connection.labels.last_name')}
                                </label>
                                <input
                                    className="form-control"
                                    onChange={(e) => form.update({ last_name: e.target.value })}
                                    value={form.values.last_name || ''}
                                    type="text"
                                    placeholder={translate('mollie_connection.labels.last_name')}
                                />
                                <FormError error={form.errors.last_name} />
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">
                                    {translate('mollie_connection.labels.email')}
                                </label>
                                <input
                                    className="form-control"
                                    onChange={(e) => form.update({ email: e.target.value })}
                                    value={form.values.email || ''}
                                    type="text"
                                    placeholder={translate('mollie_connection.labels.email')}
                                />
                                <FormError error={form.errors.email} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-section card-section-primary">
                    <div className="form-group">
                        <div className="row">
                            <div className="col col-md-8 col-md-offset-2 col-xs-12">
                                <div className="form-group">
                                    <label className="form-label">&nbsp;</label>
                                    <div className="form-title">
                                        {translate('mollie_connection.titles.profile_information')}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label form-label-required">
                                        {translate('mollie_connection.labels.profile_name')}
                                    </label>
                                    <input
                                        className="form-control"
                                        onChange={(e) => form.update({ profile_name: e.target.value })}
                                        value={form.values.profile_name || ''}
                                        type="text"
                                        placeholder={translate('mollie_connection.labels.profile_name')}
                                    />
                                    <FormError error={form.errors.profile_name} />
                                </div>

                                <div className="form-group">
                                    <label className="form-label form-label-required">
                                        {translate('mollie_connection.labels.phone')}
                                    </label>
                                    <input
                                        className="form-control"
                                        onChange={(e) => form.update({ phone: e.target.value })}
                                        value={form.values.phone || ''}
                                        type="text"
                                        placeholder={translate('mollie_connection.labels.phone')}
                                    />
                                    <FormError error={form.errors.phone} />
                                </div>

                                <div className="form-group">
                                    <label className="form-label form-label-required">
                                        {translate('mollie_connection.labels.website')}
                                    </label>
                                    <input
                                        className="form-control"
                                        onChange={(e) => form.update({ website: e.target.value })}
                                        value={form.values.website || ''}
                                        type="text"
                                        placeholder={translate('mollie_connection.labels.website')}
                                    />
                                    <FormError error={form.errors.website} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <InfoBox>{translate('mollie_connection.create_form.info_content')}</InfoBox>
                </div>

                <div className="card-section">
                    <div className="button-group flex-center">
                        <button className="button button-default" type="button" onClick={() => onCancel()}>
                            {translate('mollie_connection.buttons.cancel')}
                        </button>

                        <button className="button button-primary" type="submit">
                            {translate('mollie_connection.buttons.submit')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
