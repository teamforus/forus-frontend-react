import React, { Fragment } from 'react';
import CheckboxControl from '../../../elements/forms/controls/CheckboxControl';
import FormError from '../../../elements/forms/errors/FormError';
import Tooltip from '../../../elements/tooltip/Tooltip';

type error = { [key: string]: string | string[] };

export default function FundConfigContactInfoEditor({
    value,
    disabled = false,
    onChange,
    errors = {},
}: {
    value: {
        email_required?: boolean;
        contact_info_enabled?: boolean;
        contact_info_required?: boolean;
        contact_info_message_custom?: boolean;
        contact_info_message_text?: string;
        contact_info_message_default?: string;
    };
    onChange: (value: {
        email_required?: boolean;
        contact_info_enabled?: boolean;
        contact_info_required?: boolean;
        contact_info_message_custom?: boolean;
        contact_info_message_text?: string;
        contact_info_message_default?: string;
    }) => void;
    errors?: error;
    disabled: boolean;
}) {
    return (
        <Fragment>
            <div className="form-group form-group-last tooltipped">
                <CheckboxControl
                    id={'email_required'}
                    disabled={disabled}
                    checked={!!value.email_required}
                    onChange={(e) => onChange({ email_required: e.target.checked })}
                    title={'Alleen aanvragers die een e-mailadres opgeven mogen het aanvraagformulier doorlopen.'}
                />
                <FormError error={errors.email_required} />
                <Tooltip
                    text={
                        'Het uizetten van deze optie zorgt ervoor dat aanvragers met alleen DigiD een account kunnen ' +
                        'aanmaken zonder gebruik te maken van een e-mailadres. Aanvragers kunnen dan geen notificaties ' +
                        'ontvangen en er kunnen ook geen aanvulverzoekingen verstuurd worden.'
                    }
                />
            </div>

            {!value.email_required && (
                <div className="form-group form-group-last tooltipped">
                    <CheckboxControl
                        id={'contact_info_enabled'}
                        disabled={disabled}
                        checked={!!value.contact_info_enabled}
                        onChange={(e) => onChange({ contact_info_enabled: e.target.checked })}
                        title={'Vraag aanvragers om contactgegevens'}
                    />
                    <FormError error={errors.contact_info_enabled} />
                    <Tooltip
                        text={
                            'Het aanzetten van deze optie zorgt ervoor dat er contactgegevens opgevraagd kunnen worden voor aanvragers zonder e-mailadres.'
                        }
                    />
                </div>
            )}

            {!value.email_required && value.contact_info_enabled && (
                <div className="form-group form-group-last tooltipped">
                    <CheckboxControl
                        id={'contact_info_required'}
                        disabled={disabled}
                        checked={!!value.contact_info_required}
                        onChange={(e) => onChange({ contact_info_required: e.target.checked })}
                        title={'Maak het opgeven van contactgegevens verplicht'}
                    />
                    <FormError error={errors.contact_info_required} />
                    <Tooltip
                        text={'Het aanzetten van deze optie zal het opgeven van contactgegevens verplicht maken.'}
                    />
                </div>
            )}

            {!value.email_required && value.contact_info_enabled && (
                <div className="form-group form-group-last tooltipped">
                    <CheckboxControl
                        id={'contact_info_message_custom'}
                        disabled={disabled}
                        checked={!!value.contact_info_message_custom}
                        onChange={(e) => onChange({ contact_info_message_custom: e.target.checked })}
                        title={'Maak het opgeven van contactgegevens verplicht'}
                    />
                    <FormError error={errors.contact_info_message_custom} />
                </div>
            )}

            {!value.email_required && value.contact_info_enabled && (
                <div className="form-group form-group-last tooltipped">
                    {!value.contact_info_message_custom && (
                        <textarea
                            className="form-control r-n"
                            disabled={true}
                            value={value.contact_info_message_default}
                        />
                    )}

                    {value.contact_info_message_custom && (
                        <textarea
                            className="form-control r-n"
                            value={value.contact_info_message_text || ''}
                            onChange={(e) => onChange({ contact_info_message_text: e.target.value })}
                            placeholder={'Geef het bericht op dat je wilt instellen...'}
                        />
                    )}
                    <FormError error={errors.contact_info_message_text} />
                </div>
            )}
        </Fragment>
    );
}
