import React from 'react';
import useTranslate from '../../../hooks/useTranslate';

export default function TranslateHtml({
    i18n,
    i18nDefault = null,
    values,
    component = <span />,
    escapeValue = true,
    className = '',
}: {
    i18n: string;
    i18nDefault?: string;
    values?: Record<string, unknown>;
    component?: React.ReactElement<Record<string, unknown>>;
    escapeValue?: boolean;
    className?: string;
}) {
    const translate = useTranslate();
    const interpolationValues = values || {};
    const componentProps = (component.props || {}) as Record<string, unknown>;

    return React.createElement(component.type, {
        className: className,
        ...componentProps,
        dangerouslySetInnerHTML: {
            __html: translate(i18n, { ...interpolationValues, interpolation: { escapeValue } }, i18nDefault),
        },
    });
}
