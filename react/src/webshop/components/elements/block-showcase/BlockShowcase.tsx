import React, { Fragment, useMemo } from 'react';
import BlockLoader from '../block-loader/BlockLoader';
import BlockLoaderBreadcrumbs from '../block-loader/BlockLoaderBreadcrumbs';
import BlockBreadcrumbs, { Breadcrumb } from '../block-breadcrumbs/BlockBreadcrumbs';
import ReadSpeakerButton from '../../../modules/read_speaker/ReadSpeakerButton';
import useReadSpeakerHref from '../../../modules/read_speaker/hooks/useReadSpeakerHref';
import classNames from 'classnames';

export default function BlockShowcase({
    children = null,
    breadcrumbItems = null,
    className = null,
    loaderElement = null,
    breadcrumbLoaderElement = null,
}: {
    children?: React.ReactElement | Array<React.ReactElement>;
    breadcrumbItems?: Array<Breadcrumb>;
    className?: string;
    loaderElement?: React.ReactElement;
    breadcrumbLoaderElement?: React.ReactElement;
}) {
    const readSpeakerHref = useReadSpeakerHref('main-content');

    const breadcrumbs = useMemo(() => {
        if (!breadcrumbItems) {
            return null;
        }

        if (breadcrumbItems?.length === 0 && !readSpeakerHref) {
            return <Fragment></Fragment>;
        }

        return (
            breadcrumbItems && (
                <BlockBreadcrumbs
                    items={breadcrumbItems}
                    after={<ReadSpeakerButton className={'breadcrumb-read-speaker'} targetId={'main-content'} />}
                />
            )
        );
    }, [breadcrumbItems, readSpeakerHref]);

    return (
        <div className={classNames('block', 'block-showcase', className)}>
            <main id="main-content">
                {breadcrumbs || breadcrumbLoaderElement || <BlockLoaderBreadcrumbs />}
                {children || loaderElement || <BlockLoader />}
            </main>
        </div>
    );
}
