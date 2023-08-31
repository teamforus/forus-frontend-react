import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Translate({
    i18n,
    values,
    component = <span />,
    escapeValue = true,
}: {
    i18n: string;
    values?: object;
    component?: React.ReactElement;
    escapeValue?: boolean;
}) {
    const { t } = useTranslation();

    return React.createElement(component.type, {
        ...component.props,
        dangerouslySetInnerHTML: { __html: t(i18n, { ...values, interpolation: { escapeValue } }) },
    });
}
