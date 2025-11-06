import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useSetProgress from '../../../hooks/useSetProgress';
import useImplementationService from '../../../services/ImplementationService';
import { useParams } from 'react-router';
import Implementation from '../../../props/models/Implementation';
import PhotoSelectorData from '../../elements/photo-selector/types/PhotoSelectorData';
import useTranslate from '../../../hooks/useTranslate';
import PhotoSelectorBanner from '../../elements/photo-selector/PhotoSelectorBanner';
import ImplementationsGrid from './elements/ImplementationsGrid';
import usePushApiError from '../../../hooks/usePushApiError';
import ImplementationsRootBreadcrumbs from './elements/ImplementationsRootBreadcrumbs';

export default function ImplementationView() {
    const { id } = useParams();

    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const activeOrganization = useActiveOrganization();

    const implementationService = useImplementationService();

    const [implementation, setImplementation] = useState<Implementation>(null);

    const [bannerMetaDefault] = useState<PhotoSelectorData>({
        media: null,
        mediaLoading: false,
        overlay_enabled: false,
        overlay_type: 'color',
        overlay_opacity: '40',
        banner_color: '#000',
        banner_background: '#fff',
        banner_background_mobile: true,
        banner_wide: true,
        banner_collapse: false,
        banner_position: 'left',
    });

    const [bannerMeta, setBannerMeta] = useState<PhotoSelectorData>(bannerMetaDefault);

    const fetchImplementation = useCallback(() => {
        setProgress(0);

        implementationService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => setImplementation(res.data.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [activeOrganization.id, implementationService, id, pushApiError, setProgress]);

    useEffect(() => {
        if (implementation) {
            setBannerMeta({
                ...bannerMetaDefault,

                media: implementation.banner,
                overlay_type: implementation.overlay_type,
                overlay_enabled: implementation.overlay_enabled,
                overlay_opacity: implementation.overlay_opacity.toString(),

                banner_wide: implementation.banner_wide,
                banner_collapse: implementation.banner_collapse,
                banner_position: implementation.banner_position,
                banner_color: implementation.banner_color,
                banner_background: implementation.banner_background,
                banner_button_type: implementation.banner_button_type,
                banner_background_mobile: implementation.banner_background_mobile,
            });
        }
    }, [bannerMetaDefault, implementation]);

    useEffect(() => {
        fetchImplementation();
    }, [fetchImplementation]);

    if (!implementation) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <ImplementationsRootBreadcrumbs implementation={implementation} />
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title flex flex-grow">{translate('implementation_edit.header.title')}</div>
                    <div className="card-header-filters">
                        <div className="block block-inline-filters">
                            <a
                                className="button button-text button-sm"
                                href={implementation.url_webshop}
                                target="_blank"
                                rel="noreferrer">
                                Open webshop
                                <em className="mdi mdi-open-in-new icon-end" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="card-section card-section-padless">
                    <PhotoSelectorBanner
                        templateData={bannerMeta}
                        thumbnail={implementation.banner?.sizes?.large}
                        title={implementation?.title}
                        description={implementation?.description}
                        buttonText={implementation?.banner_button_text}
                        disabled={true}
                        showEdit={true}
                        organization={activeOrganization}
                        implementation={implementation}
                    />
                </div>
            </div>

            <ImplementationsGrid />
        </Fragment>
    );
}
