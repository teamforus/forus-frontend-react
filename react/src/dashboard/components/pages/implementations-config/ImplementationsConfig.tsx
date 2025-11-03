import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useFormBuilder from '../../../hooks/useFormBuilder';
import usePushSuccess from '../../../hooks/usePushSuccess';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useSetProgress from '../../../hooks/useSetProgress';
import { ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import { useParams } from 'react-router';
import Implementation from '../../../props/models/Implementation';
import { useNavigateState } from '../../../modules/state_router/Router';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import FormGroupInfo from '../../elements/forms/elements/FormGroupInfo';
import SelectControl from '../../elements/select-control/SelectControl';
import FormPane from '../../elements/forms/elements/FormPane';
import FormGroup from '../../elements/forms/elements/FormGroup';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

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

    const [showHideOptions] = useState([
        { value: true, name: translate('implementation_config.options.map_visibility.visible') },
        { value: false, name: translate('implementation_config.options.map_visibility.hidden') },
    ]);

    const [productSortOptions] = useState([
        { value: 'created_at_desc', name: translate('implementation_config.options.products_sorting.created_at_desc') },
        { value: 'created_at_asc', name: translate('implementation_config.options.products_sorting.created_at_asc') },
        { value: 'price_asc', name: translate('implementation_config.options.products_sorting.price_asc') },
        { value: 'price_desc', name: translate('implementation_config.options.products_sorting.price_desc') },
        { value: 'most_popular', name: translate('implementation_config.options.products_sorting.most_popular') },
        { value: 'name_asc', name: translate('implementation_config.options.products_sorting.name_asc') },
        { value: 'name_desc', name: translate('implementation_config.options.products_sorting.name_desc') },
        { value: 'randomized', name: translate('implementation_config.options.products_sorting.randomized') },
    ]);

    const form = useFormBuilder<{
        show_home_map: boolean;
        show_home_products: boolean;
        show_provider_map: boolean;
        show_providers_map: boolean;
        show_office_map: boolean;
        show_voucher_map: boolean;
        show_product_map: boolean;
        products_default_sorting: string;
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
                    return navigateState(DashboardRoutes.IMPLEMENTATIONS, { organizationId: activeOrganization.id });
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
                products_default_sorting: implementation.products_default_sorting,
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
                    name={DashboardRoutes.IMPLEMENTATIONS}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    Webshops
                </StateNavLink>
                <StateNavLink
                    name={DashboardRoutes.IMPLEMENTATION}
                    params={{ organizationId: activeOrganization.id, id: implementation.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {implementation.name}
                </StateNavLink>
                <StateNavLink
                    name={DashboardRoutes.IMPLEMENTATION_CMS}
                    params={{ organizationId: activeOrganization.id, id: implementation.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    Content Management System
                </StateNavLink>
                <div className="breadcrumb-item active">Implementation page configs</div>
            </div>

            <form className="card form" onSubmit={form.submit}>
                <div className="card-header">
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

                <div className="card-section card-section-primary card-section-settings flex flex-vertical flex-gap">
                    <FormPane title={translate('implementation_config.labels.home')}>
                        <div className="row">
                            <div className="col col-xs-12 col-md-6">
                                <FormGroup
                                    label={translate('implementation_config.labels.show_home_map')}
                                    input={() => (
                                        <FormGroupInfo
                                            error={form.errors?.products_default_sorting}
                                            info={translate('implementation_config.info.show_home_map')}>
                                            <SelectControl
                                                className="form-control"
                                                propKey={'value'}
                                                value={form.values.show_home_map}
                                                options={showHideOptions}
                                                allowSearch={false}
                                                onChange={(show_home_map: boolean) => form.update({ show_home_map })}
                                            />
                                        </FormGroupInfo>
                                    )}
                                />
                            </div>
                            <div className="col col-xs-12 col-md-6">
                                <FormGroup
                                    label={translate('implementation_config.labels.show_home_products')}
                                    input={() => (
                                        <FormGroupInfo
                                            error={form.errors?.products_default_sorting}
                                            info={translate('implementation_config.info.show_home_products')}>
                                            <SelectControl
                                                className="form-control"
                                                propKey={'value'}
                                                value={form.values.show_home_products}
                                                options={showHideOptions}
                                                allowSearch={false}
                                                onChange={(show_home_products: boolean) =>
                                                    form.update({ show_home_products })
                                                }
                                            />
                                        </FormGroupInfo>
                                    )}
                                />
                            </div>
                        </div>
                    </FormPane>

                    <FormPane title={translate('implementation_config.labels.product')}>
                        <div className="row">
                            <div className="col col-xs-12 col-md-6">
                                <FormGroup
                                    label={translate('implementation_config.labels.select_default_sorting')}
                                    input={() => (
                                        <FormGroupInfo
                                            error={form.errors?.products_default_sorting}
                                            info={translate('implementation_config.info.select_default_sorting')}>
                                            <SelectControl
                                                className="form-control"
                                                propKey={'value'}
                                                value={form.values.products_default_sorting}
                                                options={productSortOptions}
                                                allowSearch={false}
                                                onChange={(products_default_sorting: string) => {
                                                    form.update({ products_default_sorting });
                                                }}
                                            />
                                        </FormGroupInfo>
                                    )}
                                />
                            </div>
                            <div className="col col-xs-12 col-md-6">
                                <FormGroup
                                    label={translate('implementation_config.labels.show_product_map')}
                                    input={() => (
                                        <FormGroupInfo
                                            error={form.errors?.products_default_sorting}
                                            info={translate('implementation_config.info.show_product_map')}>
                                            <SelectControl
                                                className="form-control"
                                                propKey={'value'}
                                                value={form.values.show_product_map}
                                                options={showHideOptions}
                                                allowSearch={false}
                                                onChange={(show_product_map: boolean) =>
                                                    form.update({ show_product_map })
                                                }
                                            />
                                        </FormGroupInfo>
                                    )}
                                />
                            </div>
                        </div>
                    </FormPane>

                    <FormPane title={translate('implementation_config.labels.providers')}>
                        <FormGroup
                            label={translate('implementation_config.labels.show_providers_map')}
                            input={() => (
                                <FormGroupInfo
                                    error={form.errors?.products_default_sorting}
                                    info={translate('implementation_config.info.show_providers_map')}>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'value'}
                                        value={form.values.show_providers_map}
                                        options={showHideOptions}
                                        allowSearch={false}
                                        onChange={(show_providers_map: boolean) => form.update({ show_providers_map })}
                                    />
                                </FormGroupInfo>
                            )}
                        />
                    </FormPane>

                    <FormPane title={translate('implementation_config.labels.provider')}>
                        <FormGroup
                            label={translate('implementation_config.labels.show_provider_map')}
                            input={() => (
                                <FormGroupInfo
                                    error={form.errors?.products_default_sorting}
                                    info={translate('implementation_config.info.show_provider_map')}>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'value'}
                                        value={form.values.show_provider_map}
                                        options={showHideOptions}
                                        allowSearch={false}
                                        onChange={(show_provider_map: boolean) => form.update({ show_provider_map })}
                                    />
                                </FormGroupInfo>
                            )}
                        />
                    </FormPane>

                    <FormPane title={translate('implementation_config.labels.office')}>
                        <FormGroup
                            label={translate('implementation_config.labels.show_office_map')}
                            input={() => (
                                <FormGroupInfo
                                    error={form.errors?.products_default_sorting}
                                    info={translate('implementation_config.info.show_office_map')}>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'value'}
                                        value={form.values.show_office_map}
                                        options={showHideOptions}
                                        allowSearch={false}
                                        onChange={(show_office_map: boolean) => form.update({ show_office_map })}
                                    />
                                </FormGroupInfo>
                            )}
                        />
                    </FormPane>

                    <FormPane title={translate('implementation_config.labels.voucher')}>
                        <FormGroup
                            label={translate('implementation_config.labels.show_voucher_map')}
                            input={() => (
                                <FormGroupInfo
                                    error={form.errors?.products_default_sorting}
                                    info={translate('implementation_config.info.show_voucher_map')}>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'value'}
                                        value={form.values.show_voucher_map}
                                        options={showHideOptions}
                                        allowSearch={false}
                                        onChange={(show_voucher_map: boolean) => form.update({ show_voucher_map })}
                                    />
                                </FormGroupInfo>
                            )}
                        />
                    </FormPane>
                </div>

                <div className="card-section card-section-primary">
                    <div className="button-group flex-center">
                        <StateNavLink
                            name={DashboardRoutes.IMPLEMENTATION_CMS}
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
