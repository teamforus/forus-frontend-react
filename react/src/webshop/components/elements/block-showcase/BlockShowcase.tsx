import React, { Fragment, useMemo } from 'react';
import { TopNavbar } from '../top-navbar/TopNavbar';
import BlockLoader from '../block-loader/BlockLoader';
import BlockLoaderBreadcrumbs from '../block-loader/BlockLoaderBreadcrumbs';
import BlockBreadcrumbs, { Breadcrumb } from '../block-breadcrumbs/BlockBreadcrumbs';
import ReadSpeakerButton from '../../../modules/read_speaker/ReadSpeakerButton';

export default function BlockShowcase({
    children = null,
    breadcrumbItems = null,
    wrapper = false,
    className = null,
    loaderElement = null,
    breadcrumbLoaderElement = null,
}: {
    children?: React.ReactElement | Array<React.ReactElement>;
    breadcrumbItems?: Array<Breadcrumb>;
    wrapper?: boolean;
    className?: string;
    loaderElement?: React.ReactElement;
    breadcrumbLoaderElement?: React.ReactElement;
}) {
    const breadcrumbs = useMemo(() => {
        if (breadcrumbItems?.length === 0) {
            return <></>;
        }

        return (
            breadcrumbItems?.length > 0 && (
                <BlockBreadcrumbs
                    items={breadcrumbItems}
                    after={<ReadSpeakerButton className={'breadcrumb-read-speaker'} targetId={'main-content'} />}
                />
            )
        );
    }, [breadcrumbItems]);

    return (
        <div className={`block block-showcase ${className || ''}`}>
            <TopNavbar />

            <main id="main-content">
                {wrapper ? (
                    <div className={'wrapper'}>
                        {breadcrumbs || breadcrumbLoaderElement || <BlockLoaderBreadcrumbs />}
                        {children || loaderElement || <BlockLoader />}
                    </div>
                ) : (
                    <Fragment>
                        {breadcrumbs}
                        {children || loaderElement || <BlockLoader />}
                    </Fragment>
                )}
            </main>
        </div>
    );
}
