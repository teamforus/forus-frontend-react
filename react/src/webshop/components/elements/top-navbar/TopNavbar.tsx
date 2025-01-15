import React from 'react';
import { TopNavbarMobile } from './mobile/TopNavbarMobile';
import useIsMobile from '../../../hooks/useIsMobile';
import { TopNavbarDesktop } from './desktop/TopNavbarDesktop';

export const TopNavbar = ({ hideOnScroll = false, className = '' }: { hideOnScroll?: boolean; className?: string }) => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <TopNavbarMobile />;
    }

    return <TopNavbarDesktop hideOnScroll={hideOnScroll} className={className} />;
};
