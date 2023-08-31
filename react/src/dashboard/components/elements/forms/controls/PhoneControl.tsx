import React, { useCallback, useEffect, useState } from 'react';
import SelectControl from '../../select-control/SelectControl';
import SelectControlOptionsCountryCodes from '../../select-control/templates/SelectControlOptionsCountryCodes';

import { CountryCallingCode, getCountries, getPhoneCode } from 'libphonenumber-js';
import countries from 'i18n-iso-countries';
import countriesEn from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(countriesEn);

const getCountryOptions = () => {
    return getCountries()
        .map((code) => ({ code: code, name: countries.getName(code, 'en'), dialCode: getPhoneCode(code) }))
        .map((option) => (option.name ? { ...option, name: `${option.name} (+${option.dialCode})` } : null))
        .filter((option) => option);
};

export default function PhoneControl({
    id,
    onChange,
    className = '',
}: {
    id?: string;
    onChange: (value: string) => void;
    className?: string;
}) {
    const [regEx] = useState(/[^- ()0-9]+/g);
    const [regExSpace] = useState(/  +/g);

    const [countryOptions] = useState(getCountryOptions);
    const [phoneNumber, setPhoneNumber] = useState<string>('');

    const [dialCode, setDialCode] = useState<CountryCallingCode>(
        countryOptions.find((country) => country.code == 'NL').dialCode,
    );

    const clear = useCallback(
        (value) => {
            return value.replace(regEx, '').replace(regExSpace, '');
        },
        [regEx, regExSpace],
    );

    const onKeyDown = useCallback(
        (e) => window.setTimeout(() => (e.target.value = clear(phoneNumber)), 0),
        [clear, phoneNumber],
    );

    useEffect(() => {
        onChange(`+${dialCode}${clear(phoneNumber)}`);
    }, [clear, dialCode, onChange, phoneNumber]);

    return (
        <div className={`phone-control ${className}`} id={id}>
            <SelectControl
                value={dialCode}
                propKey={'dialCode'}
                options={countryOptions}
                allowSearch={true}
                onChange={(dialCode: CountryCallingCode) => setDialCode(dialCode)}
                optionsComponent={SelectControlOptionsCountryCodes}
            />
            <input
                className="form-control phone-control-input"
                type="tel"
                maxLength={20}
                autoFocus={true}
                value={phoneNumber}
                onKeyDown={(e) => onKeyDown(e)}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
            />
        </div>
    );
}
