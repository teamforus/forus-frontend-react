import React from 'react';
import ProfileMenu from '../profile-menu/ProfileMenu';
import BlockShowcase from './BlockShowcase';
import BlockLoader from '../block-loader/BlockLoader';
import BlockLoaderHeader from '../block-loader/BlockLoaderHeader';
import ErrorBoundaryHandler from '../../../../dashboard/components/elements/error-boundary-handler/ErrorBoundaryHandler';
import BlockBreadcrumbs, { Breadcrumb } from '../block-breadcrumbs/BlockBreadcrumbs';
import ReadSpeakerButton from '../../../modules/read_speaker/ReadSpeakerButton';

export default function BlockShowcaseProfile({
    filters = null,
    children = null,
    contentDusk = null,
    profileHeader = null,
    breadcrumbItems = null,
}: {
    filters?: React.ReactElement | Array<React.ReactElement>;
    children?: React.ReactElement | Array<React.ReactElement>;
    contentDusk?: string;
    profileHeader: React.ReactElement | Array<React.ReactElement>;
    breadcrumbItems?: Array<Breadcrumb>;
}) {
    return (
        <BlockShowcase>
            <section className="section section-profile">
                <div className="wrapper">
                    {breadcrumbItems?.length > 0 && (
                        <BlockBreadcrumbs
                            items={breadcrumbItems}
                            after={
                                <ReadSpeakerButton className={'breadcrumb-read-speaker'} targetId={'main-content'} />
                            }
                        />
                    )}

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
