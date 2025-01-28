import React, { Fragment, useCallback, useContext, useEffect } from 'react';
import useAppConfigs from '../../../../hooks/useAppConfigs';
import Announcements from '../../announcements/Announcements';
import classNames from 'classnames';
import { TopNavbarDesktopMenu } from './TopNavbarDesktopMenu';
import { TopNavbarDesktopAuth } from './TopNavbarDesktopAuth';
import { TopNavbarDesktopLang } from './TopNavbarDesktopLang';
import { TopNavbarDesktopLogo } from './TopNavbarDesktopLogo';
import { TopNavbarDesktopSearch } from './TopNavbarDesktopSearch';
import { TopNavbarDesktopUser } from './TopNavbarDesktopUser';
import useEnvData from '../../../../hooks/useEnvData';
import { mainContext } from '../../../../contexts/MainContext';
import { TopNavbarDesktopSearchButton } from './TopNavbarDesktopSearchButton';

export const TopNavbarDesktop = ({
    hideOnScroll = false,
    className = '',
}: {
    hideOnScroll?: boolean;
    className?: string;
}) => {
    const envData = useEnvData();
    const appConfigs = useAppConfigs();
    const { showSearchBox } = useContext(mainContext);

    const [visible, setVisible] = React.useState(false);
    const [prevOffsetY, setPrevOffsetY] = React.useState(0);

    const updateScrolled = useCallback(() => {
        const currentScrollY = window.scrollY;

        setVisible(prevOffsetY > currentScrollY || currentScrollY <= 0);
        setPrevOffsetY(currentScrollY);
    }, [prevOffsetY]);

    useEffect(() => {
        window.addEventListener('scroll', updateScrolled);
    }, [updateScrolled]);

    return (
        <nav
            className={classNames(
                'block block-navbar-desktop',
                className,
                hideOnScroll && !visible && 'scrolled',
                envData?.config?.flags?.navbarCombined && 'block-navbar-desktop-combined',
            )}>
            <Announcements announcements={appConfigs?.announcements} />

            {envData?.config?.flags?.navbarCombined ? (
                <Fragment>
                    <div className="navbar-desktop-section navbar-desktop-section-menu">
                        <div className="navbar-desktop-section-wrapper">
                            <TopNavbarDesktopLogo />
                            <TopNavbarDesktopMenu />
                            <TopNavbarDesktopLang />
                            <TopNavbarDesktopSearchButton />
                            <TopNavbarDesktopUser />
                        </div>
                    </div>

                    {showSearchBox && (
                        <div className="navbar-desktop-section navbar-desktop-section-search">
                            <div className="navbar-desktop-section-wrapper">
                                <TopNavbarDesktopSearch autoFocus={true} />
                            </div>
                        </div>
                    )}
                </Fragment>
            ) : (
                <Fragment>
                    <div className="navbar-desktop-section navbar-desktop-section-menu">
                        <div className="navbar-desktop-section-wrapper">
                            <TopNavbarDesktopMenu />
                            <TopNavbarDesktopLang />
                            <TopNavbarDesktopAuth />
                        </div>
                    </div>

                    <div className="navbar-desktop-section navbar-desktop-section-search">
                        <div className="navbar-desktop-section-wrapper">
                            <TopNavbarDesktopLogo />
                            <TopNavbarDesktopSearch />
                            <TopNavbarDesktopUser />
                        </div>
                    </div>
                </Fragment>
            )}
        </nav>
    );
};
