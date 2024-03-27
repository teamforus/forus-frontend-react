import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useFormBuilder from '../../../hooks/useFormBuilder';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import FormError from '../../elements/forms/errors/FormError';
import useSetProgress from '../../../hooks/useSetProgress';
import { ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import { useNavigate, useParams } from 'react-router-dom';
import Implementation from '../../../props/models/Implementation';
import { getStateRouteUrl } from '../../../modules/state_router/Router';

export default function ImplementationsConfig() {
    const { id } = useParams();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const implementationService = useImplementationService();

    const [implementation, setImplementation] = useState<Implementation>(null);
    const [loaded, setLoaded] = useState(false);
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
                pushDanger('Mislukt!', err.data.message);
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
            .catch((res: ResponseError) => {
                if (res.status === 403) {
                    return navigate(getStateRouteUrl('implementations', { organizationId: activeOrganization.id }));
                }

                pushDanger('Mislukt!', res.data.message);
            });
    }, [implementationService, activeOrganization.id, navigate, id, pushDanger]);

    useEffect(() => fetchImplementation(), [fetchImplementation]);

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
                    className="breadcrumb-item">
                    Webshops
                </StateNavLink>
                <StateNavLink
                    name={'implementations-view'}
                    params={{ organizationId: activeOrganization.id, id: implementation.id }}
                    className="breadcrumb-item">
                    {implementation.name}
                </StateNavLink>
                <StateNavLink
                    name={'implementations-cms'}
                    params={{ organizationId: activeOrganization.id, id: implementation.id }}
                    className="breadcrumb-item">
                    Content Management System
                </StateNavLink>
                <div className="breadcrumb-item active">Implementation page configs</div>
            </div>

            <div className="card">
                <form className="form" onSubmit={form.submit}>
                    <div className="card-header flex flex-horizontal">
                        <div className="flex flex-grow">
                            <div className="card-title">{t('implementation_edit.header.title')}</div>
                        </div>
                        <div className="flex">
                            <a
                                className="button button-text button-sm"
                                href={implementation.url_webshop}
                                target="_blank"
                                rel="noreferrer">
                                Open webshop
                                <em className="mdi mdi-open-in-new icon-end" />
                            </a>

                            <button className="button button-primary button-sm" type="submit">
                                {t('funds_edit.buttons.confirm')}
                            </button>
                        </div>
                    </div>

                    {configs.map((config) => (
                        <div key={config.page} className="card-section card-section-primary card-section-settings">
                            <div className="card-title">{t(`implementation_config.pages.${config.page}`)}</div>
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
                                                    config.blocks.length % 2 && index === arr.length - 1
                                                        ? 'col-lg-12'
                                                        : ''
                                                }`}>
                                                <div className={`toggle-item ${form.values[block] ? 'active' : ''}`}>
                                                    <div className="toggle-label">
                                                        <div className="flex flex-vertical">
                                                            <div>{t(`implementation_config.blocks.${block}`)}</div>
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
                                params={{
                                    organizationId: activeOrganization.id,
                                    id: implementation.id,
                                }}
                                className="button button-default">
                                {t('funds_edit.buttons.cancel')}
                            </StateNavLink>
                            <button className="button button-primary" type="submit">
                                {t('funds_edit.buttons.confirm')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Fragment>
    );
}
