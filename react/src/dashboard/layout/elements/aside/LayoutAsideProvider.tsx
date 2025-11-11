import React from 'react';
import LayoutAsideNavGroup from './elements/LayoutAsideNavGroup';
import Organization, { Permission } from '../../../props/models/Organization';
import { hasPermission } from '../../../helpers/utils';
import {
    IconFinancial,
    IconFinancialActive,
    IconOverview,
    IconOverviewActive,
    IconSales,
    IconSalesActive,
} from './icons/LayoutAsideIcons';
import LayoutAsideGroupOrganization from './groups/LayoutAsideGroupOrganization';
import LayoutAsideGroupPersonal from './groups/LayoutAsideGroupPersonal';
import LayoutAsideGroupHelp from './groups/LayoutAsideGroupHelp';
import { usePinnedMenuGroups } from './hooks/usePinnedMenuGroups';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function LayoutAsideProvider({ organization }: { organization: Organization }) {
    const [pinnedGroups, setPinnedGroups] = usePinnedMenuGroups('pinnedMenuGroupsProvider');

    return (
        <div className="sidebar-nav">
            {/* Overzicht */}
            <LayoutAsideNavGroup
                id="menu_overview"
                name="Overzicht"
                state={DashboardRoutes.PROVIDER_OVERVIEW}
                stateParams={{ organizationId: organization?.id }}
                show={hasPermission(organization, Permission.MANAGE_EMPLOYEES)}
                icon={<IconOverview />}
                iconActive={<IconOverviewActive />}
                pinnedGroups={pinnedGroups}
                setPinnedGroups={setPinnedGroups}
            />

            {/* Verkoop */}
            <LayoutAsideNavGroup
                id="menu_sales"
                name="Verkoop"
                icon={<IconSales />}
                iconActive={<IconSalesActive />}
                pinnedGroups={pinnedGroups}
                setPinnedGroups={setPinnedGroups}
                dusk={'asideMenuGroupSales'}
                items={[
                    {
                        id: 'products',
                        name: 'Aanbod',
                        state: DashboardRoutes.PRODUCTS,
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, Permission.MANAGE_PRODUCTS),
                    },
                    {
                        id: 'reservations',
                        name: 'Reserveringen',
                        state: DashboardRoutes.RESERVATIONS,
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, Permission.SCAN_VOUCHERS),
                        dusk: 'reservationsPage',
                    },
                    {
                        id: 'funds',
                        name: 'Fondsen',
                        state: DashboardRoutes.PROVIDER_FUNDS,
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, Permission.MANAGE_PROVIDER_FUNDS),
                        dusk: 'fundsPage',
                    },
                ]}
            />

            {/* Financieel */}
            <LayoutAsideNavGroup
                id="menu_financial"
                name="Financieel"
                icon={<IconFinancial />}
                iconActive={<IconFinancialActive />}
                pinnedGroups={pinnedGroups}
                setPinnedGroups={setPinnedGroups}
                dusk={'asideMenuGroupFinancial'}
                items={[
                    {
                        id: 'transactions',
                        name: 'Transacties',
                        state: DashboardRoutes.TRANSACTIONS,
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, Permission.VIEW_FINANCES),
                        dusk: 'transactionsPage',
                    },
                    {
                        id: 'payment-methods',
                        name: 'Bijbetaalmethoden',
                        state: DashboardRoutes.PAYMENT_METHODS,
                        stateParams: { organizationId: organization?.id },
                        show:
                            organization?.can_view_provider_extra_payments &&
                            hasPermission(organization, Permission.MANAGE_PAYMENT_METHODS),
                    },
                ]}
            />

            {/* Organisatie */}
            <LayoutAsideGroupOrganization
                organization={organization}
                pinnedGroups={pinnedGroups}
                setPinnedGroups={setPinnedGroups}
            />

            {/* Persoonlijke instellingen */}
            <LayoutAsideGroupPersonal
                organization={organization}
                pinnedGroups={pinnedGroups}
                setPinnedGroups={setPinnedGroups}
            />

            {/* Ondersteuning */}
            <LayoutAsideGroupHelp
                organization={organization}
                pinnedGroups={pinnedGroups}
                setPinnedGroups={setPinnedGroups}
            />
        </div>
    );
}
