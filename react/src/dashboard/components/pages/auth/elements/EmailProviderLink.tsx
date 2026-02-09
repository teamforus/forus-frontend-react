import React from 'react';
import classNames from 'classnames';
import { useHelperService } from '../../../../services/HelperService';
import { Fragment, useMemo } from 'react';
import useTranslate from '../../../../hooks/useTranslate';

export default function EmailProviderLink({
    email = '',
    icon = 'open-in-new',
    type = 'button',
}: {
    email: string;
    icon?: string;
    type?: 'button' | 'text';
}) {
    const translate = useTranslate();
    const helperService = useHelperService();

    const url = useMemo(() => {
        return helperService.getEmailServiceProviderUrl(email);
    }, [email, helperService]);

    return (
        <Fragment>
            {url && (
                <a
                    className={classNames(
                        'button',
                        type == 'button' ? 'button-primary' : 'button-text button-text-primary',
                    )}
                    href={url}>
                    {icon && <em className={`mdi icon-start mdi-${icon}`} />}
                    {translate('email_service_switch.confirm')}
                    <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                </a>
            )}
        </Fragment>
    );
}
