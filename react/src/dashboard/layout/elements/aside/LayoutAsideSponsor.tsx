import React from 'react';
import { hasPermission } from '../../../helpers/utils';
import Organization, { Permission } from '../../../props/models/Organization';
import LayoutAsideNavGroup from './elements/LayoutAsideNavGroup';
import useAppConfigs from '../../../hooks/useAppConfigs';
import {
    IconConnections,
    IconConnectionsActive,
    IconFinancial,
    IconFinancialActive,
    IconFundRequests,
    IconFundRequestsActive,
    IconFunds,
    IconFundsActive,
    IconParticipants,
    IconParticipantsActive,
    IconReports,
    IconReportsActive,
    IconSponsorProviders,
    IconSponsorProvidersActive,
    IconVouchers,
    IconVouchersActive,
    IconWebshops,
    IconWebshopsActive,
} from './icons/LayoutAsideIcons';
import LayoutAsideGroupOrganization from './groups/LayoutAsideGroupOrganization';
import LayoutAsideGroupPersonal from './groups/LayoutAsideGroupPersonal';
import LayoutAsideGroupHelp from './groups/LayoutAsideGroupHelp';
import { usePinnedMenuGroups } from './hooks/usePinnedMenuGroups';
import useIsSponsorPanel from '../../../hooks/useIsSponsorPanel';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function LayoutAsideSponsor({ organization }: { organization: Organization }) {
    const appConfigs = useAppConfigs();
    const isSponsorPanel = useIsSponsorPanel();

    const [pinnedGroups, setPinnedGroups] = usePinnedMenuGroups('pinnedMenuGroupsSponsor');

    return (
        <div className="sidebar-nav">
            {/* Fondsen */}
            <LayoutAsideNavGroup
                id="menu_funds"
                name={'Fondsen'}
                state={DashboardRoutes.ORGANIZATION_FUNDS}
                stateParams={{ organizationId: organization?.id }}
                show={hasPermission(
                    organization,
                    [Permission.MANAGE_FUNDS, Permission.VIEW_FINANCES, Permission.VIEW_FUNDS],
                    false,
                )}
                icon={<IconFunds />}
                iconActive={<IconFundsActive />}
                pinnedGroups={pinnedGroups}
                setPinnedGroups={setPinnedGroups}
            />

            {/* Aanvragen en klaarzetten */}
            <LayoutAsideNavGroup
                id="menu_fund_requests"
                name={'Aanvragen en klaarzetten'}
                icon={<IconFundRequests />}
                iconActive={<IconFundRequestsActive />}
                pinnedGroups={pinnedGroups}
                setPinnedGroups={setPinnedGroups}
                dusk={'asideMenuGroupFundRequests'}
                items={[
                    {
                        id: 'requesters',
                        name: 'Klaarzetten',
                        state: DashboardRoutes.CSV_VALIDATION,
                        dusk: 'csvValidationPage',
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(
                            organization,
                            [Permission.VALIDATE_RECORDS, Permission.MANAGE_VALIDATORS],
                            false,
                        ),
                    },
                    {
                        id: 'prevalidation_requests',
                        name: 'Prevalidation requests',
                        state: DashboardRoutes.PREVALIDATION_REQUESTS,
                        dusk: 'csvPrevalidationRequestsPage',
                        stateParams: { organizationId: organization?.id },
                        show:
                            organization.allow_prevalidation_requests &&
                            hasPermission(
                                organization,
                                [Permission.VALIDATE_RECORDS, Permission.MANAGE_VALIDATORS],
                                false,
                            ),
                    },
                    {
                        id: 'fund_requests',
                        name: 'Aanvragen',
                        state: DashboardRoutes.FUND_REQUESTS,
                        dusk: 'fundRequestsPage',
                        stateParams: { organizationId: organization?.id },
                        show:
                            appConfigs?.organizations?.funds?.fund_requests &&
                            hasPermission(
                                organization,
                                [Permission.VALIDATE_RECORDS, Permission.MANAGE_VALIDATORS],
                                false,
                            ),
                    },
                    {
                        id: 'fund_forms',
                        name: 'E-formulieren',
                        state: DashboardRoutes.FUND_FORMS,
                        stateParams: { organizationId: organization?.id },
                        show:
                            appConfigs?.organizations?.funds?.fund_requests &&
                            hasPermission(organization, [Permission.MANAGE_FUNDS], false),
                    },
                ]}
            />

            {/* Aanbod & Aanbieders */}
            <LayoutAsideNavGroup
                id="menu_products_and_providers"
                name={'Aanbod & Aanbieders'}
                icon={<IconSponsorProviders />}
                iconActive={<IconSponsorProvidersActive />}
                pinnedGroups={pinnedGroups}
                setPinnedGroups={setPinnedGroups}
                dusk={'asideMenuGroupProviders'}
                items={[
                    {
                        id: 'products',
                        name: 'Aanbod',
                        state: DashboardRoutes.SPONSOR_PRODUCTS,
                        stateParams: { organizationId: organization?.id },
                        show:
                            organization.allow_product_updates &&
                            hasPermission(organization, Permission.MANAGE_PROVIDERS),
                    },
                    {
                        id: 'providers',
                        name: 'Aanbieders',
                        state: DashboardRoutes.SPONSOR_PROVIDER_ORGANIZATIONS,
                        dusk: 'providersPage',
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, Permission.MANAGE_PROVIDERS),
                    },
                ]}
            />

            {/* Deelnemers */}
            <LayoutAsideNavGroup
                id="menu_participants"
                name={'Deelnemers'}
                icon={<IconParticipants />}
                iconActive={<IconParticipantsActive />}
                pinnedGroups={pinnedGroups}
                setPinnedGroups={setPinnedGroups}
                dusk={'asideMenuGroupIdentities'}
                items={[
                    {
                        id: 'identities',
                        name: 'Personen',
                        state: DashboardRoutes.IDENTITIES,
                        stateParams: { organizationId: organization?.id },
                        dusk: 'identitiesPage',
                        show:
                            organization.allow_profiles &&
                            hasPermission(
                                organization,
                                [Permission.VIEW_IDENTITIES, Permission.MANAGE_IDENTITIES],
                                false,
                            ),
                    },
                    {
                        id: 'households',
                        name: 'Huishoudens',
                        state: DashboardRoutes.HOUSEHOLDS,
                        stateParams: { organizationId: organization?.id },
                        dusk: 'householdsPage',
                        show:
                            organization.allow_profiles_households &&
                            hasPermission(
                                organization,
                                [Permission.VIEW_IDENTITIES, Permission.MANAGE_IDENTITIES],
                                false,
                            ),
                    },
                ]}
            />

            {/* Toekenningen */}
            <LayoutAsideNavGroup
                id="menu_vouchers"
                name={'Toekenningen'}
                icon={<IconVouchers />}
                iconActive={<IconVouchersActive />}
                pinnedGroups={pinnedGroups}
                setPinnedGroups={setPinnedGroups}
                dusk={'asideMenuGroupVouchers'}
                items={[
                    {
                        id: 'vouchers',
                        name: 'Tegoeden',
                        state: DashboardRoutes.VOUCHERS,
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, [Permission.MANAGE_VOUCHERS, Permission.VIEW_VOUCHERS]),
                        dusk: 'vouchersPage',
                    },
                    {
                        id: 'reimbursements',
                        name: 'Declaraties',
                        state: DashboardRoutes.REIMBURSEMENTS,
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, Permission.MANAGE_REIMBURSEMENTS),
                        dusk: 'reimbursementsPage',
                    },
                    {
                        id: 'payouts',
                        name: 'Uitbetalingen',
                        state: DashboardRoutes.PAYOUTS,
                        stateParams: { organizationId: organization?.id },
                        show: organization.allow_payouts && hasPermission(organization, Permission.MANAGE_PAYOUTS),
                    },
                    {
                        id: 'physical_cards',
                        name: 'Fysieke passen',
                        state: DashboardRoutes.PHYSICAL_CARDS,
                        stateParams: { organizationId: organization?.id },
                        show:
                            hasPermission(organization, [Permission.MANAGE_VOUCHERS, Permission.VIEW_VOUCHERS]) &&
                            organization.allow_physical_cards,
                    },
                ]}
            />

            {/* Financiële afhandeling */}
            <LayoutAsideNavGroup
                id="menu_financial"
                name={'Financiële afhandeling'}
                icon={<IconFinancial />}
                iconActive={<IconFinancialActive />}
                pinnedGroups={pinnedGroups}
                setPinnedGroups={setPinnedGroups}
                dusk={'asideMenuGroupFinancial'}
                items={[
                    {
                        id: 'transactions',
                        name: 'Betaalopdrachten',
                        state: DashboardRoutes.TRANSACTIONS,
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, Permission.VIEW_FINANCES),
                        dusk: 'transactionsPage',
                    },
                    {
                        id: 'extra-payments',
                        name: 'Bijbetalingen',
                        state: DashboardRoutes.EXTRA_PAYMENTS,
                        show: hasPermission(organization, Permission.VIEW_FUNDS_EXTRA_PAYMENTS),
                        stateParams: { organizationId: organization?.id },
                        dusk: 'extraPaymentsPage',
                    },
                ]}
            />

            {/* Rapportages */}
            <LayoutAsideNavGroup
                id="menu_reports"
                name={'Rapportages'}
                icon={<IconReports />}
                iconActive={<IconReportsActive />}
                pinnedGroups={pinnedGroups}
                setPinnedGroups={setPinnedGroups}
                dusk={'asideMenuGroupReports'}
                items={[
                    {
                        id: 'financial_dashboard',
                        name: 'Statistieken',
                        state: DashboardRoutes.FINANCIAL_DASHBOARD,
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, Permission.VIEW_FINANCES),
                        dusk: 'financialDashboardPage',
                    },
                    {
                        id: 'financial_dashboard_overview',
                        name: 'Financieel overzicht',
                        state: DashboardRoutes.FINANCIAL_DASHBOARD_OVERVIEW,
                        show: hasPermission(organization, Permission.VIEW_FINANCES),
                        stateParams: { organizationId: organization?.id },
                        dusk: 'financialDashboardOverviewPage',
                    },
                ]}
            />

            {/* Website(s) */}
            {organization?.implementations?.length > 0 && (
                <LayoutAsideNavGroup
                    id="menu_websites"
                    name={organization?.implementations?.length > 1 ? 'Websites' : 'Website'}
                    icon={<IconWebshops />}
                    iconActive={<IconWebshopsActive />}
                    pinnedGroups={pinnedGroups}
                    setPinnedGroups={setPinnedGroups}
                    items={[
                        {
                            name: 'Content',
                            state:
                                organization?.implementations?.length > 1
                                    ? DashboardRoutes.IMPLEMENTATIONS
                                    : DashboardRoutes.IMPLEMENTATION,
                            stateParams: { organizationId: organization?.id, id: organization?.implementations[0]?.id },
                            show:
                                organization?.implementations?.length > 0 &&
                                hasPermission(
                                    organization,
                                    [Permission.MANAGE_IMPLEMENTATION, Permission.MANAGE_IMPLEMENTATION_CMS],
                                    false,
                                ),
                        },
                        {
                            name: 'Vertalingen',
                            state: DashboardRoutes.ORGANIZATION_TRANSLATIONS,
                            stateParams: { organizationId: organization?.id, id: organization?.implementations[0]?.id },
                            show:
                                isSponsorPanel &&
                                organization.allow_translations &&
                                organization?.implementations?.length === 1 &&
                                hasPermission(organization, Permission.MANAGE_IMPLEMENTATION),
                        },
                        {
                            name: 'Regelingencheck',
                            state: DashboardRoutes.IMPLEMENTATION_PRE_CHECK,
                            stateParams: { organizationId: organization?.id, id: organization?.implementations[0]?.id },
                            show:
                                organization.allow_pre_checks &&
                                organization?.implementations?.length === 1 &&
                                hasPermission(organization, Permission.MANAGE_IMPLEMENTATION),
                        },
                        {
                            name: 'Systeemberichten',
                            state: DashboardRoutes.IMPLEMENTATION_NOTIFICATIONS,
                            stateParams: { organizationId: organization?.id, id: organization?.implementations[0]?.id },
                            show:
                                organization?.implementations?.length === 1 &&
                                hasPermission(organization, Permission.MANAGE_IMPLEMENTATION_NOTIFICATIONS),
                        },
                    ]}
                />
            )}

            {/* Koppelingen */}
            <LayoutAsideNavGroup
                id="menu_connections"
                name={'Koppelingen'}
                icon={<IconConnections />}
                iconActive={<IconConnectionsActive />}
                pinnedGroups={pinnedGroups}
                setPinnedGroups={setPinnedGroups}
                items={[
                    {
                        name: 'Bank',
                        state: DashboardRoutes.BANK_CONNECTIONS,
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, Permission.MANAGE_BANK_CONNECTIONS),
                    },
                    {
                        name: 'BI-tool',
                        state: DashboardRoutes.BI_CONNECTION,
                        stateParams: { organizationId: organization?.id },
                        show:
                            organization.allow_bi_connection &&
                            hasPermission(organization, Permission.MANAGE_BI_CONNECTION),
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
