import React, { Fragment } from 'react';
import LayoutAsideNavItem from './LayoutAsideNavItem';
import { hasPermission } from '../../../helpers/utils';
import Organization from '../../../props/models/Organization';
import useEnvData from '../../../hooks/useEnvData';
import useTranslate from '../../../hooks/useTranslate';

export default function LayoutAsideSponsor({ organization }: { organization: Organization }) {
    const envData = useEnvData();
    const translate = useTranslate();
    const { allow_bi_connection, allow_2fa_restrictions, allow_pre_checks, allow_payouts } = organization;

    return (
        <div className="sidebar-nav">
            <div className="sidebar-section-title">Organisatie</div>

            <LayoutAsideNavItem
                name={'Fondsen'}
                icon={'my_funds'}
                route={'organization-funds'}
                routeParams={{ organizationId: organization?.id }}
                show={hasPermission(organization, ['manage_funds', 'view_finances', 'view_funds'], false)}
                id={'funds'}
            />
            <LayoutAsideNavItem
                name={'Tegoeden'}
                icon={'vouchers'}
                route={'vouchers'}
                routeParams={{ organizationId: organization?.id }}
                show={hasPermission(organization, ['manage_vouchers', 'view_vouchers'])}
                id={'vouchers'}
                dusk={'vouchersPage'}
            />
            <LayoutAsideNavItem
                name={'Declaraties'}
                icon={'reimbursements'}
                route={'reimbursements'}
                routeParams={{ organizationId: organization?.id }}
                show={hasPermission(organization, 'manage_reimbursements')}
                id={'reimbursements'}
                dusk={'reimbursementsPage'}
            />
            <LayoutAsideNavItem
                name={'Medewerkers'}
                icon={'list'}
                route={'employees'}
                routeParams={{ organizationId: organization?.id }}
                show={hasPermission(organization, 'manage_employees')}
                id={'employees'}
                dusk={'employeesPage'}
            />
            <LayoutAsideNavItem
                name={'Aanbieders'}
                icon={'people'}
                route={'sponsor-provider-organizations'}
                routeParams={{ organizationId: organization?.id }}
                show={hasPermission(organization, 'manage_providers')}
                id={'providers'}
            />
            <LayoutAsideNavItem
                name={'Aanvragers'}
                icon={'file_csv'}
                route={'csv-validation'}
                routeParams={{ organizationId: organization?.id }}
                show={hasPermission(organization, 'validate_records')}
                id={'requesters'}
            />
            <LayoutAsideNavItem
                name={'Uitbetalingen'}
                icon={'payouts'}
                route={'payouts'}
                routeParams={{ organizationId: organization?.id }}
                show={allow_payouts && hasPermission(organization, 'manage_payouts')}
                id={'payouts'}
            />
            <LayoutAsideNavItem
                name={'Bank integraties'}
                icon={'bank-connections'}
                route={'bank-connections'}
                routeParams={{ organizationId: organization?.id }}
                show={hasPermission(organization, 'manage_bank_connections')}
            />
            <LayoutAsideNavItem
                name={'BI integraties'}
                icon={'bi-connection'}
                route={'bi-connection'}
                routeParams={{ organizationId: organization?.id }}
                show={allow_bi_connection && hasPermission(organization, 'manage_bi_connection')}
            />
            <LayoutAsideNavItem
                name={'Pre–Check'}
                icon={'pre-check'}
                route={'pre-check'}
                routeParams={{ organizationId: organization?.id }}
                show={allow_pre_checks && hasPermission(organization, 'manage_implementation')}
            />
            <LayoutAsideNavItem
                name={'Beveiliging'}
                icon={'organization-security'}
                route={'organization-security'}
                routeParams={{ organizationId: organization?.id }}
                show={allow_2fa_restrictions && hasPermission(organization, 'manage_organization')}
            />
            <LayoutAsideNavItem
                name={'Activiteitenlogboek'}
                icon={'organization-logs'}
                route={'organization-logs'}
                routeParams={{ organizationId: organization?.id }}
                show={true}
                id={'organization-logs'}
            />

            {hasPermission(organization, 'view_finances') && (
                <Fragment>
                    <div className="sidebar-section-title">{translate('menu.financial')}</div>

                    {hasPermission(organization, 'view_finances') && (
                        <Fragment>
                            <LayoutAsideNavItem
                                name={'Overzicht'}
                                icon={'financial_dashboard_overview'}
                                route={'financial-dashboard-overview'}
                                routeParams={{ organizationId: organization?.id }}
                                show={true}
                                id={'financial_dashboard_overview'}
                            />
                            <LayoutAsideNavItem
                                name={'Statistieken'}
                                icon={'financial_dashboard'}
                                route={'financial-dashboard'}
                                routeParams={{ organizationId: organization?.id }}
                                show={true}
                                id={'financial_dashboard'}
                            />
                            <LayoutAsideNavItem
                                name={'Betaalopdrachten'}
                                icon={'transactions'}
                                route={'transactions'}
                                routeParams={{ organizationId: organization?.id }}
                                show={true}
                                id={'transactions'}
                                dusk={'transactionsPage'}
                            />
                        </Fragment>
                    )}

                    {hasPermission(organization, 'view_funds_extra_payments') && (
                        <LayoutAsideNavItem
                            name={'Bijbetalingen'}
                            icon={'extra-payments'}
                            route={'extra-payments'}
                            routeParams={{ organizationId: organization?.id }}
                            show={true}
                            id={'extra-payments'}
                            dusk={'extraPaymentsPage'}
                        />
                    )}
                </Fragment>
            )}

            {hasPermission(
                organization,
                ['manage_implementation_notifications', 'manage_implementation', 'manage_implementation_cms'],
                false,
            ) && (
                <Fragment>
                    <div className="sidebar-section-title">{translate('menu.implementation')}</div>
                    <LayoutAsideNavItem
                        name={'Webshops'}
                        icon={'implementation'}
                        route={'implementations'}
                        routeParams={{ organizationId: organization?.id }}
                        show={hasPermission(
                            organization,
                            ['manage_implementation', 'manage_implementation_cms'],
                            false,
                        )}
                    />
                    <LayoutAsideNavItem
                        name={'Systeemberichten'}
                        icon={'system_notifications'}
                        route={'implementation-notifications'}
                        routeParams={{ organizationId: organization?.id }}
                        show={hasPermission(organization, 'manage_implementation_notifications')}
                    />
                </Fragment>
            )}

            <div className="sidebar-section-title">{translate('menu.personal')}</div>

            <LayoutAsideNavItem
                name={'Feedback'}
                icon={'feedback'}
                route={'feedback'}
                show={true}
                routeParams={{ organizationId: organization?.id }}
            />

            {!envData.config.features_hide && (
                <LayoutAsideNavItem
                    name={'Marketplace'}
                    icon={'features'}
                    route={'features'}
                    show={true}
                    routeParams={{ organizationId: organization?.id }}
                />
            )}
        </div>
    );
}
