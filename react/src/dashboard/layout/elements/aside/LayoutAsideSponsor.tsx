import React from 'react';
import { hasPermission } from '../../../helpers/utils';
import Organization from '../../../props/models/Organization';
import LayoutAsideNavGroup from './elements/LayoutAsideNavGroup';
import useAppConfigs from '../../../hooks/useAppConfigs';
import {
    IconFunds,
    IconFundsActive,
    IconReports,
    IconReportsActive,
    IconVouchers,
    IconVouchersActive,
    IconWebshops,
    IconWebshopsActive,
    IconFinancial,
    IconFinancialActive,
    IconConnections,
    IconConnectionsActive,
    IconParticipants,
    IconParticipantsActive,
    IconFundRequests,
    IconFundRequestsActive,
    IconSponsorProviders,
    IconSponsorProvidersActive,
} from './icons/LayoutAsideIcons';
import LayoutAsideGroupOrganization from './groups/LayoutAsideGroupOrganization';
import LayoutAsideGroupPersonal from './groups/LayoutAsideGroupPersonal';
import LayoutAsideGroupHelp from './groups/LayoutAsideGroupHelp';
import { usePinnedMenuGroups } from './hooks/usePinnedMenuGroups';
import useIsSponsorPanel from '../../../hooks/useIsSponsorPanel';

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
                state={'organization-funds'}
                stateParams={{ organizationId: organization?.id }}
                show={hasPermission(organization, ['manage_funds', 'view_finances', 'view_funds'], false)}
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
                        state: 'csv-validation',
                        dusk: 'csvValidationPage',
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, ['validate_records', 'manage_validators'], false),
                    },
                    {
                        id: 'fund_requests',
                        name: 'Aanvragen',
                        state: 'fund-requests',
                        dusk: 'fundRequestsPage',
                        stateParams: { organizationId: organization?.id },
                        show:
                            appConfigs?.organizations?.funds?.fund_requests &&
                            hasPermission(organization, ['validate_records', 'manage_validators'], false),
                    },
                    {
                        id: 'fund_forms',
                        name: 'E-formulieren',
                        state: 'fund-forms',
                        stateParams: { organizationId: organization?.id },
                        show:
                            appConfigs?.organizations?.funds?.fund_requests &&
                            hasPermission(organization, ['manage_funds'], false),
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
                        state: 'sponsor-products',
                        stateParams: { organizationId: organization?.id },
                        show: organization.allow_product_updates && hasPermission(organization, 'manage_providers'),
                    },
                    {
                        id: 'providers',
                        name: 'Aanbieders',
                        state: 'sponsor-provider-organizations',
                        dusk: 'providersPage',
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, 'manage_providers'),
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
                        state: 'identities',
                        stateParams: { organizationId: organization?.id },
                        dusk: 'identitiesPage',
                        show:
                            organization.allow_profiles &&
                            hasPermission(organization, ['view_identities', 'manage_identities'], false),
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
                        state: 'vouchers',
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, ['manage_vouchers', 'view_vouchers']),
                        dusk: 'vouchersPage',
                    },
                    {
                        id: 'reimbursements',
                        name: 'Declaraties',
                        state: 'reimbursements',
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, 'manage_reimbursements'),
                        dusk: 'reimbursementsPage',
                    },
                    {
                        id: 'payouts',
                        name: 'Uitbetalingen',
                        state: 'payouts',
                        stateParams: { organizationId: organization?.id },
                        show: organization.allow_payouts && hasPermission(organization, 'manage_payouts'),
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
                        state: 'transactions',
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, 'view_finances'),
                        dusk: 'transactionsPage',
                    },
                    {
                        id: 'extra-payments',
                        name: 'Bijbetalingen',
                        state: 'extra-payments',
                        show: hasPermission(organization, 'view_funds_extra_payments'),
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
                        state: 'financial-dashboard',
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, 'view_finances'),
                        dusk: 'financialDashboardPage',
                    },
                    {
                        id: 'financial_dashboard_overview',
                        name: 'Financieel overzicht',
                        state: 'financial-dashboard-overview',
                        show: hasPermission(organization, 'view_finances'),
                        stateParams: { organizationId: organization?.id },
                        dusk: 'financialDashboardOverviewPage',
                    },
                ]}
            />

            {/* Website(s) */}
            <LayoutAsideNavGroup
                id="menu_websites"
                name={'Website(s)'}
                icon={<IconWebshops />}
                iconActive={<IconWebshopsActive />}
                pinnedGroups={pinnedGroups}
                setPinnedGroups={setPinnedGroups}
                items={[
                    {
                        name: 'Content',
                        state: 'implementations',
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(
                            organization,
                            ['manage_implementation', 'manage_implementation_cms'],
                            false,
                        ),
                    },
                    {
                        name: 'Vertalingen',
                        state: 'organizations-translations',
                        stateParams: { organizationId: organization?.id },
                        show:
                            isSponsorPanel &&
                            organization.allow_translations &&
                            hasPermission(organization, 'manage_implementation'),
                    },
                    {
                        name: 'Regelingencheck',
                        state: 'pre-check',
                        stateParams: { organizationId: organization?.id },
                        show: organization.allow_pre_checks && hasPermission(organization, 'manage_implementation'),
                    },
                    {
                        name: 'Systeemberichten',
                        state: 'implementation-notifications',
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, 'manage_implementation_notifications'),
                    },
                ]}
            />

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
                        state: 'bank-connections',
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, 'manage_bank_connections'),
                    },
                    {
                        name: 'BI-tool',
                        state: 'bi-connection',
                        stateParams: { organizationId: organization?.id },
                        show: organization.allow_bi_connection && hasPermission(organization, 'manage_bi_connection'),
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
