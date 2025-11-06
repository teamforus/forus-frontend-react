import React, { Fragment, ReactNode, useMemo } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import classNames from 'classnames';
import { useNavigate } from 'react-router';
import Section from '../sections/Section';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export type Breadcrumb = {
    name: string;
    state?: WebshopRoutes;
    stateQuery?: object;
    stateParams?: object;
    className?: string;
    back?: boolean;
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
    const navigate = useNavigate();

    const list = useMemo(() => {
        return items.filter((item) => item);
    }, [items]);

    return (
        <Section type={'breadcrumbs'}>
            <div className={classNames('block', 'block-breadcrumbs', 'rs_skip', className)}>
                {list?.map((item, index) => (
                    <Fragment key={index}>
                        {item?.state ? (
                            <StateNavLink
                                name={item?.state}
                                query={item.stateQuery}
                                params={item.stateParams}
                                className={classNames('breadcrumb-item', item.className)}
                                activeExact={true}>
                                {item.name}
                            </StateNavLink>
                        ) : item?.back ? (
                            <div
                                className={classNames(
                                    'breadcrumb-item breadcrumb-item-back state-nav-link',
                                    item.className,
                                )}
                                onClick={() => navigate(-1)}>
                                <em className={`mdi mdi-chevron-left`} />
                                {item.name}
                            </div>
                        ) : (
                            <div
                                className={classNames('breadcrumb-item', 'active', item.className)}
                                aria-current="location">
                                {item.name}
                            </div>
                        )}

                        {index < list.length - 1 && !item.back && <div className="breadcrumb-item-separator">/</div>}
                    </Fragment>
                ))}
                {after}
            </div>
        </Section>
    );
}
