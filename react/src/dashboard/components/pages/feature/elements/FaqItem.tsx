import React, { Fragment, useState } from 'react';
import classNames from 'classnames';

export default function FaqItem({
    title,
    children,
}: {
    title: string;
    children: React.ReactElement | Array<React.ReactElement>;
}) {
    const [active, setActive] = useState(false);

    return (
        <Fragment>
            <div className={classNames('feature-faq-item', active && 'active')} onClick={() => setActive(!active)}>
                <div className="feature-faq-item-title">
                    {title}
                    <div className="feature-faq-item-icon mdi mdi-menu-down" />
                </div>
                <div className="feature-faq-item-description">{children}</div>
            </div>
        </Fragment>
    );
}
