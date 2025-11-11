import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useProviderFundService from '../../../services/ProviderFundService';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import FundProvider from '../../../props/models/FundProvider';
import useProductService from '../../../services/ProductService';
import useTransactionService from '../../../services/TransactionService';
import useSetProgress from '../../../hooks/useSetProgress';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useEnvData from '../../../hooks/useEnvData';
import { useEmployeeService } from '../../../services/EmployeeService';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useAppConfigs from '../../../hooks/useAppConfigs';
import { hasPermission } from '../../../helpers/utils';
import ProductsRequiredNotification from './elements/ProductsRequiredNotification';
import { Permission } from '../../../props/models/Organization';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function ProviderOverview() {
    const envData = useEnvData();
    const setProgress = useSetProgress();
    const appConfigs = useAppConfigs();
    const activeOrganization = useActiveOrganization();

    const productService = useProductService();
    const employeeService = useEmployeeService();
    const transactionService = useTransactionService();
    const providerFundService = useProviderFundService();

    const [loaded, setLoaded] = useState(false);
    const [fundsTotal, setFundsTotal] = useState(null);
    const [productsTotal, setProductsTotal] = useState(null);
    const [employeesTotal, setEmployeesTotal] = useState(null);
    const [transactionsTotal, setTransactionsTotal] = useState(null);

    const productHardLimitReached = useMemo(() => {
        return appConfigs?.products_hard_limit > 0 && productsTotal >= appConfigs?.products_hard_limit;
    }, [appConfigs?.products_hard_limit, productsTotal]);

    const productSoftLimitReached = useMemo(() => {
        return appConfigs?.products_soft_limit > 0 && productsTotal >= appConfigs?.products_soft_limit;
    }, [appConfigs?.products_soft_limit, productsTotal]);

    const isActive = useCallback((fund: FundProvider) => {
        return (
            (fund.allow_budget || fund.allow_products || fund.allow_some_products) &&
            fund.fund.state != 'closed' &&
            !fund.dismissed
        );
    }, []);

    useEffect(() => {
        setProgress(0);

        Promise.all([
            providerFundService.listFunds(activeOrganization.id).then((res) => {
                setFundsTotal(res.data.data.filter(isActive).length);
            }),
            productService.list(activeOrganization.id, { per_page: 1 }).then((res) => {
                setProductsTotal(res.data.meta.total);
            }),
            employeeService.list(activeOrganization.id, { per_page: 1 }).then((res) => {
                setEmployeesTotal(res.data.meta.total);
            }),
            transactionService.list(envData.client_type, activeOrganization.id, { per_page: 1 }).then((res) => {
                setTransactionsTotal(res.data.meta.total_amount_locale);
            }),
        ]).finally(() => {
            setProgress(100);
            setLoaded(true);
        });
    }, [
        activeOrganization.id,
        providerFundService,
        transactionService,
        employeeService,
        productService,
        setProgress,
        isActive,
        envData,
    ]);

    if (!loaded) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="provider-overview" data-dusk="providerOverview">
                <div className="block block-charts" data-dusk="fundsTitle">
                    <div className="chart-row">
                        {hasPermission(activeOrganization, Permission.MANAGE_PRODUCTS) && (
                            <div className="card">
                                <div className="card-section">
                                    <div className="chart-control chart-control-provider_overview">
                                        <div className="chart-label">Aanbod</div>
                                        <div className="chart-value chart-value">
                                            <div className="chart-value_value">{productsTotal}</div>
                                            <div className="chart-value_label"> Producten of diensten</div>
                                        </div>
                                        <div className="chart-action">
                                            <StateNavLink
                                                name={DashboardRoutes.PRODUCT_CREATE}
                                                params={{ organizationId: activeOrganization.id }}
                                                className={`button button-primary ${
                                                    productHardLimitReached ? 'disabled' : ''
                                                }`}
                                                id="add_product"
                                                disabled={productHardLimitReached}>
                                                <em className="mdi mdi-plus-circle icon-start" />
                                                Toevoegen
                                                {productSoftLimitReached
                                                    ? ` (${productsTotal} / ${appConfigs?.products_hard_limit})`
                                                    : ``}
                                            </StateNavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {hasPermission(activeOrganization, Permission.MANAGE_PROVIDER_FUNDS) && (
                            <div className="card">
                                <div className="card-section">
                                    <div className="chart-control chart-control-provider_overview">
                                        <div className="chart-label">Fondsen</div>
                                        <div className="chart-value chart-value">
                                            <div className="chart-value_value">{fundsTotal}</div>
                                            <div className="chart-value_label">Actieve fondsen</div>
                                        </div>
                                        <div className="chart-action">
                                            <StateNavLink
                                                name={DashboardRoutes.PROVIDER_FUNDS}
                                                params={{ organizationId: activeOrganization.id }}
                                                className="button button-primary">
                                                <em className="mdi mdi-eye-outline icon-start" />
                                                Bekijken
                                            </StateNavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {hasPermission(activeOrganization, Permission.VIEW_FINANCES) && (
                            <div className="card">
                                <div className="card-section">
                                    <div className="chart-control chart-control-provider_overview">
                                        <div className="chart-label">Transacties</div>
                                        <div className="chart-value chart-value">
                                            <div className="chart-value_value">{transactionsTotal}</div>
                                            <div className="chart-value_label">Totaal aan inkomsten</div>
                                        </div>
                                        <div className="chart-action">
                                            <StateNavLink
                                                name={DashboardRoutes.TRANSACTIONS}
                                                params={{ organizationId: activeOrganization.id }}
                                                className="button button-primary">
                                                <em className="mdi mdi-eye-outline icon-start" />
                                                Bekijken
                                            </StateNavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {hasPermission(activeOrganization, Permission.MANAGE_EMPLOYEES) && (
                            <div className="card">
                                <div className="card-section">
                                    <div className="chart-control chart-control-provider_overview">
                                        <div className="chart-label">Medewerkers</div>
                                        <div className="chart-value chart-value">
                                            <div className="chart-value_value">{employeesTotal}</div>
                                            <div className="chart-value_label">Aangesloten medewerkers</div>
                                        </div>
                                        <div className="chart-action">
                                            <StateNavLink
                                                name={DashboardRoutes.EMPLOYEES}
                                                params={{ organizationId: activeOrganization.id }}
                                                className="button button-primary">
                                                <em className="mdi mdi-eye-outline icon-start" />
                                                Bekijken
                                            </StateNavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ProductsRequiredNotification organization={activeOrganization} />
        </Fragment>
    );
}
