import React from 'react';
import LayoutAsideNavGroup from './elements/LayoutAsideNavGroup';
import Organization from '../../../props/models/Organization';
import { hasPermission } from '../../../helpers/utils';
import {
    IconOverview,
    IconOverviewActive,
    IconSales,
    IconSalesActive,
    IconFinancial,
    IconFinancialActive,
} from './icons/LayoutAsideIcons';
import LayoutAsideGroupOrganization from './groups/LayoutAsideGroupOrganization';
import LayoutAsideGroupPersonal from './groups/LayoutAsideGroupPersonal';
import LayoutAsideGroupHelp from './groups/LayoutAsideGroupHelp';
import { usePinnedMenuGroups } from './hooks/usePinnedMenuGroups';

export default function LayoutAsideProvider({ organization }: { organization: Organization }) {
    const [pinnedGroups, setPinnedGroups] = usePinnedMenuGroups('pinnedMenuGroupsProvider');

    return (
        <div className="sidebar-nav">
            {/* Overzicht */}
            <LayoutAsideNavGroup
                id="menu_overview"
                name="Overzicht"
                state="provider-overview"
                stateParams={{ organizationId: organization?.id }}
                show={hasPermission(organization, 'manage_employees')}
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
                        state: 'products',
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, 'manage_products'),
                    },
                    {
                        id: 'reservations',
                        name: 'Reserveringen',
                        state: 'reservations',
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, 'scan_vouchers'),
                        dusk: 'reservationsPage',
                    },
                    {
                        id: 'funds',
                        name: 'Fondsen',
                        state: 'provider-funds',
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, 'manage_provider_funds'),
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
                items={[
                    {
                        id: 'transactions',
                        name: 'Transacties',
                        state: 'transactions',
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, 'view_finances'),
                    },
                    {
                        id: 'payment-methods',
                        name: 'Bijbetaalmethoden',
                        state: 'payment-methods',
                        stateParams: { organizationId: organization?.id },
                        show:
                            organization?.can_view_provider_extra_payments &&
                            hasPermission(organization, 'manage_payment_methods'),
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
