import React from 'react';
import LayoutAsideNavItem from './LayoutAsideNavItem';
import { hasPermission } from '../../../helpers/utils';
import Organization from '../../../props/models/Organization';

export default function LayoutAsideProvider({ organization }: { organization: Organization }) {
    return (
        <div className="sidebar-nav">
            <div className="sidebar-section-title">Organisatie</div>
            <LayoutAsideNavItem
                name={'Overzicht'}
                icon={'provider-overview'}
                route={'provider-overview'}
                routeParams={{ organizationId: organization?.id }}
                show={hasPermission(organization, 'manage_employees')}
                id={'provider-overview'}
            />
            <LayoutAsideNavItem
                name={'Vestigingen'}
                icon={'offices'}
                route={'offices'}
                routeParams={{ organizationId: organization?.id }}
                show={hasPermission(organization, 'manage_offices')}
                id={'offices'}
            />
            <LayoutAsideNavItem
                name={'Betaalopdrachten'}
                icon={'transactions'}
                route={'transactions'}
                routeParams={{ organizationId: organization?.id }}
                show={hasPermission(organization, 'view_finances')}
                id={'transactions'}
            />
            <LayoutAsideNavItem
                name={'Fondsen'}
                icon={'funds'}
                route={'provider-funds'}
                routeParams={{ organizationId: organization?.id }}
                show={hasPermission(organization, 'manage_provider_funds')}
                id={'funds'}
            />
            <LayoutAsideNavItem
                name={'Aanbod'}
                icon={'products'}
                route={'products'}
                routeParams={{ organizationId: organization?.id }}
                show={hasPermission(organization, 'manage_products')}
                id={'products'}
            />
            <LayoutAsideNavItem
                name={'Reserveringen'}
                icon={'reservations'}
                route={'reservations'}
                routeParams={{ organizationId: organization?.id }}
                show={hasPermission(organization, 'scan_vouchers')}
                id={'reservations'}
                dusk={'reservationsPage'}
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
                name={'Bijbetaal methodes'}
                icon={'payment-methods'}
                route={'payment-methods'}
                routeParams={{ organizationId: organization?.id }}
                show={
                    organization?.can_view_provider_extra_payments &&
                    hasPermission(organization, 'manage_payment_methods')
                }
                id={'payment-methods'}
            />
            <LayoutAsideNavItem
                name={'Beveiliging'}
                icon={'organization-security'}
                route={'organization-security'}
                routeParams={{ organizationId: organization?.id }}
                show={organization.allow_2fa_restrictions && hasPermission(organization, 'manage_organization')}
                id={'requesters'}
            />
        </div>
    );
}
