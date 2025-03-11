import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useFormBuilder from '../../../hooks/useFormBuilder';
import usePushSuccess from '../../../hooks/usePushSuccess';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import FormError from '../../elements/forms/errors/FormError';
import useSetProgress from '../../../hooks/useSetProgress';
import { ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import { useParams } from 'react-router-dom';
import Implementation from '../../../props/models/Implementation';
import { useNavigateState } from '../../../modules/state_router/Router';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';

export default function ImplementationsConfig() {
    const { id } = useParams();

    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();

    const implementationService = useImplementationService();

    const [loaded, setLoaded] = useState(false);
    const [implementation, setImplementation] = useState<Implementation>(null);

    const [configs] = useState([
        { page: 'home', blocks: ['show_home_map', 'show_home_products'] },
        { page: 'providers', blocks: ['show_providers_map'] },
        { page: 'provider', blocks: ['show_provider_map'] },
        { page: 'office', blocks: ['show_office_map'] },
        { page: 'voucher', blocks: ['show_voucher_map'] },
        { page: 'product', blocks: ['show_product_map'] },
    ]);

    const form = useFormBuilder<{
        show_home_map: string;
        show_home_products: string;
        show_provider_map: string;
        show_providers_map: string;
        show_office_map: string;
        show_voucher_map: string;
        show_product_map: string;
    }>(null, (values) => {
        setProgress(0);

        implementationService
            .updateCMS(activeOrganization.id, implementation.id, values)
            .then((res) => {
                setImplementation(res.data.data);
                form.setErrors({});
                pushSuccess('Opgeslagen!');
            })
            .catch((err: ResponseError) => {
                form.setErrors(err.data.errors);
                pushApiError(err);
            })
            .finally(() => {
                setProgress(100);
                form.setIsLocked(false);
            });
    });

    const { update } = form;

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => setImplementation(res.data.data))
            .catch((err: ResponseError) => {
                if (err.status === 403) {
                    return navigateState('implementations', { organizationId: activeOrganization.id });
                }

                pushApiError(err);
            });
    }, [implementationService, activeOrganization.id, navigateState, id, pushApiError]);

    useEffect(() => {
        fetchImplementation();
    }, [fetchImplementation]);

    useEffect(() => {
        if (implementation) {
            update({
                show_home_map: implementation.show_home_map,
                show_home_products: implementation.show_home_products,
                show_provider_map: implementation.show_provider_map,
                show_providers_map: implementation.show_providers_map,
                show_office_map: implementation.show_office_map,
                show_voucher_map: implementation.show_voucher_map,
                show_product_map: implementation.show_product_map,
            });

            setLoaded(true);
        }
    }, [update, implementation]);

    if (!loaded) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'implementations'}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    Webshops
                </StateNavLink>
                <StateNavLink
                    name={'implementations-view'}
                    params={{ organizationId: activeOrganization.id, id: implementation.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {implementation.name}
                </StateNavLink>
                <StateNavLink
                    name={'implementations-cms'}
                    params={{ organizationId: activeOrganization.id, id: implementation.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    Content Management System
                </StateNavLink>
                <div className="breadcrumb-item active">Implementation page configs</div>
            </div>

            <form className="card form" onSubmit={form.submit}>
                <div className="card-header card-header-next">
                    <div className="flex flex-grow card-title">{translate('implementation_edit.header.title')}</div>

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

                            <button className="button button-primary button-sm" type="submit">
                                {translate('funds_edit.buttons.confirm')}
                            </button>
                        </div>
                    </div>
                </div>

                {configs.map((config) => (
                    <div key={config.page} className="card-section card-section-primary card-section-settings">
                        <div className="card-title">{translate(`implementation_config.pages.${config.page}`)}</div>
                        <div className="block block-toggles">
                            <div className="toggle-row">
                                <div className="row">
                                    {config.blocks.map((block, index, arr) => (
                                        <div
                                            key={block}
                                            className={`col col-xs-12 ${
                                                config.blocks.length % 2 == 0 || !(index === arr.length - 1)
                                                    ? 'col-lg-6'
                                                    : ''
                                            } ${
                                                config.blocks.length % 2 && index === arr.length - 1 ? 'col-lg-12' : ''
                                            }`}>
                                            <div className={`toggle-item ${form.values[block] ? 'active' : ''}`}>
                                                <div className="toggle-label">
                                                    <div className="flex flex-vertical">
                                                        <div>{translate(`implementation_config.blocks.${block}`)}</div>
                                                        <FormError error={form.errors[block]} />
                                                    </div>
                                                </div>
                                                <label className="form-toggle" htmlFor={block}>
                                                    <input
                                                        id={block}
                                                        type="checkbox"
                                                        checked={form.values[block]}
                                                        onChange={(e) => {
                                                            form.update({ [block]: e.target.checked });
                                                        }}
                                                    />

                                                    <div className="form-toggle-inner flex-end">
                                                        <div className="toggle-input">
                                                            <div className="toggle-input-dot" />
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="card-section card-section-primary">
                    <div className="button-group flex-center">
                        <StateNavLink
                            name={'implementations-cms'}
                            params={{ id: implementation.id, organizationId: activeOrganization.id }}
                            className="button button-default">
                            {translate('funds_edit.buttons.cancel')}
                        </StateNavLink>
                        <button className="button button-primary" type="submit">
                            {translate('funds_edit.buttons.confirm')}
                        </button>
                    </div>
                </div>
            </form>
        </Fragment>
    );
}
