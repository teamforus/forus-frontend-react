import React from 'react';
import { useHelperService } from '../../../../services/HelperService';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function EmailProviderLink({
    email = '',
    icon = 'open-in-new',
    type = 'button',
}: {
    email: string;
    icon?: string;
    type?: 'button' | 'text';
}) {
    const helperService = useHelperService();
    const url = useMemo(() => helperService.getEmailServiceProviderUrl(email), [email, helperService]);
    const { t } = useTranslation();

    return (
        <Fragment>
            {url && (
                <a
                    className={`button ${type == 'button' ? 'button-primary' : 'button-text button-text-primary'}`}
                    href={url}>
                    {icon && <em className={`mdi icon-start mdi-${icon}`} />}
                    {t('email_service_switch.confirm')}
                    <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                </a>
            )}
        </Fragment>
    );
}
