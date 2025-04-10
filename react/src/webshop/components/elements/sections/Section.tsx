import React, { ReactElement } from 'react';
import classNames from 'classnames';

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
        | 'footer';
    wrapper?: boolean;
    children: ReactElement | ReactElement[];
}) {
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
                type === 'copyright' && 'section-copyright',
                type === 'breadcrumbs' && 'section-breadcrumbs',
                type === 'voucher_details' && 'section-voucher-details',
            )}
            id={id}>
            {wrapper ? <div className="wrapper">{children}</div> : children}
        </section>
    );
}
