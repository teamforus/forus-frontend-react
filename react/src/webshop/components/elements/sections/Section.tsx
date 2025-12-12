import React, { ReactNode, useMemo } from 'react';
import classNames from 'classnames';
import useTranslate from '../../../../dashboard/hooks/useTranslate';

export default function Section({
    id,
    type,
    wrapper = true,
    children,
}: {
    id?: string;
    type:
        | 'default'
        | 'cms'
        | 'faq'
        | 'breadcrumbs'
        | 'map'
        | 'profile'
        | 'voucher_details'
        | 'products'
        | 'product'
        | 'copyright'
        | 'pre-check'
        | 'footer';
    wrapper?: boolean;
    children: ReactNode | ReactNode[];
}) {
    const translate = useTranslate();

    const ariaLabel = useMemo(() => {
        if (type === 'footer') {
            return translate('app_footer.footer_aria_label');
        }

        return type === 'copyright' ? translate('app_footer.copyright_aria_label') : null;
    }, [translate, type]);

    return (
        <section
            className={classNames(
                'section',
                type === 'map' && 'section-map',
                type === 'faq' && 'section-faq',
                type === 'cms' && 'section-cms',
                type === 'footer' && 'section-footer',
                type === 'default' && 'section-default',
                type === 'profile' && 'section-profile',
                type === 'product' && 'section-product',
                type === 'products' && 'section-products',
                type === 'pre-check' && 'section-pre-check',
                type === 'copyright' && 'section-copyright',
                type === 'breadcrumbs' && 'section-breadcrumbs',
                type === 'voucher_details' && 'section-voucher-details',
            )}
            role={type === 'footer' ? 'contentinfo' : type === 'copyright' ? 'region' : null}
            aria-label={ariaLabel}
            id={id}>
            {wrapper ? <div className="wrapper">{children}</div> : children}
        </section>
    );
}
