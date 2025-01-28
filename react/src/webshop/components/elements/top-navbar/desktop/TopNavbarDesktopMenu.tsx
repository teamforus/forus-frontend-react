import React, { Fragment } from 'react';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import useTopMenuItems from '../helpers/useTopMenuItems';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { uniqueId } from 'lodash';

export const TopNavbarDesktopMenu = () => {
    const translate = useTranslate();
    const menuItems = useTopMenuItems();

    return (
        <div className="navbar-desktop-menu">
            {menuItems.map((menuItem, index) => (
                <Fragment key={uniqueId('menu_item')}>
                    {!menuItem.href && (
                        <StateNavLink
                            name={menuItem.state}
                            params={menuItem.stateParams}
                            activeExact={true}
                            className="navbar-desktop-menu-item"
                            activeClass="navbar-desktop-menu-item-active"
                            target={menuItem.target || '_blank'}>
                            {translate(
                                menuItem.nameTranslate,
                                {},
                                menuItem.nameTranslateDefault || menuItem.nameTranslate,
                            )}
                        </StateNavLink>
                    )}

                    {menuItem.href && (
                        <a
                            className="navbar-desktop-menu-item"
                            href={menuItem.href}
                            target={menuItem.target || '_blank'}>
                            {translate(
                                menuItem.nameTranslate,
                                {},
                                menuItem.nameTranslateDefault || menuItem.nameTranslate,
                            )}
                        </a>
                    )}

                    {index < menuItems.length - 1 && <div className="navbar-desktop-menu-separator" />}
                </Fragment>
            ))}
        </div>
    );
};
