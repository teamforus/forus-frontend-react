import React from 'react';
import ProfileMenu from '../profile-menu/ProfileMenu';
import BlockShowcase from './BlockShowcase';
import BlockLoader from '../block-loader/BlockLoader';
import BlockLoaderHeader from '../block-loader/BlockLoaderHeader';
import ErrorBoundaryHandler from '../../../../dashboard/components/elements/error-boundary-handler/ErrorBoundaryHandler';

export default function BlockShowcaseProfile({
    filters = null,
    children = null,
    breadcrumbs = null,
    contentDusk = null,
    profileHeader = null,
}: {
    filters?: React.ReactElement | Array<React.ReactElement>;
    children?: React.ReactElement | Array<React.ReactElement>;
    breadcrumbs?: React.ReactElement | Array<React.ReactElement>;
    contentDusk?: string;
    profileHeader: React.ReactElement | Array<React.ReactElement>;
}) {
    return (
        <BlockShowcase>
            <section className="section section-profile">
                <div className="wrapper">
                    {breadcrumbs}

                    <ErrorBoundaryHandler>
                        <div className="block block-profile">
                            <div className="profile-aside">
                                <ProfileMenu />
                                {filters}
                            </div>

                            <div className="profile-content" data-dusk={contentDusk}>
                                <ErrorBoundaryHandler>
                                    {profileHeader || <BlockLoaderHeader />}
                                    {children || <BlockLoader />}
                                </ErrorBoundaryHandler>
                            </div>
                        </div>
                    </ErrorBoundaryHandler>
                </div>
            </section>
        </BlockShowcase>
    );
}
