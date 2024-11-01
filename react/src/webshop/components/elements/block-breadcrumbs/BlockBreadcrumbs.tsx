import React, { Fragment, ReactNode, useMemo } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import classNames from 'classnames';

export type Breadcrumb = {
    name: string;
    state?: string;
    stateParams?: object;
    className?: string;
};

export default function BlockBreadcrumbs({
    items = [],
    className,
    after,
}: {
    items?: Array<Breadcrumb>;
    className?: string;
    after?: ReactNode;
}) {
    const list = useMemo(() => {
        return items.filter((item) => item);
    }, [items]);

    return (
        <div className={classNames('block', 'block-breadcrumbs', 'rs_skip', className)}>
            {list?.map((item, index) => (
                <Fragment key={index}>
                    {item?.state ? (
                        <StateNavLink
                            name={item?.state}
                            params={item.stateParams}
                            className={classNames('breadcrumb-item', item.className)}
                            activeExact={true}>
                            {item.name}
                        </StateNavLink>
                    ) : (
                        <div
                            className={classNames('breadcrumb-item', 'active', item.className)}
                            aria-current="location">
                            {item.name}
                        </div>
                    )}

                    {index < list.length - 1 && <div className="breadcrumb-item-separator">/</div>}
                </Fragment>
            ))}
            {after}
        </div>
    );
}
