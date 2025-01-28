import React from 'react';
import useLangSelector from '../../../../hooks/useLangSelector';

export const TopNavbarDesktopLang = () => {
    const langSelector = useLangSelector();

    return <div className="navbar-desktop-lang">{langSelector}</div>;
};
