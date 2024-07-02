import React, { CSSProperties, useCallback, useState } from 'react';
import BlockShowcase from './BlockShowcase';
import BlockLoader from '../block-loader/BlockLoader';

export default function BlockShowcasePage({
    aside = null,
    children = null,
    breadcrumbs = null,
    contentStyles = null,
    countFiltersApplied = null,
    showCaseClassName = null,
}: {
    aside?: React.ReactElement | Array<React.ReactElement>;
    children?: React.ReactElement | Array<React.ReactElement>;
    breadcrumbs?: React.ReactElement | Array<React.ReactElement>;
    contentStyles?: CSSProperties;
    countFiltersApplied?: number;
    showCaseClassName?: string;
}) {
    const [showModalFilters, setShowModalFilters] = useState(false);

    const showMobileMenu = useCallback(() => {
        setShowModalFilters(true);
    }, []);

    const hideMobileMenu = () => {
        setShowModalFilters(false);
    };

    const toggleMobileMenu = useCallback(() => {
        showModalFilters ? hideMobileMenu() : showMobileMenu();
    }, [showMobileMenu, showModalFilters]);

    return (
        <BlockShowcase className={showCaseClassName}>
            <div className="showcase-wrapper">
                <div className={`showcase-mobile-filters ${countFiltersApplied > 0 ? 'active' : ''}`}>
                    <div className="mobile-filters-count">
                        <div className="mobile-filters-count-value">{countFiltersApplied}</div>
                    </div>
                    <div className="mobile-filters-title">Filteren</div>
                    <div
                        className="mobile-filters-icon"
                        onClick={toggleMobileMenu}
                        aria-label="Filteren"
                        aria-expanded={showModalFilters}
                        aria-controls={'aside-mobile'}>
                        <em className="mdi mdi-filter-outline" />
                    </div>
                </div>

                {breadcrumbs}

                <div className="showcase-layout">
                    <div
                        className={`showcase-aside form form-compact ${showModalFilters ? 'show-mobile' : ''}`}
                        id={'aside-mobile'}>
                        {aside || <BlockLoader />}
                    </div>

                    <div className="showcase-content" style={contentStyles}>
                        {children || <BlockLoader />}
                    </div>
                </div>
            </div>
        </BlockShowcase>
    );
}
