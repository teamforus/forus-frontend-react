import React, { useContext } from 'react';
import { mainContext } from '../../../../contexts/MainContext';

export const TopNavbarDesktopSearchButton = () => {
    const { showSearchBox, setShowSearchBox } = useContext(mainContext);

    return (
        <button
            tabIndex={0}
            className="navbar-desktop-search-button"
            aria-label="Zoeken"
            onClick={() => setShowSearchBox(!showSearchBox)}>
            <em className="mdi mdi-magnify" />
        </button>
    );
};
